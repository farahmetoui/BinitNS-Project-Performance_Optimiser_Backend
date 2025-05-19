import * as fs from "fs";
import lighthouse, { Flags } from "lighthouse"; //Flags est un type utilisé dans Lighthouse pour définir les options de configuration passées à l’audit.
import * as chromeLauncher from "chrome-launcher";


(async () => {
  let chrome;
  try {
    // Lancer Chrome en mode headless
    chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  } catch (err) {
    console.error("Failed to launch Chrome:", err);
    return;
  }

  const options: Flags = {
    logLevel: "info", // Active les logs détaillés pendant l'audit
    output: "html", // Demande à Lighthouse de générer un rapport en HTML
    onlyCategories: [
      "accessibility",
      "best-practices",
      "performance",
      "pwa",
      "seo",
    ], // Sélectionner les catégories d’audit
    port: chrome.port, // Spécifie le port de Chrome lancé
    formFactor: "desktop", // Indique que l'audit est pour un site desktop
    screenEmulation: {
      mobile: false,  // ✅ Doit être `false` pour desktop
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
    },
  };

  let runnerResult;
  try {
    runnerResult = await lighthouse("https://greeny-solutions.com/our-solution/", options);
  } catch (err) {
    console.error("Lighthouse audit failed:", err);
    await chrome.kill();
    return;
  }

  if (!runnerResult || !runnerResult.report || !runnerResult.lhr) {
    console.error("Lighthouse audit failed.");
    await chrome.kill();
    return;
  }


  // Sauvegarder le rapport en tant que fichier HTML
  const reportHtml = runnerResult.report as string;
  fs.writeFileSync("lhreport.html", reportHtml);

  console.log("Report is done for", runnerResult.lhr.finalDisplayedUrl);
  console.log(
    "Performance score was",
    (runnerResult.lhr.categories.performance.score ?? 0) * 100
  );

  await chrome.kill();
})();


// import puppeteer from 'puppeteer';
// import lighthouse from 'lighthouse';
// import * as fs from 'fs';
// import ReportGenerator from 'lighthouse/report/generator/report-generator.js';

// async function runLighthouse(url: string) {
//   // Lancer un navigateur Puppeteer
//   const browser = await puppeteer.launch({
//     headless: true, // Mode sans interface graphique
//     args: ['--remote-debugging-port=9222'], // Port pour Lighthouse
//   });

//   const port = 9222; // Port sur lequel Puppeteer tourne

//   // Exécuter Lighthouse sur l'URL donnée
//   const result = await lighthouse(url, {
//     port,
//     output: 'json',
//     logLevel: 'info',
//   });

//   if (!result || !result.lhr) {
//     console.error("❌ Lighthouse n'a pas pu analyser l'URL :", url);
//     await browser.close();
//     return;
//   }

//   // ✅ Générer un rapport HTML détaillé
//   const htmlReport: string = (ReportGenerator as any).generateReport(result.lhr, 'html');

//   // ✅ Sauvegarder le rapport dans un fichier
//   const reportPath = `lighthouse-report-${Date.now()}.html`;
//   fs.writeFileSync(reportPath, htmlReport);

//   console.log(`✅ Rapport généré avec succès : ${reportPath}`);

//   await browser.close();
// }

// // 📌 Lancer l'analyse Lighthouse sur une URL donnée
// runLighthouse('https://greeny-solutions.com/our-solution/').catch(console.error);

//2eme methode 

// const viewports = [
//   {
//     name: "Desktop",
//     mobile: false,
//     width: 1920,
//     height: 1080,
//   },
//   {
//     name: "Tablet",
//     mobile: true,
//     width: 768,
//     height: 1024,
//   },
//   {
//     name: "Mobile",
//     mobile: true,
//     width: 375,
//     height: 812,
//   },
// ];

// (async () => {
//   const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

//   for (const viewport of viewports) {
//     console.log(`🔍 Testing for ${viewport.name} (${viewport.width}x${viewport.height})`);

//     const options: Flags = {
//       logLevel: "info",
//       output: "html",
//       onlyCategories: ["accessibility", "best-practices", "performance", "pwa", "seo"],
//       port: chrome.port,
//       formFactor: viewport.mobile ? "mobile" : "desktop",
//       screenEmulation: {
//         mobile: viewport.mobile,
//         width: viewport.width,
//         height: viewport.height,
//         deviceScaleFactor: 1,
//         disabled: false,
//       },
//     };

//     const runnerResult = await lighthouse("https://greeny-solutions.com/our-solution/", options);

//     if (!runnerResult || !runnerResult.report) {
//       console.error(`Failed for ${viewport.name}`);
//       continue;
//     }

//     // Sauvegarde du rapport avec le nom du format
//     const reportHtml = runnerResult.report as string;
//     fs.writeFileSync(`lhreport-${viewport.name}.html`, reportHtml);

//     console.log(`Report for ${viewport.name} is done.`);
//   }

//   await chrome.kill();
// })();
