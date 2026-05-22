import App from './app';
import UserController from "./controllers/user.controller";
import SteeringController from "./controllers/steering.controller";
import ConnectionController from "./controllers/connection.controller";
import GryoController from "./controllers/gryo.controller";
import LidarController from "./controllers/lidar.controller";
import DiagnosticController from "./controllers/diagnostic.controller";
import express from 'express';
import path from 'path';

const app = new App();
const io = app.getIo();

app.app.set('trust proxy', 1);

const controllers = [
    new UserController()
]

const wsControllers = [
    new LidarController(io),
    new GryoController(io),
    new SteeringController(io),
    new ConnectionController(io),
    new DiagnosticController(io)
]

controllers.forEach(controller => {
    app.app.use("/", controller.router);
});

wsControllers.forEach(controller => {
    controller.initializeWebSocketHandler();
});


const frontendPath = path.join(__dirname, '../../../frontend/dist/frontend/browser');
app.app.use(express.static(frontendPath));


app.app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        next();
    }
});

app.listen()
