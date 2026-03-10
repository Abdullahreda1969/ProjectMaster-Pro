const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const NdviReading = require('../models/NdviReading');
const WeatherRecord = require('../models/WeatherRecord');

// GET /api/farms - جلب جميع المزارع
router.get('/', async (req, res) => {
    try {
        const farms = await Farm.find().sort({ createdAt: -1 });
        res.json({ success: true, count: farms.length, farms });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/farms/:id - جلب مزرعة محددة
router.get('/:id', async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) {
            return res.status(404).json({ success: false, message: 'المزرعة غير موجودة' });
        }
        res.json({ success: true, farm });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/farms - إضافة مزرعة جديدة
router.post('/', async (req, res) => {
    try {
        const farm = new Farm(req.body);
        await farm.save();
        res.status(201).json({ success: true, message: 'تمت إضافة المزرعة', farm });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/farms/:id - تحديث مزرعة
router.put('/:id', async (req, res) => {
    try {
        const farm = await Farm.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json({ success: true, message: 'تم التحديث', farm });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/farms/:id - حذف مزرعة
router.delete('/:id', async (req, res) => {
    try {
        await Farm.findByIdAndDelete(req.params.id);
        // حذف جميع القراءات المرتبطة
        await NdviReading.deleteMany({ farmId: req.params.id });
        await WeatherRecord.deleteMany({ farmId: req.params.id });
        res.json({ success: true, message: 'تم الحذف' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/farms/:id/ndvi - جلب قراءات NDVI للمزرعة
router.get('/:id/ndvi', async (req, res) => {
    try {
        const readings = await NdviReading.find({ farmId: req.params.id }).sort({ date: -1 });
        res.json({ success: true, readings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/farms/:id/ndvi - إضافة قراءة NDVI
router.post('/:id/ndvi', async (req, res) => {
    try {
        const reading = new NdviReading({
            farmId: req.params.id,
            ...req.body
        });
        await reading.save();
        
        // تحديث آخر NDVI في المزرعة
        await Farm.findByIdAndUpdate(req.params.id, { ndvi: req.body.value });
        
        res.status(201).json({ success: true, reading });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/farms/:id/weather - جلب سجلات الطقس للمزرعة
router.get('/:id/weather', async (req, res) => {
    try {
        const records = await WeatherRecord.find({ farmId: req.params.id }).sort({ date: -1 }).limit(10);
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;