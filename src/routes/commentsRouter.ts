import express from "express";
import authorization from "@src/middleware/authorization";
import { addCommentsController, getAllCommentsController, getCommentsController } from "@src/controllers/CommentsController";


const router = express.Router();
router.post('/createComment',authorization, addCommentsController);
router.get('/getComments',authorization, getAllCommentsController);
router.get('/getComment/:id',authorization, getCommentsController)

export default router;