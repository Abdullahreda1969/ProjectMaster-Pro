const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const NdviReading = require('../models/NdviReading');
const WeatherRecord = require('../models/WeatherRecord');
const axios = require('axios'); // <-- أضف هذا السطر


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
            return res.status(404).json({ 
                success: false, 
                message: 'المزرعة غير موجودة' 
            });
        }
        res.json({ success: true, farm });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/farms - إنشاء مزرعة جديدة
router.post('/', async (req, res) => {
    try {
        console.log('🔑 AGRO_API_KEY from env:', process.env.AGRO_API_KEY);
        console.log('📥 بيانات المزرعة المستلمة:', req.body);
        
        // استخدام polygon_id موجود (الأقرب لمنطقة بغداد)
        // اختر أحد هذه الـ polygons المتاحة:
        // 69b464c43d476875574cda1c - منطقة شمال العراق
        // 69b24b30ce8f57ff46dd7ba3 - منطقة بغداد
        // 69b749cd3d4768a20f4cda34 - آخر polygon تم إنشاؤه
        
        const polygonId = '69b464c43d476875574cda1c'; // اختر الأنسب
        
        // إنشاء المزرعة مع polygonId الموجود
        const farmData = {
            name: req.body.name,
            location: req.body.location,
            area: req.body.area,
            cropType: req.body.cropType || 'بطاطا',
            cropVariety: req.body.cropVariety || '',
            plantingDate: req.body.plantingDate || null,
            ndvi: req.body.ndvi || 0,
            status: req.body.status || 'active',
            polygonId: polygonId, // استخدام polygon_id الموجود
            images: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const farm = new Farm(farmData);
        await farm.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المزرعة بنجاح',
            farm: farm
        });
    } catch (error) {
        console.error('خطأ في إنشاء المزرعة:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/farms/:id - تحديث مزرعة
router.put('/:id', async (req, res) => {
    try {
        console.log('📝 تحديث مزرعة:', req.params.id, req.body);
        
        const farm = await Farm.findByIdAndUpdate(
            req.params.id,
            { 
                ...req.body, 
                updatedAt: new Date() 
            },
            { new: true, runValidators: true }
        );
        
        if (!farm) {
            return res.status(404).json({ 
                success: false, 
                message: 'المزرعة غير موجودة' 
            });
        }
        
        console.log('✅ تم تحديث المزرعة:', farm._id);
        
        res.json({ 
            success: true, 
            message: 'تم تحديث المزرعة بنجاح',
            farm: farm 
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث المزرعة:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في تحديث المزرعة', 
            error: error.message 
        });
    }
});

// DELETE /api/farms/:id - حذف مزرعة
router.delete('/:id', async (req, res) => {
    try {
        console.log('🗑️ طلب حذف مزرعة بالـ ID:', req.params.id);
        
        const farm = await Farm.findByIdAndDelete(req.params.id);
        
        if (!farm) {
            return res.status(404).json({ 
                success: false, 
                message: 'المزرعة غير موجودة' 
            });
        }
        
        // حذف جميع القراءات المرتبطة (اختياري)
        await NdviReading?.deleteMany({ farmId: req.params.id });
        await WeatherRecord?.deleteMany({ farmId: req.params.id });
        
        console.log('✅ تم حذف المزرعة:', req.params.id);
        
        res.json({ 
            success: true, 
            message: 'تم حذف المزرعة بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف المزرعة:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في حذف المزرعة', 
            error: error.message 
        });
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