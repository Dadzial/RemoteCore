import dotenv from 'dotenv'
dotenv.config();

export const config = {
    PORT : process.env.PORT,
    JwtSecret: process.env.JWT_SECRET as string,
    databaseUrl :process.env.DATABASE_URL as string,
    socketPort : process.env.SOCKET_PORT
}