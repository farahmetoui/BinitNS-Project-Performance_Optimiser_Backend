import express from "express";
import authorization from "@src/middleware/authorization";
import { addCommentsController, getAllCommentsController, getCommentsController } from "@src/controllers/CommentsController";
import { deleteNotifController, getAllNotifsController, getNotificationsController } from "@src/controllers/notificationsController";


const router = express.Router();
router.post('/createComment',authorization, addCommentsController);
router.get('/getComments',authorization, getAllCommentsController);
router.get('/getComment/:id',authorization, getCommentsController)
router.get("/notifications/:userId", authorization, getNotificationsController); 
router.get("/Allnotifications/:userId", authorization, getAllNotifsController); 
router.delete("/deleteNotif/:id", authorization, deleteNotifController); 

export default router;