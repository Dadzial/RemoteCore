import App from './app';
import UserController from "./controllers/user.controller";


const app = new App();

const controllers = [
    new UserController()
]

controllers.forEach(controller => {
    app.app.use("/", controller.router);
});

app.listen()