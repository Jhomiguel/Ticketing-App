import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@jhomisorg/gittix-common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order, OrderStatus } from "../models/order";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const EXPERATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();

    //Make sure that this ticket is not already reserved
    const isReserver = await ticket.isReserverd();
    if (isReserver) throw new BadRequestError("Ticket is already reserved");

    //Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPERATION_WINDOW_SECONDS);

    //Build the order and save it to the DB
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    //Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id!,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: {
        id: ticket.id!,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
