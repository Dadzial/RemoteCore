import express from "express";
import {config} from "./config";
import {Server, Socket} from "socket.io";
import {corsMiddleware} from "./utils/cors-domains";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";
import mongoose from "mongoose";


class App {
    public app: express.Application;
    public server: http.Server;
    public io! : Server;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.server = http.createServer(this.app);
        this.initializeSocketServer();
        this.connectToDatabase();
    }

    private initializeMiddlewares(): void {
        this.app.use(corsMiddleware);
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
    }

    private async connectToDatabase(): Promise<void> {
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }

    private initializeSocketServer(): void {
        this.io = new Server(this.server, {
            cors: {
                origin: [
                    'http://localhost:4200',
                    'https://remotecore.onrender.com',
                    'https://remotecoredashboard.onrender.com'
                ],
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization"],
                credentials: true
            },
        });
    }


    public getIo(): Server {
        return this.io;
    }

    public listen(): void {
        this.server.listen(config.PORT, () => {
            console.log(`App listening on the port ${config.PORT}`);
        });
    }
}

export default App;