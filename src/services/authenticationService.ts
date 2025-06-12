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
            { id: createduser?.id, type: "authorization" },
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
            const token = jwt.sign({ id: userFound.id, type: "authorization" })
            return token;
        }
    }
    catch (error) {
        throw error;
    }
}