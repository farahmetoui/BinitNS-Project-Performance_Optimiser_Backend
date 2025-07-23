import { prisma } from '../util/prisma';

const { Expo } = require('expo-server-sdk');

let expo = new Expo();

export async function sendPushNotification(expoPushToken: any, title: any, body: any) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
        return;
    }

    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: { someData: 'goes here' },
    };

    try {
        let ticket = await expo.sendPushNotificationsAsync([message]);
        console.log(ticket);
    } catch (error) {
        console.error(error);
    }
}


export async function getnotificationsByuserId(userId: string) {
    try {
        const notifData = await prisma.notifications.findMany({
            where: {
                userId: userId,
            },
            include: {
                actor: {
                    select: {
                        userName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },

        });
        if (notifData.length > 0) {
            await prisma.notifications.updateMany({
                where: {
                    userId: userId,
                    read: true,
                },
                data: {
                    read: false,
                },
            })
        }
        return notifData;

    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

export async function deleteNotificationById(notificationId: string) {
    try {
        const deletedNotification = await prisma.notifications.delete({
            where: {
                id: notificationId,
            },
        });
        return deletedNotification;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}



export async function updateReadNotification(notificationId: string) {
    try {
        const updatedNotification = await prisma.notifications.update({
            where: {
                id: notificationId,
            },
            data: {
                read: true,
            },
        });
        return updatedNotification;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}


export async function getAllNotifsById(userId: string) {
    try {
        const notifData = await prisma.notifications.findMany({
            where: {
                userId: userId,
            },
            include: {
                actor: {
                    select: {
                        userName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },

        })
        return notifData;

    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}
