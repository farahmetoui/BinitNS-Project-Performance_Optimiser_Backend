import FirecrawlApp from '@mendable/firecrawl-js';
import { PuppeteerCrawler, RequestQueue } from 'crawlee';
import { loginToWebsite } from '@src/util/authentification'; 
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getUrlsFromReactApp(baseUrl: string) {
  const requestQueue = await RequestQueue.open();
  await requestQueue.addRequest({ url: baseUrl });

  const visitedUrls = new Set<string>();

  // Initialiser Firecrawl
  const app = new FirecrawlApp({ apiKey: "fc-104a077078034b70a21363c7101a0ee9" });

  const crawler = new PuppeteerCrawler({
    requestQueue,
    launchContext: {
      launchOptions: { headless: true }, 
    },
    async requestHandler({ page, request, enqueueLinks, log }) {
      log.info(`🌍 Exploration: ${request.url}`);
      visitedUrls.add(request.url);

      // Authentification sur la page de base
      if (request.url === baseUrl) {
        try {
          await loginToWebsite(page); // Appel de votre fonction d'authentification
          log.info("✅ Authentification réussie !");
          await delay(2000); // Attendre que la page se charge complètement après l'authentification
        } catch (error) {
          log.error("❌ Erreur d'authentification :", error);
          return;
        }
      }

      // Utiliser Firecrawl pour extraire les URLs
      const scrapeResponse = await app.scrapeUrl(request.url, {
        formats: ['markdown', 'html'],
      });

      if (!scrapeResponse.success) {
        throw new Error(`Failed to scrape: ${scrapeResponse.error}`);
      }

      // Afficher l'objet scrapeResponse pour inspecter sa structure
      console.log('ScrapeResponse:', scrapeResponse);

      // Extraire les URLs à partir de scrapeResponse
      const extractedUrls = scrapeResponse.links || []; // Utilisez la propriété correcte ici
      for (const url of extractedUrls) {
        if (!visitedUrls.has(url)) {
          log.info(` Ajout de la nouvelle URL à la liste : ${url}`);
          await requestQueue.addRequest({ url });
          visitedUrls.add(url);
        }
      }

      // Cliquer sur tous les boutons pour explorer davantage
      const buttons = await page.$$('button');
      log.info(` ${buttons.length} boutons trouvés sur la page.`);

      for (const button of buttons) {
        try {
          const buttonText = await page.evaluate(el => el.innerText.trim(), button);
          log.info(`🔘 Tentative de clic sur: "${buttonText}" à l'URL: ${page.url()}`);

          await Promise.all([
            button.click(),
            page.waitForNavigation({ timeout: 5000, waitUntil: "networkidle2" }).catch(() => {
              log.info("⚠️ Aucune navigation détectée après le clic.");
            }),
          ]);

          await delay(2000);
          const newUrl = page.url();
          log.info(`🔗 Nouvelle URL après clic : ${newUrl}`);

          if (!visitedUrls.has(newUrl)) {
            log.info(`🔗 Ajout de la nouvelle URL à la liste : ${newUrl}`);
            await requestQueue.addRequest({ url: newUrl });
            visitedUrls.add(newUrl);
          } else {
            log.info("🔄 L'URL n'a pas changé après le clic.");
          }
        } catch (error) {
          log.error("❌ Erreur lors du clic sur un bouton :", error);
        }
      }

      // Explorer tous les liens de la page
      await enqueueLinks();
    },
    failedRequestHandler({ request, log }) {
      log.error(`❌ Échec du scraping pour : ${request.url}`);
    },
  });

  await crawler.run();
  console.log("✅ Toutes les URLs trouvées :", Array.from(visitedUrls));
  return Array.from(visitedUrls);
}