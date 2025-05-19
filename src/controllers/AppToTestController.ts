import { Request, Response } from "express";
import { addApplication } from "../services/appToTestService";
import { getAllApplication } from "../services/appToTestService";

export const createApplication = async (req: Request, res: Response) => {
  try {
    console.log("Requête reçue :", req.body);

    const { name, mainUrl, urls } = req.body;

    if (!name ) {
      console.log(" name is empty ");
      return res.status(400).json({ error: "Le nom et l'URL principale sont obligatoires." });
    }

    const newApp = await addApplication(name, mainUrl, urls);

    console.log(" new application created :", newApp);
    res.status(201).json(newApp);
  } catch (error) {
    console.error(" Error in createApplication :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllApplicationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await getAllApplication();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error to retrieve all applications :", error);
    res.status(500).json({ message: "server Error" });
  }
};

