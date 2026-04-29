import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

class SteeringController implements wsControllerInterface {
    public io: Server;

    private steeringSchema = Joi.object({
        leftMotor:  Joi.number().integer().min(-100).max(100).required(),
        rightMotor: Joi.number().integer().min(-100).max(100).required()
    });

    constructor(io: Server) {
        this.io = io;
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Steering] New Connection: ${socket.id}`);

            socket.on('steering:command', (payload: any) => {
                const { error, value } = this.steeringSchema.validate(payload?.data);

                if (error) {
                    logger.error(`[Steering] Incorrect command: ${error.message}`);
                    return;
                }

                socket.broadcast.emit('steering:command', {
                    event: 'steering:command',
                    data: value
                });

                logger.info(`[Steering] Command sent: L:${value.leftMotor} R:${value.rightMotor}`);
            });

            socket.on('steering:stop', () => {
                this.io.emit('steering:stop');
                logger.info(`[Steering] STOP command has been sent`);
            });

            socket.on('disconnect', () => {
                logger.info(`[Steering] Disconnected: ${socket.id}`);
            });
        });
    }
}

export default SteeringController;