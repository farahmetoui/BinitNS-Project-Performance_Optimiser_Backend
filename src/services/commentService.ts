import { prisma } from '../util/prisma';
import { sendEmail } from './UserService';
import { sendPushNotification } from './notificationService';


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
                await prisma.notifications.create({
                    data: {
                        userId: userReceiv.id,
                        actorId: userAuth.id,
                        message: `${userAuth.firstName} commented: "${message}"`,
                        type: 'comment',
                        read: true 
                    }
                });
                await sendEmail(
                    ` Performance Verification from the ${userAuth.role} ${userAuth.firstName} ${userAuth.lastName}  `,
                    `Hello ${userReceiv.firstName} ${userReceiv.lastName},\n\n ${message}\n\n Best regards . \n ${userAuth.firstName} ${userAuth.lastName}`,
                    userReceiv.email
                );
                if (userReceiv.expoPushToken) {
                    try {
                        await sendPushNotification(userReceiv.expoPushToken, 'Comment Notification', `hello ${userReceiv.firstName}, ${userAuth.firstName} commented: "${message}"`);
                        
                    } catch (error) {
                        console.error(' Error sending push notification:', error); 
                        
                    }
                    
                }
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
                testId: id
            },
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





