import Controller from "../interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../middlewares/auth.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import logger from "../utils/logger";

class UserController implements Controller {
    public path = 'api/user'
    public router = Router();

    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();
}
export default UserController ;