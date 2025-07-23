import { deleteUserById, getAllUsers, getnumBerOfUsers, getUserById } from "@src/services/UserService";
import { Request, Response } from "express";


export const getAllUsersController = async (req: Request, res: Response) => {
    try {
        const Users = await getAllUsers()
        res.status(200).json(Users);
    } catch (error) {
        console.error("Error in getting users :", error);
        res.status(500).json({ message: "server Error" });
    }
}

export const getNumberOfUsersController = async (req: Request, res: Response) => {
    try {
       const numberOfUsers = await getnumBerOfUsers();
       return res.status(200).json(numberOfUsers);
    } catch (error) {
        console.error("Error in getting number of users :", error);
        res.status(500).json({ message: "server Error" });
    }
}

export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const userFound = await getUserById(id);
        return res.status(200).json(userFound);

    } catch (error) {
        res.status(500).json({ message: "server Error" });
    }
}

export const deleteUserByIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const deletedUser = await deleteUserById(id);
        return res.status(200).json(deletedUser);
        
    } catch (error) {
        return res.status(500).json({ message: "server Error" });
        
    }
}