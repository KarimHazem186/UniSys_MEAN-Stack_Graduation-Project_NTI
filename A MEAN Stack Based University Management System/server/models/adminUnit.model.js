const mongoose = require('mongoose');

const adminUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"name is required" ]
    }
})



