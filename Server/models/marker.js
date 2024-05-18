const mongoose = require('mongoose');

const MarkerSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    lat: Number,
    lng: Number
});

module.exports = mongoose.model('Marker', MarkerSchema);
