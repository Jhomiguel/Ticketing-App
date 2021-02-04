import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
      mongooseId(): string;
    }
  }
}
jest.mock('.././nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51ICyXoIdnnoJR5bq7c6fQgjNmB6fcMOySFIoF5i4kiVnb3bAu34mAxzrTUMvGVY2qB6Vdg8wKw8IWdrzmDt9vD8C00kL1LsSbW';

let mongo: any;
beforeAll(async () => {
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  process.env.JWT_KEY = 'test';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  collections.forEach(async (collection) => {
    await collection.deleteMany({});
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.mongooseId = () => mongoose.Types.ObjectId().toHexString();

global.signin = (id?: string) => {
  //Build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  //Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build the session Object.
  const session = { jwt: token };

  //Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string that is the cookie with the encoded data
  return [`express:sess=${base64}`];
};
