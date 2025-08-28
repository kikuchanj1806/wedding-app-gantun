// ESM
export function buildCorsOptions() {
    const origins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const allowAll = origins.includes('*');

    return {
        origin(origin, cb) {
            // Requests không có Origin (server-side, curl, Postman) -> cho qua
            if (!origin) return cb(null, true);
            if (allowAll || origins.includes(origin)) return cb(null, true);
            return cb(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
        methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
        allowedHeaders: ['Content-Type','Authorization'],
        optionsSuccessStatus: 204,
    };
}
