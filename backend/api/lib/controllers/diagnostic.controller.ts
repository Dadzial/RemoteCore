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

    }
}
export default DiagnosticController;