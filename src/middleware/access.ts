import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '@src/util/prisma';



export default (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    const payload = res.locals.payload;
    const usercheck = await prisma.user.findUnique({ where: { id: payload.id } });
    try {
      if (usercheck && usercheck.role == role) {
        return next();
      } else {

        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
      }
    } catch {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Try again' });
    }
  };
};