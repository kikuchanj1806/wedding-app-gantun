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
import { connectMongo } from './db/mongo.js';

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
// Serve static ở gốc: /css, /js, /images, ...
app.use(express.static(path.join(__dirname, 'assets')));

/** ---------- CORS ---------- **/
app.use(cors(buildCorsOptions()));

/** ---------- Healthcheck (không đụng DB) ---------- **/
app.get('/healthz', (req, res) => res.json({ ok: true }));

/** ---------- DB middleware (chỉ dùng cho route cần DB) ---------- **/
let mongoReady; // cache promise giữa các request (và giữa invocations nếu container được reuse)
async function getDb() {
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI is not set. Skip DB.');
        return null;
    }
    if (!mongoReady) {
        mongoReady = connectMongo().catch(err => {
            // Cho phép retry ở request sau
            mongoReady = undefined;
            throw err;
        });
    }
    return mongoReady;
}

async function ensureDb(req, res, next) {
    try {
        const db = await getDb();
        if (!db) return res.status(503).send('DB not configured');
        req.app.locals.db = db;
        next();
    } catch (e) {
        console.error('DB connect error:', e);
        return res.status(503).send('Service temporarily unavailable (DB)');
    }
}

/** ---------- Routes ---------- **/
// Nếu toàn bộ router cần DB:
app.use('/', ensureDb, indexRouter);

// Nếu chỉ một số nhánh cần DB, có thể tách như sau:
// app.use('/admin', ensureDb, adminRouter);
// app.use('/api', ensureDb, apiRouter);
// app.use('/', publicRouter); // router không cần DB

/** ---------- Express error handler ---------- **/
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).send(process.env.NODE_ENV === 'production' ? 'Internal Server Error' : String(err?.stack || err));
});

/** ---------- Serverless entry (KHÔNG listen) ---------- **/
export default async function handler(req, res) {
    try {
        // KHÔNG ép ensureMongo() ở đây nữa
        return app(req, res);
    } catch (err) {
        console.error('Handler error:', err);
        res.status(500).send('Internal Server Error');
    }
}

// (Tùy chọn chạy local: bật block dưới nếu muốn dev local)
// if (!process.env.VERCEL) {
//   const PORT = process.env.PORT || 3000;
//   getDb().catch(() => {}).finally(() => {
//     app.listen(PORT, () => console.log(`Local server listening at http://localhost:${PORT}`));
//   });
// }