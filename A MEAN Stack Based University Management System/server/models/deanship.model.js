const mongoose = require("mongoose");

const deanshipSchema = new mongoose.Schema(
  {
    dean: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "User", required: true,
    },
     staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
     description: {
      type: String,
      trim: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      unique: true, // Each college can have only one deanship at a time
   },

    startDate: { 
        type: Date, 
        required: true, 
        default: Date.now,
      validate: {
            validator: function(value) {
              return value <= new Date();
            },
            message: 'Start date cannot be in the future.'
          }
     },
endDate: {
  type: Date,
  validate: {
    validator: function(value) {
      return !value || value > this.startDate;
    },
    message: 'End date must be after the start date.'
  }
}
  },
  
{
    timestamps: true,
});

module.exports = mongoose.model("Deanship", deanshipSchema);

/*
{
  "dean": "64a7f0c8e4b0f5b6c8d9e8a1",
  "college": "64a7f0c8e4b0f5b6c8d9e8b2",
  "startDate": "2023-01-01",
  "endDate": "2025-01-01"
}
*/