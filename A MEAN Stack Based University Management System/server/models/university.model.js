const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "University name is required"],
        trim: true,
        minlength: [2, "University name must be at least 2 characters"],
        maxlength: [100, "University name must not exceed 100 characters"]
    },

    code: {
      type: String,
      required: true,
      unique: true,
        uppercase: true,
        trim: true,
        minlength: [2, "University code must be at least 2 characters"],
        maxlength: [10, "University code must not exceed 10 characters"],
        match: [/^[A-Z0-9]+$/, "University code can only contain uppercase letters and numbers"],

    },

    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) return true; // Allow empty
                return /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\.-]*)*\/?$/.test(value);
            },
            message: "Please enter a valid website URL"
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return /^\+?[0-9\s\-]{7,15}$/.test(value);
            },
            message: "Please enter a valid phone number"
        }
    },

    location: {
        type: String,
        trim: true,
        maxlength: [100, "Location must not exceed 100 characters"]
    },
    establishedYear: {
        type: Number,
        min: [1800, "Year must be no earlier than 1800"],
        max: [new Date().getFullYear(), "Year cannot be in the future"]
    },
}, {
    timestamps:true
})


module.exports = mongoose.model("University", universitySchema);