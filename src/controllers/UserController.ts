import { getAllUsers } from "@src/services/UserService";
import { Request, Response } from "express";


export const getAllUsersController = async(req: Request, res: Response)=>{
    try {
        const Users = await getAllUsers()
        res.status(200).json(Users);
    } catch (error) {
        console.error("Error in getting users :", error);
        res.status(500).json({ message: "server Error" });
    }
}
