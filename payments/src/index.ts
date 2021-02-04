import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import mongoose = require('mongoose');
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be define');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be define');
  if (!process.env.NATS_CLIENT_ID)
    throw new Error('NATS_CLIENT_ID must be define');
  if (!process.env.NATS_URL) throw new Error('NATS_URL must be define');
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error('NATS_CLUSTER_ID must be define');
  if (!process.env.STRIPE_KEY) throw new Error('STRIPE_KEY must be define');

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection close');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log('DB connected');
  } catch (error) {
    console.error(error);
  }
};

app.listen(3000, () => {
  console.log('listening on port 3000');
});

start();
