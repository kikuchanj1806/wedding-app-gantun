// src/db/mongo.js
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;

/** Kết nối và trả về đối tượng db */
export async function connectMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI');

    client = new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });

    await client.connect();
    // kiểm tra kết nối
    await client.db().command({ ping: 1 });

    // Trả về DB mặc định
    return client.db(process.env.MONGODB_DB || 'wedding');
}

/** Đóng kết nối */
export async function closeMongo() {
    if (client) {
        await client.close();
        client = undefined;
    }
}

// (tuỳ chọn) export default gộp
export default { connectMongo, closeMongo };
