import { app } from './app';
import mongoose = require('mongoose');

const start = async () => {
  console.log('Auth Service Started');
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY is not define');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be define');
  try {
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
