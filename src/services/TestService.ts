import { prisma } from '../util/prisma';

export const getAllTestByApplication = async (appId: string) => {
  if (!appId) {
    throw new Error("L'ID de l'application est requis.");
  }

  try {
    const tests = await prisma.test.findMany({
      where: {
        appId: appId,
      },
      include: {
        Metrics: true,
      },
      orderBy: {
        DateofTest: 'asc',
      },
    });
    return tests;
  } catch (error) {
    console.error(`Error in these tests : ${error.message}`);
    throw new Error(`Error while retrieving the tests for the application ${appId}: ${error.message}`);
  }
};


export const createTestService = async (appId: string, metricsIds: string[]) => {
  try {
    return await prisma.test.create({
      data: {
        app: {
          connect: { id: appId },
        },
        Metrics: {
          connect: metricsIds.map((id) => ({ id })),
        },
      },
    });
  } catch (error) {
    console.error("Error while creating test:", error);
    throw error;
  }
};

export const getTotalTestsNumber = async () => {
  try {
    const tests = await prisma.test.findMany();
    const totalTests = tests.length;
    return {
      totalTests,

    };

  } catch (error) {
    console.error(`Error in these tests : ${error.message}`);
  }
}

export const getTestsByMonth = async (appName:string) => {
  try {
     const app = await prisma.applicationToTest.findUnique({
    where: { name: appName },
  });
  
  if (!app) {
    throw new Error(`Application with name "${appName}" not found.`);
  }
    const currentYear = new Date().getFullYear();
    const results = await prisma.test.groupBy({
      by: ['DateofTest'],
      _count: true,
      where: {
         appId :app.id,
        DateofTest: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });
    const monthlyCounts = Array(12).fill(0);
    results.forEach(({ DateofTest, _count }) => {
      const month = new Date(DateofTest).getMonth();
      monthlyCounts[month] += _count;
    });
    return monthlyCounts
  } catch (error) {
    console.error("Error fetching monthly test counts:", error);
  }
}

export const getPerformancefromthisyear  = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const results = await prisma.test.groupBy({
      by: ['DateofTest'],
      _count: true,
      where: {
        DateofTest: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    });
    const monthlyCounts = Array(12).fill(0);
    results.forEach(({ DateofTest, _count }) => {
      const month = new Date(DateofTest).getMonth();
      monthlyCounts[month] += _count;
    });
    return monthlyCounts
  } catch (error) {
    console.error("Error fetching monthly test counts:", error);
  }
}