import { Request, Response } from "express";
import { getLighthouseMetrics } from "../services/metricsService";
import { getGlobalMetricsAverage } from "@src/services/appToTestService";

export const saveMetrics = async (req: Request, res: Response) => {
    try {
        const { name ,urls  } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Le nom de l'application est requis." });
        }

        const testWithMetrics = await getLighthouseMetrics(name , urls);
       
        return res.status(200).json({
            message: "L'analyse Lighthouse a été effectuée avec succès.",
            test: testWithMetrics,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const getMetricsAverageController = async (req: Request, res: Response) => {
    try {
        const averages = await getGlobalMetricsAverage("680b6b598c6be488e08a203a")
       
        return res.status(200).json({
            averages
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

