
import mongoose from 'mongoose';

const GuestSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    side: { type: String, enum: ['bride', 'groom'], default: 'bride' },
    rsvp: { type: String, enum: ['yes', 'no', 'maybe'], default: 'maybe' },
    note: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Guest', GuestSchema);
