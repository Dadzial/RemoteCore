import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import joi from "joi";

class DiagnosticController  implements wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public initializeWebSocketHandler() : void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Diagnostic] Socket connected: ${socket.id}`);

            socket.on('diagnostic:log', (payload: any) => {
                this.io.emit('diagnostic:log', payload);
            });

            socket.on('diagnostic:status', (payload: any) => {
                this.io.emit('diagnostic:status', payload);
            });

            socket.on('disconnect', () => {
                logger.info(`[Diagnostic] Socket disconnected: ${socket.id}`);
            });
        });
    }
}
export default DiagnosticController;