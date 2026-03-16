import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

class ConnectionController implements  wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`New Socket Connection: ${socket.id}`);

            socket.on('connection:robot-online', (data: any) => {
                const firmware = data.firmwareVersion || 'unknown';
            });

            socket.on('disconnect', (reason) => {
                logger.info(`Device disconnected (${socket.id}). Reason: ${reason}`);
            });

            socket.on('error', (err) => {
                logger.error(`Socket error (${socket.id})`, err);
            });
        });
    }
}
export default ConnectionController;