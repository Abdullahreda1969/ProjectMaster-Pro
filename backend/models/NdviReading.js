const mongoose = require('mongoose');

const ndviReadingSchema = new mongoose.Schema({
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    date: { type: Date, default: Date.now },
    value: { type: Number, required: true }, // قيمة NDVI بين -1 و 1
    source: { type: String, enum: ['satellite', 'drone', 'manual'], default: 'satellite' },
    imageUrl: String,
    notes: String,
    metadata: {
        satellite: String, // Sentinel-2, Landsat, إلخ
        cloudCover: Number,
        resolution: Number
    }
});

// فهرس للبحث السريع
ndviReadingSchema.index({ farmId: 1, date: -1 });

const NdviReading = mongoose.model('NdviReading', ndviReadingSchema);
module.exports = NdviReading;