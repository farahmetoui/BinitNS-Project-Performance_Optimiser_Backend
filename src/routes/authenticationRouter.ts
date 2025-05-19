import express from "express";
import { createAccountController, loginadminController } from "@src/controllers/authenticationController";
import authorization from "@src/middleware/authorization";

const router = express.Router();
router.post('/loginadmin', loginadminController);
router.post('/createAccount',authorization, createAccountController);
export default router;