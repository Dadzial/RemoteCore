import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

/**
 * Pierwszy podstawowy kontroler dla robota będzie pytac się o status jest online lub nie
 * Nie mamy robota fizycznie wiec poradzimy sobie inaczej ale równie dobrze na dole projektu
 * znajdziesz fragmenty kodu są to przerobione pod websockety fragmenty kodu z robota pod udp
 * i do nich bedziesz się odnosił piszac kontrolery w kazdym będzie metoda initializeWebSocketHandler
 * w tym kontrolerze bedzie uzyta tylko ona i użyj też loggera zawsze w zasadzie go używaj gdy
 * zrobisz ten kontroler przedz do steering.controller.ts
 * **/

class ConnectionController implements  wsControllerInterface {
    public io: Server;

    constructor(io: Server) {
        this.io = io;
        this.initializeWebSocketHandler();
    }

    public initializeWebSocketHandler() : void {

    }

}
export default ConnectionController;