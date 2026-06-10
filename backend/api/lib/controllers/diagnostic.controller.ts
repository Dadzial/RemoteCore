import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";

/**
 * @class DiagnosticController
 * @implements {wsControllerInterface}
 * @brief Kontroler obsługujący dane diagnostyczne i logi systemowe robota.
 *
 * Odpowiada za przekazywanie statusów diagnostycznych oraz logów wysyłanych przez roboty
 * do wszystkich połączonych klientów (np. interfejsu webowego).
 */
class DiagnosticController implements wsControllerInterface {
    public io: Server;

    /**
     * @brief Konstruktor kontrolera diagnostyki.
     * @param io Instancja serwera Socket.io.
     */
    constructor(io: Server) {
        this.io = io;
    }

    /**
     * @brief Inicjalizuje obsługę zdarzeń WebSocket dla diagnostyki.
     *
     * Konfiguruje przekazywanie (broadcast) zdarzeń:
     * - 'diagnostic:status': informacje o stanie systemu (pamięć, RSSI, uptime).
     * - 'diagnostic:log': logi tekstowe z systemu robota.
     */
    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Diagnostic] New Connection: ${socket.id}`);

            socket.on('diagnostic:status', (payload: any) => {
                socket.broadcast.emit('diagnostic:status', payload);
            });

            socket.on('diagnostic:log', (payload: any) => {
                
                socket.broadcast.emit('diagnostic:log', payload);
            });

            socket.on('disconnect', () => {
                logger.info(`[Diagnostic] Disconnected: ${socket.id}`);
            });
        });
    }
}

export default DiagnosticController;
