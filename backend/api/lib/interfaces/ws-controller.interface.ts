import { Server } from "socket.io";

interface WsController {
    io: Server;
    initializeWebSocketHandler(): void;
}

export default WsController;