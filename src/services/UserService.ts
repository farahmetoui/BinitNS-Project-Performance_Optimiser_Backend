import { prisma } from '../util/prisma';


export const isEmailExists = async (email: string) => {
    const checkuseremail = await prisma.user.findUnique({
      where: {
        email
      },
    });
    return checkuseremail;
  }
