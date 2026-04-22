import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

class GryoController implements wsControllerInterface {
    public io: Server;

    private gyroSchema = Joi.object({
        r: Joi.number().required(),
        p: Joi.number().required(),
        y: Joi.number().required(),
        ax: Joi.number().required(),
        ay: Joi.number().required(),
        az: Joi.number().required(),
        t: Joi.number().required()
    });

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Gyro] New Connection: ${socket.id}`);

            socket.on('g', (payload: any) => {
                let parsedData = payload;
                if (typeof payload === 'string') {
                    try {
                        parsedData = JSON.parse(payload);
                    } catch (e) {
                        logger.error('[Gyro] Invalid JSON string received');
                        return;
                    }
                }

                const incomingData = parsedData?.data || parsedData;

                const { error, value } = this.gyroSchema.validate(incomingData, { convert: true });

                if (error) {
                    logger.error(`[Gyro] Incorrect data format: ${error.message}`);
                    return;
                }

                this.io.emit('gyro:data', value);
            });

            socket.on('disconnect', () => {
                logger.info(`[Gyro] Disconnected: ${socket.id}`);
            });

            socket.on('error', (err) => {
                logger.error(`[Gyro] Socket error (${socket.id})`, err);
            });
        });
    }
}

export default GryoController;
