// import { Request, Response } from "express";
// import puppeteer from "puppeteer";

// export const getWebVitalFeatures = async (req: Request, res: Response): Promise<void> => {
//     const { url } = req.query;

//     if (!url || typeof url !== "string") {
//       res.status(400).json({ error: "Veuillez fournir une URL valide en paramètre." });
//       return;
//     }

//     try {
//       const browser = await puppeteer.launch({ headless: false });
//       const page = await browser.newPage();

//       await page.goto(url, { waitUntil: "load" });

//       // Injecter le script web-vitals
//       await page.evaluate(() => {
//         return new Promise<void>((resolve, reject) => {
//           const script = document.createElement("script");
//           script.src = "https://unpkg.com/web-vitals";
//           script.onload = () => resolve();
//           script.onerror = (err) => reject(err);
//           document.head.appendChild(script);
//         });
//       });

//       // Simuler une interaction utilisateur (nécessaire pour FID et INP)
//       await page.mouse.click(10, 10); // Simule un clic sur la page
//       await page.keyboard.press("Enter"); // Simule une pression sur la touche "Entrée"

//       // Collecte des métriques Web Vitals
//       const results = await page.evaluate(() => {
//         return new Promise((resolve) => {
//           const { onLCP, onFID, onCLS, onFCP, onINP, onTTFB } = (window as any).webVitals;

//           let metrics: Record<string, number> = {};

//           const collect = (name: string) => (metric: any) => {
//             metrics[name] = metric.value;
//             if (Object.keys(metrics).length === 6) resolve(metrics);
//           };

//           onLCP(collect("LCP"));
//           onFID(collect("FID"));
//           onCLS(collect("CLS"));
//           onFCP(collect("FCP"));
//           onINP(collect("INP"));
//           onTTFB(collect("TTFB"));
//         });
//       });

//       await browser.close();

//       // Retourner les métriques en JSON
//       res.json({ success: true, url, metrics: results });

//     } catch (error) {
//       res.status(500).json({ error: "Erreur lors de la récupération des Web Vitals.", details: (error as Error).message });
//     }
// };

import { Request, Response } from 'express';
const posthog = require('posthog-node');
import puppeteer from 'puppeteer';
import path from 'path';

const posthogClient = new posthog.PostHog('phc_kTqXQbHfTbgmAOLKsIg8YEUqSpXc8MP9tCw44zS2iY1', {
  host: 'https://eu.i.posthog.com',
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getWebVitalFeatures = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Veuillez fournir une URL valide.' });
    return;
  }

  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(120000);

    // 🟢 Vérifier l'URL avant et après le chargement
    console.log(`⏳ Navigation vers : ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });

    await delay(3000); // Petit délai pour éviter les rechargements
    const currentUrl = page.url();
    if (currentUrl !== url) {
      console.warn(`⚠️ Redirection détectée : ${url} → ${currentUrl}`);
    }

    // Vérifier si la page s'est bien chargée
    const pageContent = await page.content();
    if (!pageContent || pageContent.length < 100) {
      throw new Error("La page ne s'est pas chargée correctement ou est vide.");
    }

    // 🟢 Attendre un élément clé avant d'exécuter `evaluate`
    await page.waitForSelector('body', { timeout: 10000 });

    // 🟢 Injecter `web-vitals` et vérifier le chargement
    const webVitalsPath = path.resolve('./node_modules/web-vitals/dist/web-vitals.iife.js');
    await page.addScriptTag({ path: webVitalsPath });

    const webVitalsLoaded = await page.evaluate(() => {
      return typeof (window as any).webVitals !== 'undefined';
    });

    if (!webVitalsLoaded) {
      throw new Error("🚨 web-vitals ne s'est pas chargé correctement.");
    }

    // 🟢 Collecter les métriques Web Vitals
    const results = await page.evaluate(() => {
      return new Promise<{ [key: string]: number }>((resolve) => {
        const { onLCP, onFID, onCLS, onFCP, onINP, onTTFB } = (window as any).webVitals;
        let metrics: Record<string, number> = {};

        const collect = (name: string) => (metric: any) => {
          metrics[name] = metric.value;
          if (Object.keys(metrics).length === 6) resolve(metrics);
        };

        onLCP(collect('LCP'));
        onFID(collect('FID'));
        onCLS(collect('CLS'));
        onFCP(collect('FCP'));
        onINP(collect('INP'));
        onTTFB(collect('TTFB'));
      });
    });

    await browser.close();

    // 🟢 Envoyer les métriques à PostHog
    for (const [name, value] of Object.entries(results)) {
      posthogClient.capture({
        distinctId: 'auto-metrics',
        event: `Web Vital - ${name}`,
        properties: {
          url,
          value,
        },
      });
    }

    // 🟢 Retourner les métriques en JSON
    res.status(200).json({ success: true, url, metrics: results });

  } catch (error) {
    console.error('🚨 Erreur détaillée :', error);
    res.status(500).json({
      error: "Erreur lors de la récupération des Web Vitals.",
      details: (error as Error).message,
    });
  }
};
