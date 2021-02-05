import express from 'express';
require('express-async-errors');
import CookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from '@jhomisorg/gittix-common';
import { createTicketRouter } from './routes/new';
import { showTicketsRouter } from './routes/show';
import { indexTicketsRouter } from './routes';
import { updateTicketRouter } from './routes/update';

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
app.use(createTicketRouter);
app.use(showTicketsRouter);
app.use(indexTicketsRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
