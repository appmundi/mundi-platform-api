import { Injectable } from "@nestjs/common";
import { createConnection, Connection } from "mysql2";
import "dotenv/config";

@Injectable()
export class MysqlConnection {
    private conn: Connection;
    static instance: any;

    private constructor() {
        this.conn = createConnection({
            host: process.env.DB_HOST,
			user: process.env.DB_USER,
			port: Number.parseInt(process.env.DB_PORT ?? ""),
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
        });
    }

    static getInstance() {
        if(!MysqlConnection.instance) {
            MysqlConnection.instance = new MysqlConnection(); 
        }
        return MysqlConnection.instance;
    }

    async query(statement: string, params: any[]) : Promise<any> {
        const results = await this.conn.promise().query(statement, params);
        return results[0];
    }
}