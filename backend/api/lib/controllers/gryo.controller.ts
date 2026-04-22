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
    let incomingData = payload;
    if (typeof payload === 'string') {
        try {
            incomingData = JSON.parse(payload);
        } catch (e) {
            return;
        }
    }


    const dataToValidate = incomingData?.data || incomingData;

    const { error, value } = this.gyroSchema.validate(dataToValidate, { convert: true });
    if (error) return;


    const outputData = {
        roll: value.r !== undefined ? value.r : (value.roll || 0),
        pitch: value.p !== undefined ? value.p : (value.pitch || 0),
        yaw: value.y !== undefined ? value.y : (value.yaw || 0),
        ax: value.ax || 0,
        ay: value.ay || 0,
        az: value.az || 0,
        timestamp: value.t || value.timestamp || Date.now()
    };

    this.io.emit('gyro:data', outputData);
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
