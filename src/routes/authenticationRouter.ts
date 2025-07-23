import express from "express";
import { changePasswordController, createAccountController, loginadminController } from "@src/controllers/authenticationController";
import authorization from "@src/middleware/authorization";
import { deleteUserByIdController, getAllUsersController, getNumberOfUsersController, getUserByIdController } from "@src/controllers/UserController";
import access from "@src/middleware/access";

const router = express.Router();
router.post('/loginadmin', loginadminController);
router.post('/createAccount',authorization ,access("admin"), createAccountController);
router.get('/allUsers',authorization,access("admin"), getAllUsersController);
router.put('/changePassword',authorization, changePasswordController);
router.get('/getUser/:id', authorization, getUserByIdController); 
router.get('/numberUsers', authorization, getNumberOfUsersController); 
router.delete('/deleteUser/:id', authorization,access("admin"), deleteUserByIdController); 


export default router;