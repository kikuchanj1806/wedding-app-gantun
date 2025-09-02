// src/index.js (ESM)
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import expressLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import cors from 'cors';

import indexRouter from './routes/index.js';
import { buildCorsOptions } from './config/cors.js';
import { connectMongo /*, closeMongo*/ } from './db/mongo.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
app.use(cors(buildCorsOptions()));

/** ---------- Routes ---------- **/
app.use('/', indexRouter);

// Healthcheck route (giúp test nhanh)
app.get('/healthz', (req, res) => res.json({ ok: true }));

/**
 * Serverless entry:
 * - KHÔNG dùng app.listen
 * - Kết nối Mongo 1 lần và tái sử dụng giữa các lần gọi
 */
let mongoReady; // promise cache
async function ensureMongo() {
    if (!mongoReady) {
        mongoReady = connectMongo().then((db) => {
            app.locals.db = db;
            return db;
        });
    }
    return mongoReady;
}

// Chạy local khi không phải môi trường Vercel
// if (!process.env.VERCEL) {
//     const PORT = process.env.PORT || 3000;
//     ensureMongo().then(() => {
//         app.listen(PORT, () => {
//             console.log(`Local server listening at http://localhost:${PORT}`);
//         });
//     }).catch(err => {
//         console.error('Failed to start locally:', err);
//         process.exit(1);
//     });
// }

export default async function handler(req, res) {
    try {
        await ensureMongo();
        return app(req, res);
    } catch (err) {
        console.error('Handler error:', err);
        res.status(500).send('Internal Server Error');
    }
}

// export { handler };