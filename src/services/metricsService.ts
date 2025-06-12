import puppeteer, { Browser } from "puppeteer";
import lighthouse from "lighthouse";
import { loginToWebsite } from "../util/authentification";
import { loginToWiseDashboard } from "../util/wiseAuthentication"
import { prisma } from '../util/prisma';
import { ObjectId } from "bson";
import { sendProgressToClients, sendUrlsToClients } from "./webSocket";
import { error } from "console";
import { getReportPDF } from "../public/reportPdf"

export const getLighthouseMetrics = async (appName: string, Appurls: string[]) => {
    const existingApp = await prisma.applicationToTest.findFirst({
        where: {
            name: appName.toLowerCase(),
        },
    });
    if (!existingApp) {
        throw new Error("Application does not exist.");
    }

    const metricsList: string[] = [];
    const metricId = new ObjectId();
    let currentIndex: number = 0;
    let browser: Browser | null = null;
    const createdTest = await prisma.test.create({
        data: {
            app: { connect: { id: existingApp.id } },
        },
    });

    try {

  

        if (appName == "") {
            return error

        }
        const urls = Appurls || existingApp.urls;
        if (!urls || urls.length === 0) {
            throw new Error(` Aucune URL trouvée pour l'application "${appName}".`);
        }
        let metricPurcentage = 0;
        console.log("Starting Puppeteer..");
        sendUrlsToClients(urls);
        browser = await puppeteer.launch({ headless: true });

        const page = await browser.newPage();
        if (appName == "edison") {
            await loginToWebsite(page);
        }
        else if (appName == "wise") {
            await loginToWiseDashboard(page);
        }


        console.log(`URL after login : ${page.url()}`);

        if (page.url().includes("login")) {
            throw new Error(" connexion failed, Puppeteer still in the login page.");
        }
        console.log(`Test added for the application ${appName}`);
        sendUrlsToClients(urls);
        for (const url of urls) {
            try {
                await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
                console.log(` Analyse for : ${url}`);
                const wsEndpoint = browser.wsEndpoint();
                if (!wsEndpoint) throw new Error("Can't obtain WebSocket Endpoint.");

                const port = parseInt(new URL(wsEndpoint).port, 10);

                const result = await lighthouse(url, {
                    port,
                    output: "json",
                    logLevel: "info",
                    formFactor: undefined,
                    screenEmulation: { disabled: true },
                }, undefined, page);

                if (!result || !result.lhr) {
                    console.error(` Lighthouse can't analyse ${url}`);
                    continue;
                }

               
                const savedWebVitals = await prisma.webVitals.create({
                    data: {
                        firstContentfulPaint: result.lhr.audits["first-contentful-paint"]?.numericValue ?? 0,
                        largestContentfulPaint: result.lhr.audits["largest-contentful-paint"]?.numericValue ?? 0,
                        cumulativeLayoutShift: result.lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0,
                        totalBlockingTime: result.lhr.audits["total-blocking-time"]?.numericValue ?? 0,
                        interactive: result.lhr.audits["interactive"]?.numericValue ?? 0,
                        speedIndex: result.lhr.audits["speed-index"]?.numericValue ?? 0,
                        timeToFirstByte: result.lhr.audits["server-response-time"]?.numericValue ?? 0,
                        firstInputDelay: result.lhr.audits["max-potential-fid"]?.numericValue ?? 0,
                        inputLatency: result.lhr.audits["estimated-input-latency"]?.numericValue ?? 0,
                    },
                });

                const {publicUrlRapport,publicUrlJsonRapport} = await getReportPDF({ lhr: result.lhr }, metricId.toString(), url)

                const savedMetrics = await prisma.metrics.create({
                    data: {
                        app: { connect: { id: existingApp.id } },
                        url,
                        performance: result.lhr.categories.performance?.score ?? 0,
                        accessibility: result.lhr.categories.accessibility?.score ?? 0,
                        bestPractices: result.lhr.categories["best-practices"]?.score ?? 0,
                        seo: result.lhr.categories.seo?.score ?? 0,
                        pwa: result.lhr.categories.pwa?.score ?? 0,
                        webVitals: { connect: { id: savedWebVitals.id } },
                        urlRapport: publicUrlRapport,
                        urlJsonRapport: publicUrlJsonRapport,
                        test: { connect: { id: createdTest.id } },
                    },
                });

                metricsList.push(savedMetrics.id.toString());
                currentIndex++
                metricPurcentage = Math.round((currentIndex / urls.length) * 100);
                sendProgressToClients(metricPurcentage, urls.indexOf(url));

                console.log(` Analyse finished for : ${url}`);

            } catch (error) {
                console.error(` Error while analysing the url : ${url}:`, error);
            }

        }
        return await prisma.test.findUnique({
            where: { id: createdTest.id },
            include: {
                Metrics: true,
            },
        });
    }
    catch (error) {
        console.error(" Error in getLighthouseMetrics:", error);
        throw new Error(error.message);
    }
    finally {
        if (browser) {
            await browser.close();
            console.log(" Puppeteer closed.");
        }
    }
};


