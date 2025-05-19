import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { Flags } from "lighthouse";
import { loginToWebsite } from "../src/util/authentification";

export const getAllRapport = async (req: Request, res: Response): Promise<void> => {
  console.log(" Requête reçue sur /getRapport !");
  
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    // ** Démarrer Puppeteer**
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // ** Extraire les liens du site**
    const allLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a"))
        .map(link => link.href)
        .filter(href => href.startsWith(window.location.origin))
    );

    console.log("🔗 ${allLinks.length} pages trouvées.");

    // ** Créer le dossier reports si inexistant**
    const reportsDir = path.join(__dirname, "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const results: Record<string, any> = {};

    // **4 Limiter les audits à 5 en parallèle**
    const maxConcurrentAudits = 5;
    const auditPage = async (pageUrl: string) => {
      console.log("🚀 Test de ${pageUrl}...");

      try {
        const options: Flags = {
          logLevel: "info",
          output: ["html", "json"],
          port: parseInt(new URL(browser.wsEndpoint()).port, 10),
          maxWaitForLoad: 60000, // Augmente le timeout
        };

        const runnerResult = await lighthouse(pageUrl, options, undefined, page);

        if (!runnerResult || !runnerResult.lhr || !runnerResult.report) {
          console.error("⚠️ Échec de Lighthouse pour ${pageUrl}");
          return;
        }

        // const reportHtml = runnerResult.report[1] as string;
        // const reportJson = runnerResult.report[0] as string;
        // const pageName = pageUrl.replace(/[^a-zA-Z0-9]/g, "_");

        // const htmlPath = path.join(reportsDir, ${pageName}.html);
        // const jsonPath = path.join(reportsDir, ${pageName}.json);

        // fs.writeFileSync(htmlPath, reportHtml);
        // fs.writeFileSync(jsonPath, reportJson);
        const audits = runnerResult.lhr.audits;

        results[pageUrl] = {
          performance: (runnerResult.lhr.categories?.performance?.score ?? 0) * 100,
          accessibility: (runnerResult.lhr.categories?.accessibility?.score ?? 0) * 100,
          bestPractices: (runnerResult.lhr.categories?.["best-practices"]?.score ?? 0) * 100,
          seo: (runnerResult.lhr.categories?.seo?.score ?? 0) * 100,
          // reportPaths: { json: jsonPath, html: htmlPath },
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
      } catch (error) {
        console.error(" Erreur Lighthouse pour ${pageUrl}:", error);
      }
    };

    for (let i = 0; i < allLinks.length; i += maxConcurrentAudits) {
      const batch = allLinks.slice(i, i + maxConcurrentAudits);
      await Promise.allSettled(batch.map(auditPage));
    }

    await browser.close();

    res.json({
      message: "Audit terminé avec succès !",
      url,
      results,
    });

  } catch (error) {
    console.error(" Erreur pendant l'audit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; 