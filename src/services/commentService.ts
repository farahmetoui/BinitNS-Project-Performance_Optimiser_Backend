import { prisma } from '../util/prisma';
import { sendEmail } from './UserService';

export const sendCommentsService = async (authorId: string, usernames: [string], message: string, testId: string, type: string, priority: string) => {
    try {
        const userAuth = await prisma.user.findUnique({
            where: { id: authorId }
        })
        const userReceivers = await prisma.user.findMany({
            where: {
                userName: {
                    in: usernames,
                },
            },
        })
        if (!userAuth || !userReceivers) {
            throw new Error("Author or receiver not found");
        }
        const comments = await prisma.comments.create({
            data: {
                authorId: authorId,
                message: message,
                testId: testId,
                type: type,
                priority: priority
            }
        })
        if (comments && usernames) {
            for (const userReceiv of userReceivers) {
                await sendEmail(
                    ` Performance Verification from the ${userAuth.role} ${userAuth.firstName} ${userAuth.lastName}  `,
                    `Hello ${userReceiv.firstName} ${userReceiv.lastName},\n\n ${message}\n\n Best regards . \n ${userAuth.firstName} ${userAuth.lastName}`,
                    userReceiv.email
                );
            }
        }
        return comments
    } catch (error) {
        console.error("Error while creating the comment:", error);
    }

}

export const getCommentsById = async (id: string) => {
    try {
        const comments = await prisma.comments.findMany({
            where: {
                testId: id },
            include: {
                    author: {
                        select: {
                            userName: true, 
                        },
                    },
                },
            });
        return comments
    } catch (error) {
        console.error("Error while fetching the comments:", error);
    }
}

export const getAllComments = async () => {
  try {
    const numberOfComments = await prisma.comments.count();
    return numberOfComments;
  } catch (error) {
    console.error("Error while counting the comments:", error);
    throw error; // important pour signaler l’erreur à l’appelant
  }
};
