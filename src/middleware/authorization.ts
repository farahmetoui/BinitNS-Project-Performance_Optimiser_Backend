import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { IPayload } from '../util/jwt';

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token)
  if (!token){
    return res.status(StatusCodes.UNAUTHORIZED)
      .json({
        message: 'No token provided',
      });
    }
  try {
    const payload = jwt.verify(token) as IPayload;
    if (payload.type == "authorization") {
      res.locals.payload = payload;
     
      req.headers.userid=payload.id.toString();
      return next();
    } else {
      return res.status(StatusCodes.UNAUTHORIZED)
        .json({
          message: 'Unauthorized',
        });
    }
  } catch(err) {
    console.log(err)
    console.log("wrong token")
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }
};

