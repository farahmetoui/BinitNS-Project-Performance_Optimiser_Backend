import { prisma } from '../util/prisma';

const defaultEdisonUrls = [
  "https://online-we-fe-u.morgenfund.com/#login",
  "https://online-we-fe-u.morgenfund.com/#multi-depot-dashboard",
  "https://online-we-fe-u.morgenfund.com/#dashboard",
  "https://online-we-fe-u.morgenfund.com/#watchlist",
  "https://online-we-fe-u.morgenfund.com/#settings/profile",
  "https://online-we-fe-u.morgenfund.com/#postbox",
  "https://online-we-fe-u.morgenfund.com/#transactions",
  "https://online-we-fe-u.morgenfund.com/#manage-orders",
  "https://online-we-fe-u.morgenfund.com/#link-depot",
  "https://online-we-fe-u.morgenfund.com/#usersettings/userprofile",
  "https://www.morgenfund.com/de/private/kontakt/online-depot",
  "https://online-we-fe-u.morgenfund.com/#fund-finder"
];

const defaultWiseUrls = [
  "https://portfolio-online-we-fe-t.morgenfund.com/#/login",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/my-account/experience-knowledge",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/manage-portfolio",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/document-centre/reports",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/settings/personal-details",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/settings/pin-admin",
  "https://portfolio-online-we-fe-t.morgenfund.com/#/dashboard/settings/tan-admin",

];

export const addApplication = async (name: string, mainUrl: string, urls?: string[]) => {
  try {
    const appName = name.toLowerCase();

    const existingApp = await prisma.applicationToTest.findFirst({
      where: { name: appName },
    });

    if (existingApp) {
      throw new Error("the application exist.");
    }

    const urlsToUse =
    (!urls || urls.length === 0)
      ? (appName === 'edison'
          ? defaultEdisonUrls
          : appName === 'wise'
            ? defaultWiseUrls
            : [])
      : urls;

    const urlToTest =
      appName === 'edison'
        ? "https://online-we-fe-u.morgenfund.com/"
        : mainUrl ?? "";

    return await prisma.applicationToTest.create({
      data: {
        name: appName,
        mainUrl: urlToTest,
        urls: urlsToUse,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllApplication = async () => {
  try {
    return await prisma.applicationToTest.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getGlobalMetricsAverage = async (appId: string) => {
  try {
    const scores = {
      currentYearScores: Array(12).fill(0),
      previousYearScores: Array(12).fill(0),
    };

    const allMetrics = await prisma.metrics.findMany({
      where: {
        appId,
        test: {
          isNot: null,   //pour exlure les metrics qui ne sont pas liés aux tests 
        },
      },
      include: {
        test: true,
      },
    });

    allMetrics.forEach((metric) => {
      const testDate = metric.test?.DateofTest;
      if (!testDate) return;

      const year = new Date(testDate).getFullYear();
      const month = new Date(testDate).getMonth();

      const performance = metric.performance ?? 0;
      const accessibility = metric.accessibility ?? 0;
      const bestPractices = metric.bestPractices ?? 0;
      const seo = metric.seo ?? 0;
      const pwa = metric.pwa ?? 0;

      const globalScore =
        performance * 0.3 +
        accessibility * 0.2 +
        bestPractices * 0.2 +
        seo * 0.15 +
        pwa * 0.15;
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      if (year === currentYear) {
        scores.currentYearScores[month] += globalScore;
      } else if (year === previousYear) {
        scores.previousYearScores[month] += globalScore;
      }
    });

    return scores;

  } catch (error) {
    console.error("Error calculating global metrics average:", error);
  }
};



