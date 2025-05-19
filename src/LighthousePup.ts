import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import lighthouse from "lighthouse";
import { Flags } from "lighthouse";

export const getRapport = async (req: Request, res: Response): Promise<void> => {
  console.log(" Requête reçue sur /getRapport !");
  try {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ error: "URL is required" });
      return;
    }

    //  Lance Puppeteer directement
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await new Promise(resolve => setTimeout(resolve, 5000));

    //  Obtenez le WebSocket Endpoint et exécutez Lighthouse
    const options: Flags = {
      logLevel: "info",
      output: ["html", "json"],
      port: parseInt(new URL(browser.wsEndpoint()).port, 10),  // Récupère le port WebSocket de Puppeteer
    };
    const runnerResult = await lighthouse(url, options, undefined, page);

    if (!runnerResult || !runnerResult.lhr || !runnerResult.report) {
      throw new Error("Lighthouse audit failed");
    }

    // Générer les rapports
    const reportHtml = runnerResult.report[1] as string;
    const reportJson = runnerResult.report[0] as string;
    const htmlPath = path.join(__dirname, "audit-report.html");
    const jsonPath = path.join(__dirname, "audit-report.json");

    fs.writeFileSync(htmlPath, reportHtml);
    fs.writeFileSync(jsonPath, reportJson);

    await browser.close(); //  Fermez Puppeteer proprement

    res.json({
      message: "Audit completed successfully!",
      url,
      scores: {
        performance: (runnerResult.lhr.categories?.performance?.score ?? 0) * 100,
        accessibility: (runnerResult.lhr.categories?.accessibility?.score ?? 0) * 100,
        bestPractices: (runnerResult.lhr.categories?.["best-practices"]?.score ?? 0) * 100,
        pwa: (runnerResult.lhr.categories?.pwa?.score ?? 0) * 100,
        seo: (runnerResult.lhr.categories?.seo?.score ?? 0) * 100,
      },
      reportPaths: {
        json: jsonPath,
        html: htmlPath,
      },
    });

  } catch (error) {
    console.error("Error during audit:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
