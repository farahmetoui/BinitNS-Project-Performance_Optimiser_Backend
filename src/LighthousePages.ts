import { Request, Response } from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import lighthouse from "lighthouse";
import { loginToWebsite } from "../src/util/authentification";
import { URL } from "url";
import * as fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { loginToWiseDashboard } from "./util/wiseAuthentication";

dotenv.config();
const ReportGenerator = require("lighthouse/report/generator/report-generator");

interface WebVitals {
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  cumulativeLayoutShift: number | null;
  totalBlockingTime: number | null;
  interactive: number | null;
  speedIndex: number | null;
  timeToFirstByte: number | null;
  firstInputDelay: number | null;
  inputLatency: number | null;
}

interface Metrics {
  [key: string]: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    webVitals: WebVitals;
  };
}

export const getAllRapport = async (req: Request, res: Response): Promise<void> => {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await loginToWiseDashboard(page);
    console.log(`URL après login : ${page.url()}`);

    // const storageData = await page.evaluate(() => Object.entries(sessionStorage));
    // console.log("Contenu de sessionStorage après login :", storageData);

    if (page.url().includes("login")) {
      throw new Error("La connexion a échoué, Puppeteer est toujours sur la page de login.");
    }


    const urls: string[] = [
      `https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/`,
      `https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/manage-portfolio/`,
      `https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/document-centre/reports/`,
    ];

    const metrics: Metrics = {};

    for (const link of urls) {
      try {
        console.log(` Navigation vers : ${link}...`);
        await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });

        console.log(`Puppeteer est bien sur ${page.url()}`);

        const wsEndpoint = browser.wsEndpoint();
        if (!wsEndpoint) throw new Error("Impossible d'obtenir l'endpoint WebSocket.");
        const port = parseInt(new URL(wsEndpoint).port, 10);
        if (isNaN(port)) throw new Error(`Port WebSocket invalide : ${wsEndpoint}`);

        const result = await lighthouse(page.url(), {
          port,
          output: "json",
          logLevel: "info",
          formFactor: undefined,
          screenEmulation: { disabled: true },


        }, undefined, page);
        // const result = await lighthouse(page.url(),undefined,undefined,page);

        if (!result || !result.lhr) {
          console.error(`Lighthouse n'a pas pu analyser ${link}`);
          continue;
        }

        const { lhr } = result;
        const audits = lhr.audits;

        metrics[link] = {
          performance: lhr.categories.performance?.score ?? 0,
          accessibility: lhr.categories.accessibility?.score ?? 0,
          bestPractices: lhr.categories["best-practices"]?.score ?? 0,
          seo: lhr.categories.seo?.score ?? 0,
          pwa: lhr.categories.pwa?.score ?? 0,
          webVitals: {
            firstContentfulPaint: audits["first-contentful-paint"]?.numericValue ?? null,
            largestContentfulPaint: audits["largest-contentful-paint"]?.numericValue ?? null,
            cumulativeLayoutShift: audits["cumulative-layout-shift"]?.numericValue ?? null,
            totalBlockingTime: audits["total-blocking-time"]?.numericValue ?? null,
            interactive: audits["interactive"]?.numericValue ?? null,
            speedIndex: audits["speed-index"]?.numericValue ?? null,
            timeToFirstByte: audits["server-response-time"]?.numericValue ?? null,
            firstInputDelay: audits["max-potential-fid"]?.numericValue ?? null,
            inputLatency: audits["estimated-input-latency"]?.numericValue ?? null,
          },
        };

        console.log(`Analyse terminée pour ${link}`);
        const downloadsDir = path.join(__dirname, 'Downloads');

        const reportJson = JSON.stringify(result.lhr, null, 2);
        const reportFilename = `lighthouse-report-${encodeURIComponent(link)}.json`;
        const fullReportPath = path.join(downloadsDir, reportFilename);
        fs.writeFileSync(fullReportPath, reportJson);

        console.log(` Rapport sauvegardé : ${fullReportPath}`);

        console.log(` Rapport sauvegardé : ${reportFilename}`);
      } catch (error) {
        console.error(`Erreur lors de l'analyse de ${link}:`, error);
      }
    }
    res.json({ metrics });
  } catch (error) {
    console.error("Échec de l'analyse :", error);
    res.status(500).json({ error: "Échec de l'analyse" });
  } finally {
    if (browser) await browser.close();
  }
};
