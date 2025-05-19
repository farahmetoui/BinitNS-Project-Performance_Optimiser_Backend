import { prisma } from '../util/prisma';


export const getAllDetailMetricsByApp = async (appId: string) => {
    try {
      return await prisma.metrics.findMany({
        where: {
          appId: appId,
        },
        include: {
          webVitals: true,
        },
        orderBy: {
          id: 'asc', 
        },
      });
      
    } catch (error) {
      throw new Error(`Error while retrieving the metrics : ${error.message}`);
    }
  };
  
  export const getwebvitalbyId = async (Id: string) => {
    try {
      return await prisma.webVitals.findUnique({
        where:{
          id: Id
        }
      })
       
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des métriques : ${error.message}`);
    }
  };
  