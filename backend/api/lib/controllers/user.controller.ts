import Controller from "../interfaces/controller.interface";
import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../middlewares/auth.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from "../modules/services/token.service";
import { loginLimiter } from "../utils/login-limiter";
import logger from "../utils/logger";

class UserController implements Controller {
    public path = '/api/user'
    public router = Router();

    private userService = new UserService();
    private passwordService = new PasswordService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() : void {
        this.router.get(`${this.path}/ping`,auth,this.pingServer);
        this.router.post(`${this.path}/create`,auth, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, loginLimiter, this.authenticate);
        this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
    }

    private pingServer = async (request: Request, response: Response, next: NextFunction) => {
        try {
            return response.status(200).json({ status: 'ok' });
        } catch (err: any) {
            logger.error(`Ping error: ${err.message}`);
            return next(err);
        }
    };

    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password);
                await this.passwordService.createOrUpdate({
                    userId: user._id.toString(),
                    password: hashedPassword
                });
            }

            logger.info(`User created/updated: ${user.name} (ID: ${user._id})`);
            response.status(200).json(user);
        } catch (error: any) {
            logger.error(`User creation/update failed: ${error.message}`);
            response.status(400).json({ error: 'Bad request', value: error.message });
        }
    };

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;

        try {
            logger.debug(`Login attempt for user: ${login}`);

            const user = await this.userService.getByName(login);
            if (!user) {
                logger.warn(`Failed login attempt: User not found [${login}]`);
                return response.status(401).json({ error: 'Unauthorized' });
            }

            const isAuthorized = await this.passwordService.authorize(user._id.toString(), password);
            if (!isAuthorized) {
                logger.warn(`Failed login attempt: Wrong password for user [${login}]`);
                return response.status(401).json({ error: 'Unauthorized' });
            }

            const token = await this.tokenService.create(user);
            logger.info(`User logged in successfully: ${login} (ID: ${user._id})`);

            response.status(200).json(this.tokenService.getToken(token));
        } catch (error: any) {
            logger.error(`Authentication Error for ${login}: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };

    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
        try {
            const result = await this.tokenService.remove(userId.toString());
            logger.info(`User logged out and session removed: ID ${userId}`);
            response.status(200).json(result);
        } catch (error: any) {
            logger.error(`Logout failed for user ${userId}: ${error.message}`);
            response.status(401).json({ error: 'Unauthorized' });
        }
    };


}
export default UserController ;