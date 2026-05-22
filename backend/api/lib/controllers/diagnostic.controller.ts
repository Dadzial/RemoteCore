import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

class DiagnosticController implements wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Diagnostic] New Connection: ${socket.id}`);

            socket.on('diagnostic:status', (payload: any) => {
                socket.broadcast.emit('diagnostic:status', payload);
            });

            socket.on('diagnostic:log', (payload: any) => {
                // Forward logs to the dashboard
                socket.broadcast.emit('diagnostic:log', payload);
            });

            socket.on('disconnect', () => {
                logger.info(`[Diagnostic] Disconnected: ${socket.id}`);
            });
        });
    }
}

export default DiagnosticController;
