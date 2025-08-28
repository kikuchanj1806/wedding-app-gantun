import path from 'path';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import {fileURLToPath} from 'url';
import cors from 'cors';
import indexRouter from './routes/index.js';
import {buildCorsOptions} from './config/cors.js';

// Mongo helpers (native driver)
import {closeMongo, connectMongo} from './db/mongo.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let server; // giữ instance http.Server để shutdown
const PORT = process.env.PORT || 3000;

/** ---------- View engine ---------- **/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

/** ---------- Middlewares ---------- **/
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));

/** ---------- CORS ---------- **/
const corsOptions = buildCorsOptions();
app.use(cors(corsOptions));

/** ---------- Routes ---------- **/
app.use('/', indexRouter);

/** ---------- Bootstrap functions ---------- **/
export async function start() {
    try {
        app.locals.db = await connectMongo();

        server = app.listen(PORT, () => {
            console.log(`Server listening at http://localhost:${PORT}`);
        });

        // graceful shutdown
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        return server;
    } catch (err) {
        console.error('❌ Failed to start:', err);
        throw err; // để caller quyết định thoát process
    }
}

async function shutdown(signal) {
    console.log(`\n${signal} received. Closing...`);
    await stop(/* exitProcess */ true);
}

export async function stop(exitProcess = false) {
    try {
        if (server) {
            await new Promise(resolve => server.close(resolve));
            server = undefined;
        }
        await closeMongo();
    } catch (e) {
        console.error('Error during shutdown:', e);
    } finally {
        if (exitProcess) process.exit(0);
    }
}

// Tự chạy khi file được chạy trực tiếp (trừ khi đang test)
if (process.env.NODE_ENV !== 'test') {
    start().catch(() => process.exit(1));
}

export { app };
