import express from "express";
import {config} from "./config";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";

class App {
    public app: express.Application;
    public server: http.Server;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.server = http.createServer(this.app);
    }

    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
    }

    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
}

export default App;