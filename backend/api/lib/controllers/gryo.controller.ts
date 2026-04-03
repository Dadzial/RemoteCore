import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

//TODO Tutaj przygotujesz następny kontroler , który będzie jak wcześniej odbierać dane z robota i przesyłać je na frontend
//TODO w README masz kod podpisany gryo.controller do niego masz napisać ten kontroler 


class GryoController implements wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler(): void {

    }
}

export default GryoController;
