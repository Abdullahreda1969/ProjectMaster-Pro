const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    area: { type: Number, required: true },
    cropType: String,
    cropVariety: String,
    plantingDate: Date,
    ndvi: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    polygonId: { type: String, default: null }, // <-- هذا الحقل الجديد
    images: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;