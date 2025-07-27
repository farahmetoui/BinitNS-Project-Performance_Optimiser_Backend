import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';
import cors from "cors";
import lighthouseRouter from './routes/LighthouseRouter';
import authenticationRouter from './routes/authenticationRouter';
import commentsRouter from './routes/commentsRouter';
import 'express-async-errors';

// import BaseRouter from '@src/routes';

import Paths from '@src/routes/common/Paths';
import ENV from '@src/common/ENV';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import { RouteError } from '@src/common/route-errors';
import { NodeEnvs } from '@src/common/constants';
import { createAdminUser } from './adminInjection';
import authorization from './middleware/authorization';
import { StatusCodes } from 'http-status-codes';
 


/******************************************************************************
                                Variables
******************************************************************************/

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);



// **** Setup

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}


app.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

// const reportsPath = path.join(process.cwd(), 'Downloads');
// app.use('/reports', express.static(reportsPath));

const downloadsPath = path.join(process.cwd(), 'Downloads');
console.log(" CHEMIN STATIQUE POUR /reports =", downloadsPath);
// app.use('/reports', express.static(downloadsPath));
app.use('/reports', express.static(downloadsPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline';"
      );
    }
  }
}));

app.use("/api", authenticationRouter)

//Use middleware
app.use(authorization);


// Add APIs, must be after middleware
// app.use(Paths.Base, BaseRouter);
app.use("/api", lighthouseRouter);
app.use("/api", commentsRouter);

app.get("/authorization", (req, res) => {
  return res.status(StatusCodes.ACCEPTED).send({ message: "authorized" });
});

(async () => {
  try {
    await createAdminUser(); 
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
})();


// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ error: err.message });
  }
  return next(err);
});


// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/users');
});



/******************************************************************************
                                Export default
******************************************************************************/

export default app;


















