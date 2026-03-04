import dotenv from 'dotenv'
dotenv.config();

export const config = {
    port : process.env.PORT,
    JwtSecret: process.env.JWT_SECRET as string,
    databaseUrl :process.env.DATABASE_URL as string
}