import { Router } from 'express';

const router = Router();
const COLL = 'blessings';

// Helper: hạn chế độ dài & trim
const clamp = (s, max) => (s || '').toString().trim().slice(0, max);

router.post('/', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const name = clamp(req.body.name, 25);
        const message = clamp(req.body.message, 280); // tuỳ bạn
        if (!name || !message) {
            return res.status(400).json({ ok: false, error: 'Vui lòng nhập tên và lời chúc.' });
        }

        const doc = {
            name,
            message,
            createdAt: new Date(),
            ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
            ua: req.headers['user-agent'] || null,
        };

        await db.collection(COLL).insertOne(doc);
        // Trả về object nhẹ cho client
        res.json({ ok: true, data: { name: doc.name, message: doc.message, createdAt: doc.createdAt } });
    } catch (e) { next(e); }
});

export default router;