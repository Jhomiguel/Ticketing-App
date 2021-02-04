import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('returns a 404 when purshasing an order that doesnt exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'qlkwjeq',
      orderId: global.mongooseId(),
    })
    .expect(404);
});

it('returns a 401 when purshasing an order that doesnt belongs to an user', async () => {
  const order = Order.build({
    id: global.mongooseId(),
    userId: global.mongooseId(),
    version: 0,
    status: OrderStatus.Created,
    price: 30,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'qlkwjeq',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purshasing a cancelled order', async () => {
  const userId = global.mongooseId();
  const order = Order.build({
    id: global.mongooseId(),
    userId,
    version: 0,
    status: OrderStatus.Cacelled,
    price: 30,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'qlkwjeq',
      orderId: order.id,
    })
    .expect(400);
});

//Option 2 - reaching the stripe API directly
it('returns a 201 with valid inputs', async () => {
  const userId = global.mongooseId();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: global.mongooseId(),
    userId,
    version: 0,
    status: OrderStatus.Created,
    price,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(
    (charge) => charge.amount === price * 100
  );

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge?.id,
  });
  expect(payment).not.toBeNull();
});

//Option 1 - Mocking Stripe
// jest.mock('../../stripe');

// it('returns a 201 with valid inputs', async () => {
//   const userId = global.mongooseId();
//   const order = Order.build({
//     id: global.mongooseId(),
//     userId,
//     version: 0,
//     status: OrderStatus.Created,
//     price: 30,
//   });
//   await order.save();

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({
//       token: 'tok_visa',
//       orderId: order.id,
//     })
//     .expect(201);

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(30 * 100);
//   expect(chargeOptions.currency).toEqual('usd');
// });
