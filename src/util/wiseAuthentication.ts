import { Page } from "puppeteer";
import dotenv from "dotenv";
dotenv.config();

/**
 * Fonction pour s'authentifier sur un site nécessitant un login.
 * @param page - Instance de la page Puppeteer.
 * @param password - Mot de passe de l'utilisateur.
 * 
 */

const loginId: string = process.env.LOGINID || "";
const password: string = process.env.WISEPASSWORD || "";

export const loginToWiseDashboard = async (page: Page) => {
    try {
        const origin = "https://portfolio-online-we-fe-t.morgenfund.com/#/login";
        // const browser: Browser = await puppeteer.launch({ headless: true });

        await page.goto(origin, { waitUntil: "networkidle2", timeout: 60000 });

        await page.waitForSelector('#login-page-id-textinput', { visible: true, timeout: 60000 });
        await page.type('#login-page-id-textinput', loginId, { delay: 100 });


        const nextBttn = await page.$('span[id="submit-text"]');
        await nextBttn?.click();

        await page.waitForSelector('#login-page-pin-textinput', { visible: true, timeout: 60000 });
        await page.type('#login-page-pin-textinput', password, { delay: 100 });

        await Promise.all([
            page.click('#login-page-login-button'),
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
        ]);
        console.log(" Connexion réussie !");

        // await browser.close();

    } catch (error) {
        console.error(` Erreur lors de l'analyse de :`, error);

    }
};