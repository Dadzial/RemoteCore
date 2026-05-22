import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from "../modules/models/user.model";
import TokenModel from "../modules/schemas/token.schema";

export const auth = async (request: Request, response: Response, next: NextFunction) => {
    let token = request.headers['x-access-token'] || request.headers['authorization'];
    if (token && typeof token === 'string') {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        try {
            const decoded = jwt.verify(token, config.JwtSecret) as IUser;

            const tokenExists = await TokenModel.findOne({ value: token });
            if (!tokenExists) {
                return response.status(401).send('Session expired or logged out.');
            }

            request.body.user = decoded;
            next();
        } catch (ex) {
            return response.status(400).send('Invalid token.');
        }
    } else {
        return response.status(401).send('Access denied. No token provided.');
    }
};