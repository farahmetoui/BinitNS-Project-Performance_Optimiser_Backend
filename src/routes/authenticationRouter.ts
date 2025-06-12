import express from "express";
import { createAccountController, loginadminController } from "@src/controllers/authenticationController";
import authorization from "@src/middleware/authorization";
import { getAllUsersController } from "@src/controllers/UserController";

const router = express.Router();
router.post('/loginadmin', loginadminController);
router.post('/createAccount',authorization, createAccountController);
router.get('/allUsers',authorization, getAllUsersController);

export default router;