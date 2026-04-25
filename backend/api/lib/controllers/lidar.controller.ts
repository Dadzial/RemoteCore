import wsControllerInterface from "../interfaces/ws-controller.interface";
import Joi from "joi";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

class LidarController implements wsControllerInterface {
    public io: Server;

    private lidarSchema = Joi.object({
        distances: Joi.array().items(Joi.number()).length(64).required(),
        timestamp: Joi.number().required()
    });

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Lidar] New Connection: ${socket.id}`);

            socket.on('lidar:data', (payload: any) => {
                let parsedData = payload;
                if (typeof payload === 'string') {
                    try {
                        parsedData = JSON.parse(payload);
                    } catch (e) {
                        logger.error('[Lidar] Invalid JSON string received');
                        return;
                    }
                }

                const incomingData = parsedData?.data || parsedData;

                const { error, value } = this.lidarSchema.validate(incomingData, { convert: true });

                if (error) {
                    logger.error(`[Lidar] Incorrect data format: ${error.message}`);
                    return;
                }

                this.io.emit('lidar:data', value);
            });

            socket.on('disconnect', () => {
                logger.info(`[Lidar] Disconnected: ${socket.id}`);
            });

            socket.on('error', (err) => {
                logger.error(`[Lidar] Socket error (${socket.id})`, err);
            });
        });
    }
}

export default LidarController;