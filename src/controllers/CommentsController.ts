import { getAllComments, getCommentsById, sendCommentsService } from "@src/services/commentService";
import { Request, Response } from "express";

export const addCommentsController = async (req: Request, res: Response) => {
    try {
        const { authorId, usernames, message, testId, type, priority } = req.body;
        if (!message) {
            return res.status(400).json({ error: "message is required" });
        }
        const comment = await sendCommentsService(authorId, usernames, message, testId, type, priority)
        return res.status(200).json({ comment })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const getCommentsController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ error: "Missing id parameter in request." });
        }
        const comments = await getCommentsById(id)
        return res.status(200).json({ comments })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const getAllCommentsController = async (req: Request, res: Response) => {
    try {
        
        const comments = await getAllComments()
        return res.status(200).json({ comments })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}