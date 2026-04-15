import wsControllerInterface from "../interfaces/ws-controller.interface";
import Joi from "joi";
import {Server,Socket} from "socket.io";
import logger from "../utils/logger";

class CameraController implements wsControllerInterface {
    public io :Server

    private lidarSchema = Joi.object({
        distances: Joi.array().items(Joi.number()).length(64).required(),
        timestamp: Joi.number().required()
    });

    constructor(io:Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler():void{
        this.io.on('connection', (socket: Socket) => {
            logger.info(`New Socket Connection: ${socket.id}`);

            socket.on('lidar:data', (data:any) => {
                let parsedData = data;
                if (typeof data === 'string') {
                    try {
                        parsedData = JSON.parse(data);
                    } catch (e) {
                        logger.error('Invalid JSON string received');
                        return;
                    }
                }

                const incomingData = parsedData?.data || parsedData;

                const {error, value} = this.cameraSchema.validate(incomingData, { convert: true });

                if (error) {
                    logger.error(`Incorrect data format: ${error.message}`);
                    return;
                }

                this.io.emit('lidar:data', value);
                logger.info(`Forwarded LIDAR data from ${socket.id}`);
            })

            socket.on('disconnect', () => {
                logger.info(`[Gyro] Disconnected: ${socket.id}`);
            });

            socket.on('error', (err) => {
                logger.error(`[Gyro] Socket error (${socket.id})`, err);
            });
        });
    }
}

export default CameraController;