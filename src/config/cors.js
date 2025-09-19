// src/config/cors.js
export function buildCorsOptions() {
    const whitelist = [
        'http://localhost:6002',
        process.env.ALLOWED_ORIGIN, // cho phép cấu hình thêm qua .env
    ].filter(Boolean);

    const localhostRegex = /^http:\/\/localhost:\d+$/;
    const loopbackRegex  = /^http:\/\/127\.0\.0\.1:\d+$/;

    return {
        origin(origin, cb) {
            // Request nội bộ (same-origin) hoặc công cụ như Postman sẽ không có Origin => cho qua
            if (!origin) return cb(null, true);

            // Cho phép file:// (Origin: null) — CHỈ DEV nếu bạn đang mở file tĩnh từ ổ đĩa
            if (origin === 'null' && process.env.NODE_ENV !== 'production') {
                return cb(null, true);
            }

            if (
                whitelist.includes(origin) ||
                localhostRegex.test(origin) ||
                loopbackRegex.test(origin)
            ) {
                return cb(null, true);
            }

            return cb(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
        methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
        allowedHeaders: ['Content-Type','Authorization'],
        maxAge: 86400, // cache preflight 1 ngày
    };
}