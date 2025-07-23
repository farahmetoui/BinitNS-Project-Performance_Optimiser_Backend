import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isEmailExists } from '../services/UserService';
import { addExpoToken, changePasswordService, createaccountservice, loginService } from '../services/authenticationService';


export const createAccountController = async (req: Request, res: Response) => {
    try {
        let userdata = req.body;
        if (userdata.email && userdata.password && userdata.phonenumber &&
            userdata.userName && userdata.firstName && userdata.lastName) {
            const isUserExists = await isEmailExists(userdata.email);
            if (!isUserExists) {
                const token = await createaccountservice(userdata);
                return res.status(StatusCodes.ACCEPTED).json({ status: true, token: token });
            }
            else {
                return res.status(StatusCodes.CONFLICT).json({ status: false, message: "an account exist already" });
            }
        }
        else {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "missing data" });
        }
    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "try again later" });
    }
};


export const loginadminController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const expoPushToken = req.body.expoPushToken ? req.body.expoPushToken : null;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'email and password required' });
        }
        const isUserExists = await isEmailExists(email);

        if (!isUserExists) {

            return res.status(StatusCodes.NOT_FOUND).json({ message: 'user not found' });
        }
        else {
            if (isUserExists.role === "admin" || isUserExists.role === "developer" || isUserExists.role === "tester") {
                const token = await loginService(password, isUserExists);
                if (!token) {
                    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid password' });
                }
                else {
                    if (expoPushToken) {
                        await addExpoToken(isUserExists.id, expoPushToken);
                    }

                    res.setHeader('authorization', token);
                    return res.status(StatusCodes.ACCEPTED).json({
                        token: token, user: isUserExists
                    });
                }
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid access' });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while logining' });
    }
}

export const changePasswordController = async (req: Request, res: Response) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User ID and new password are required' });
        }
        const isChanged = await changePasswordService(userId, newPassword);

        return res.status(StatusCodes.OK).json({ message: 'Password changed successfully' });


    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while changing password' });
    }

}

