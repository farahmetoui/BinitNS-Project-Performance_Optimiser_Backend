import { getAllTestByApplication, getTestsByMonth, getTotalTestsNumber } from "@src/services/TestService";
import { Request, Response } from "express";


export const getTestAppController = async (req: Request, res: Response) => {
    try {
        const { appId } = req.params;

        if (!appId) {
            return res.status(400).json({ message: "L'ID de l'application est requis." });
        }

        const metrics = await getAllTestByApplication(appId);

        if (!metrics || metrics.length === 0) {
            return res.status(404).json({ message: "Aucun test trouvée pour cette application." });
        }

        res.status(200).json(metrics);
    } catch (error) {
        console.error("Error to recuperate tests :", error);
        res.status(500).json({ message: "server Error" });
    }
};

export const getTotalTests = async(req: Request, res: Response)=>{
    try {
        const numberOfTests = await getTotalTestsNumber()
        res.status(200).json(numberOfTests);
    } catch (error) {
        console.error("Error in getting tests :", error);
        res.status(500).json({ message: "server Error" });
    }
}

export const getTestsByMonthController = async(req: Request, res: Response)=>{
    try {
         const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required in the request body." });
        }
        const monthlyCounts = await getTestsByMonth(name);
        res.status(200).json(monthlyCounts);
    } catch (error) {
        console.error("Error in getting tests By Month :", error);
        res.status(500).json({ message: "server Error" });
    }
}


