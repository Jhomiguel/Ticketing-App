import express from 'express';
require('express-async-errors');
import CookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@jhomisorg/gittix-common';
import { createChargeRouter } from './routes/new';

const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(
  CookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser);
app.use(createChargeRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
