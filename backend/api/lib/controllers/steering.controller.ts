import wsControllerInterface from "../interfaces/ws-controller.interface";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import Joi from 'joi';

/**
 * @class SteeringController
 * @implements {wsControllerInterface}
 * @brief Kontroler odpowiedzialny za sterowanie ruchem robota.
 *
 * Obsługuje komendy sterujące silnikami (lewy/prawy) oraz polecenia zatrzymania.
 * Przekazuje instrukcje sterujące od klienta (np. joystick) bezpośrednio do robota.
 */
class SteeringController implements wsControllerInterface {
    public io: Server;

    /**
     * @brief Schemat walidacji komend sterujących.
     * Sprawdza, czy wartości mocy silników mieszczą się w zakresie od -100 do 100.
     */
    private steeringSchema = Joi.object({
        leftMotor:  Joi.number().integer().min(-100).max(100).required(),
        rightMotor: Joi.number().integer().min(-100).max(100).required()
    });

    /**
     * @brief Konstruktor kontrolera sterowania.
     * @param io Instancja serwera Socket.io.
     */
    constructor(io: Server) {
        this.io = io;
    }

    /**
     * @brief Inicjalizuje obsługę zdarzeń sterowania.
     *
     * Obsługuje zdarzenia:
     * - 'steering:command': ustawienie mocy silników.
     * - 'steering:stop': natychmiastowe zatrzymanie robota.
     */
    public initializeWebSocketHandler(): void {
        this.io.on('connection', (socket: Socket) => {
            logger.info(`[Steering] New Connection: ${socket.id}`);

            socket.on('steering:command', (payload: any) => {
                const { error, value } = this.steeringSchema.validate(payload?.data);

                if (error) {
                    logger.error(`[Steering] Incorrect command: ${error.message}`);
                    return;
                }

                socket.broadcast.emit('steering:command', {
                    event: 'steering:command',
                    data: value
                });

                logger.info(`[Steering] Command sent: L:${value.leftMotor} R:${value.rightMotor}`);
            });

            socket.on('steering:stop', () => {
                socket.broadcast.emit('steering:stop');
                logger.info(`[Steering] STOP command has been sent`);
            });

            socket.on('disconnect', () => {
                logger.info(`[Steering] Disconnected: ${socket.id}`);
            });
        });
    }
}

export default SteeringController;