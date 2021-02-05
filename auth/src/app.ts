import express from 'express';
require('express-async-errors');

import CookieSession from 'cookie-session';
import {
  currentUserRouter,
  signinRouter,
  signoutRouter,
  signupRouter,
} from './routes/';
import { errorHandler, NotFoundError } from '@jhomisorg/gittix-common';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  CookieSession({
    signed: false,
    secure: false,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
