const mongoose = require("mongoose");

const adminUnitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [3, "name must be at least 3 characters"],
      maxlength: [20, "name must not exceed 20 characters"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: "name can only contain letters and spaces",
      },
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
      minlength: [3, "Description must be at least 3 characters"],
    },

    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: false,
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: false,
    },
  },
  {
    timestamps: true,
    }
);

adminUnitSchema.pre("validate", function (next) {
  //   if (!this.college && !this.university) {
  //     this.invalidate("college", "Either college or university must be specified");
  //     this.invalidate("university", "Either college or university must be specified");
  //   }
  if (
    (this.college && this.university) ||
    (!this.college && !this.university)
  ) {
    this.invalidate("college", "Specify exactly one of college or university");
    this.invalidate(
      "university",
      "Specify exactly one of college or university"
    );
  }
  next();
});

adminUnitSchema.index(
  { name: 1, college: 1 },
  { unique: true, partialFilterExpression: { college: { $exists: true } } }
);

adminUnitSchema.index(
  { name: 1, university: 1 },
  { unique: true, partialFilterExpression: { university: { $exists: true } } }
);

module.exports = mongoose.model("AdminUnit", adminUnitSchema);
