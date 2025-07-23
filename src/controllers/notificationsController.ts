import { deleteNotificationById, getAllNotifsById, getnotificationsByuserId, updateReadNotification } from '@src/services/notificationService';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getNotificationsController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
        }

        const notifications = await getnotificationsByuserId(userId);


        return res.status(StatusCodes.OK).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while fetching notifications' });
    }
}

export const deleteNotifController = async(req: Request , res: Response)=> {
    try {
        const id = req.params.id;
        if(!id){
            return res.status(StatusCodes.BAD_REQUEST).json({message: 'Notification ID is required'});
        }
        else {
            const deletedNotification = await deleteNotificationById(id);
            return res.status(StatusCodes.OK).json({message: 'Notification deleted successfully', deletedNotification});
        }        
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while deleting the notification'});
        
    }
}


export const getAllNotifsController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID is required' });
        }

        const notifications = await getAllNotifsById(userId);


        return res.status(StatusCodes.OK).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while fetching notifications' });
    }
}


