import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

class GryoController implements wsControllerInterface {
    public io: Server;

    private gyroSchema = Joi.object({
        r: Joi.number().optional(),
        p: Joi.number().optional(),
        y: Joi.number().optional(),
        roll: Joi.number().optional(),
        pitch: Joi.number().optional(),
        yaw: Joi.number().optional(),
        ax: Joi.number().optional(),
        ay: Joi.number().optional(),
        az: Joi.number().optional(),
        t: Joi.number().optional(),
        timestamp: Joi.number().optional()
    }).min(1);

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Gyro] New Connection: ${socket.id}`);


            const handleData = (payload: any) => {
                let parsedData = payload;
                if (typeof payload === 'string') {
                    try {
                        parsedData = JSON.parse(payload);
                    } catch (e) {
                        return;
                    }
                }

                const incomingData = parsedData?.data || parsedData;
                const { error, value } = this.gyroSchema.validate(incomingData, { convert: true });

                if (error) return;

                this.io.emit('gyro:data', value);
            };

            socket.on('g', handleData);
            socket.on('gyro:data', handleData);

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
