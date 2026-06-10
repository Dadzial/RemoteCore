import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

/**
 * @class ConnectionController
 * @implements {wsControllerInterface}
 * @brief Kontroler odpowiedzialny za zarządzanie połączeniami WebSocket.
 *
 * Klasa ta inicjalizuje nasłuchiwanie na nowe połączenia socketowe,
 * obsługuje rejestrację robotów oraz loguje zdarzenia rozłączenia i błędy.
 */
class ConnectionController implements  wsControllerInterface {
    public io: Server;

    /**
     * @brief Konstruktor kontrolera połączeń.
     * @param io Instancja serwera Socket.io.
     */
    constructor(io: Server) {
        this.io = io;
    }

    /**
     * @brief Inicjalizuje obsługę zdarzeń WebSocket.
     *
     * Konfiguruje nasłuchiwanie na:
     * - 'connection': nowe połączenia.
     * - 'connection:robot-online': rejestracja robota i potwierdzenie statusu.
     * - 'disconnect': rozłączenie urządzenia.
     * - 'error': błędy gniazda.
     */
    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`New Socket Connection: ${socket.id}`);

            socket.on('connection:robot-online', (data: any) => {
                logger.info(`Robot connected with firmware: ${data.firmwareVersion}`);

                socket.emit('robot-status-confirmed', {
                    status: 'success',
                    message: 'Robot is now registered'
                });
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