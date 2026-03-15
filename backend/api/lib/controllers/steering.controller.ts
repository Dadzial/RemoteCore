import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

/**
 * Tutaj podobna historia w wczesniej w readme masz framgent kodu ktory odpowiada za silniki
 * i musisz go uzyc aby napisac odpowiedni kod do tego kontrolera tutaj juz musisz uzyć
 * Joi do walidacji danych z frontendu
 * **/

class SteeringController implements  wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler() : void {

    }

}
export default SteeringController;