import { Request, Response } from "express";
import { getAllDetailMetricsByApp, getMetricsByTest, getwebvitalbyId } from "../../src/services/WebVital";

export const getDetailMetricsController = async (req: Request, res: Response) => {
    try {
        const { appId } = req.params;

        if (!appId) {
            return res.status(400).json({ message: "L'ID de l'application est requis." });
        }

        const metrics = await getAllDetailMetricsByApp(appId);

        if (!metrics || metrics.length === 0) {
            return res.status(404).json({ message: "Aucune métrique trouvée pour cette application." });
        }

        res.status(200).json(metrics);
    } catch (error) {
        console.error("Erreur lors de la récupération des métriques :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
export const getTestMetricsById = async (req: Request, res: Response) => {
    console.log("aaaaaaaaaaaaaa")
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "L'ID de l'application est requis." });
        }

        const metrics = await getMetricsByTest(id);
  console.log(metrics)
        if (!metrics || metrics.length === 0) {
            return res.status(404).json({ message: "Aucune métrique trouvée pour cette application." });
        }

        res.status(200).json(metrics);
    } catch (error) {
        console.error("Erreur lors de la récupération des métriques :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getWebVitalById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID of the application is required ." });
        }
        const webvitals = await getwebvitalbyId(id);
        res.status(200).json(webvitals);
    } catch (error) {
        console.error("Erreur lors de la récupération des métriques :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};