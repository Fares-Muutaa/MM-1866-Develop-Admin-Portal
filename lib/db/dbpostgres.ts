import {drizzle as drizzleNode} from 'drizzle-orm/node-postgres'
import {DefaultLogger, LogWriter, Logger} from 'drizzle-orm/logger';
import {Pool} from 'pg'

import * as schema from './schema'


const logSql = false

class MyLogWriter implements LogWriter {
    write(message: string) {
        // Write to file, stdout, etc.
        console.log(message);
    }
}

class MyLogger implements Logger {
    logQuery(query: string, params: unknown[]): void {
        console.log({query, params});
    }
}

let logger: Logger | false;

if (process.env.DB_HOST === 'localhost' && logSql) {
    logger = new DefaultLogger({writer: new MyLogWriter()});
} else if (process.env.DB_HOST !== 'localhost' && logSql) {
    logger = new MyLogger();
} else {
    logger = false;
}

export const db = drizzleNode(
    new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl:
            process.env.DB_HOST === 'localhost'
                ? false
                : {
                    rejectUnauthorized: false,
                },
    }),
    {
        schema,
        logger,
    }
)
