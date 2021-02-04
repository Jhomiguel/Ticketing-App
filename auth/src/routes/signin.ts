import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@jhomisorg/gittix-common';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) throw new BadRequestError('Invalid Credentials');

    const passwordMatch = await Password.compare(foundUser.password, password);
    if (!passwordMatch) throw new BadRequestError('Invalid Credentials');

    const userJwt = jwt.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
      },
      process.env.JWT_KEY!
    );

    //store it on session object
    req.session = {
      jwt: userJwt,
    };

    console.log(req.session);

    res.status(200).send(foundUser);
  }
);

export { router as signinRouter };
