import App from './app';
import UserController from "./controllers/user.controller";
import SteeringController from "./controllers/steering.controller";
import ConnectionController from "./controllers/connection.controller";
import GryoController from "./controllers/gryo.controller";

const app = new App();
const io = app.getIo();

app.app.set('trust proxy', 1);

const controllers = [
    new UserController()
]

const wsControllers = [
    new GryoController(io),
    new SteeringController(io),
    new ConnectionController(io)
]

controllers.forEach(controller => {
    app.app.use("/", controller.router);
});

wsControllers.forEach(controller => {
    controller.initializeWebSocketHandler();
});

app.listen()