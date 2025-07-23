import { User } from '@prisma/client'
import jwt from '../util/jwt';
import bcrypt from 'bcryptjs';
import { prisma } from '../util/prisma';
import { sendEmail } from './UserService';


export const createaccountservice = async (userdata: any) => {
    try {
        const plainPassword = userdata.password;
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const createduser = await prisma.user.create({
            data: {
                userName: userdata.userName,
                firstName: userdata.firstName,
                lastName: userdata.lastName,
                phonenumber: userdata.phonenumber,
                password: hashedPassword,
                email: userdata.email,
                role: userdata.role
            },
        });
        if (createduser) {
            await sendEmail(
                "Performance account created",
                `Hello ${userdata.firstName} ${userdata.lastName},\n\nYour Performance account has been created.\n\n🔐 Email: ${userdata.email}\n🔑 Password: ${plainPassword}\n\nPlease keep this email safe.`,
                userdata.email
            );
        }

        let token = jwt.sign(
            { id: createduser?.id, type: "authorization", role: createduser?.role, userName: createduser?.userName, email: createduser?.email },
        );

        return token;
    }
    catch (error) {
        throw error;
    }
}


export const loginService = async (passwordrequest: string, userFound: User) => {
    try {
        const value = await bcrypt.compare(passwordrequest, userFound.password);
        if (!value) {
            return null;
        }
        else {
            const token = jwt.sign({
                id: userFound.id, 
                type: "authorization",
                role: userFound.role,
                userName: userFound.userName,
                email: userFound.email
            })
            return token;
        }
    }
    catch (error) {
        throw error;
    }
}

export const addExpoToken = async (userId: string, expoPushToken: string) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { expoPushToken: expoPushToken }
        })
    }
    catch (error) {
        throw error;
    }
}

export const changePasswordService = async (userId: string, newPassword: string)=> {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return true;
    } catch (error) {
        console.error("Error while changing password:", error);
        throw error;
    }
}