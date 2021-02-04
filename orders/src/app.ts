import express from 'express';
require('express-async-errors');
import CookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@jhomisorg/gittix-common';
import { indexOrderRouter } from './routes';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { deleteOrderRouter } from './routes/delete';

const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(
  CookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
