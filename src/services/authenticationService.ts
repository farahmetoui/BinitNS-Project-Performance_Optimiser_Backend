import { User } from '@prisma/client'
import jwt from '../util/jwt';
import bcrypt from 'bcryptjs';
import { prisma } from '../util/prisma';


export const createaccountservice = async (userdata: any) => {
    try {
        userdata.password = await bcrypt.hash(userdata.password, 10);
        const createduser = await prisma.user.create({
            data: {
                userName: userdata.userName,
                firstName: userdata.firstName,
                lastName: userdata.lastName,
                phonenumber: userdata.phonenumber,
                password: userdata.password,
                email: userdata.email,

            },
        });
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