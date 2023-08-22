import { Injectable } from "@nestjs/common";
import { createConnection, Connection } from "mysql2"; 

@Injectable()
export class AppService {
    async getHello(): Promise<any> {
        const appStatus = "running";
        let databaseStatus = "disconnected";

        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        };

        const connection: Connection = createConnection(dbConfig);

        try {
            await connection.connect();
            databaseStatus = "connected";
        } catch (error) {
            console.error("Error connecting to the database:", error);
        } finally {
            connection.end();
        }

        return {
            app: appStatus,
            database: databaseStatus,
        };
    }
}
