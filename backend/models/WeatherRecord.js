const mongoose = require('mongoose');

const weatherRecordSchema = new mongoose.Schema({
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    date: { type: Date, default: Date.now },
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: Number,
    precipitation: Number,
    cloudCover: Number,
    condition: String,
    source: { type: String, default: 'OpenWeatherMap' }
});

weatherRecordSchema.index({ farmId: 1, date: -1 });

const WeatherRecord = mongoose.model('WeatherRecord', weatherRecordSchema);
module.exports = WeatherRecord;