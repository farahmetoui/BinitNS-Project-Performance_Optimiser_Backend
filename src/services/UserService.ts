import { prisma } from '../util/prisma';
import nodemailer from "nodemailer";

const Emailbinit = process.env.emailadmin || "";
const emailpassword = process.env.passwordMail || "  ";
export const isEmailExists = async (email: string) => {
  const checkuseremail = await prisma.user.findUnique({
    where: {
      email
    },
  });
  return checkuseremail;
}

export const getAllUsers = async () => {
  try {
    const allUsers = await prisma.user.findMany()
    const numberOfUsers = allUsers.length;
    return { allUsers, numberOfUsers }
  } catch (error) {
    console.error(`Error in fetching Users : ${error.message}`);
  }


}

export const getnumBerOfUsers = async () => {
  try {
    const allUsers = await prisma.user.findMany()
    const numberOfUsers = allUsers.length;
    return { numberOfUsers }
  } catch (error) {
    console.error(`Error in fetching Users : ${error.message}`);
  }
}


export const sendEmail = async (
  subject: string,
  text: string,
  emailgiven: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Emailbinit,
        pass: emailpassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: Emailbinit,
      to: emailgiven,
      subject: subject,
      text: text,
    };

    const sendingState = await transporter.sendMail(mailOptions);

    if (sendingState.rejected.length != 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log("Error:", error);
    return false;
  }
};


export const sendMessageEmail = async (userName: string,) => {
  try {
    const allUsers = await prisma.user.findMany()
    const numberOfUsers = allUsers.length;
    return { allUsers, numberOfUsers }
  } catch (error) {
    console.error(`Error in fetching Users : ${error.message}`);
  }


}

export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error("Error while fetching user by ID:", error);
    throw error;
  }
}

export const deleteUserById = async (userId: string) => {
  try {
    await prisma.comments.deleteMany({
      where: { authorId: userId },
    });
    await prisma.notifications.deleteMany({
      where: { userId: userId },
    });

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });
    return deletedUser;
  } catch (error) {
    console.error("Error while deleting user by ID:", error);
    throw error;
  }
}





