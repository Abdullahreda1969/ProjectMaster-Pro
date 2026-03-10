const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    address: String,
    governorate: String, // المحافظة
    area: { type: Number, required: true }, // المساحة بالدونم
    cropType: { type: String, default: 'بطاطا' },
    cropVariety: String, // صنف البطاطا
    plantingDate: Date,
    expectedHarvestDate: Date,
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'warning', 'harvested'],
        default: 'active'
    },
    ndvi: { type: Number, default: 0 }, // آخر قراءة NDVI
    soilType: String,
    irrigationType: String,
    images: [String],
    notes: String,
    owner: {
        name: String,
        phone: String,
        email: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// إنشاء فهارس للبحث السريع
farmSchema.index({ location: '2dsphere' }); // للبحث الجغرافي
farmSchema.index({ governorate: 1 });
farmSchema.index({ status: 1 });

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;