import { Router } from 'express';
const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const blessings = await db.collection('blessings')
            .find({}, { projection: { _id: 0 } })
            .sort({ createdAt: -1 })
            .limit(30)
            .toArray();

        // Log số lượng và chi tiết
        console.log('Blessings count:', blessings.length);
        console.log('Blessings:', blessings);

        res.render('index', { title: 'Trang chủ', blessings });
    } catch (e) {
        next(e);
    }
});
export default router; // <-- ESM
