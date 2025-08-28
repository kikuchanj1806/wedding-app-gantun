import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Home', message: 'Xin chào từ EJS!' });
});

export default router; // <-- ESM
