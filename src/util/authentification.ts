
import { Page } from "puppeteer";
import puppeteer, { Browser } from 'puppeteer';
import dotenv from "dotenv";
dotenv.config();

/**
 * Fonction pour s'authentifier sur un site nécessitant un login.
 * @param page - Instance de la page Puppeteer.
 * @param email - Email de l'utilisateur.
 * @param password - Mot de passe de l'utilisateur.
 * 
 */

const email: string = process.env.EMAIL || "";
const password: string = process.env.PASSWORD || "";

export const loginToWebsite = async (page: Page) => {
  try {
    const origin = "https://online-we-fe-u.morgenfund.com/#login";
    // const browser: Browser = await puppeteer.launch({ headless: true });

    await page.goto(origin, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForSelector('input[data-test-id="username"]', { visible: true, timeout: 60000 });
    await page.type('input[data-test-id="username"]', email, { delay: 100 });

    const nextBttn = await page.$('span[id="submit-text"]');
    await nextBttn?.click();

    await page.waitForSelector('input[data-test-id="password"]', { visible: true, timeout: 60000 });
    await page.type('input[data-test-id="password"]', password, { delay: 100 });

    await Promise.all([
      page.click('button[data-test-id="login-button"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    ]);
    console.log(" Connection successful !");

    // await browser.close();

  } catch (error) {
    console.error(` Error to analyse the :`, error);

  }
};
export const testdashboardbutton = async (page: Page) => {
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes('Depot anschauen'));
      if (btn) btn.click();
    });
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    console.log(page.url());
    // await Promise.all([
    //   page.click('button[class="cursor-hand css-192uxsb css-1mtlw2l"]'),
    //   page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
    // ]);
    
    //console.log(" Connexion réussie !");

    // await browser.close();

  } catch (error) {
    console.error(` Error to analyse the :`, error);

  }
};
