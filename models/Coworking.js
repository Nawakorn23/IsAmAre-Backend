const mongoose = require("mongoose");

const CoworkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 charaters"],
    },
    address: {
      type: String,
      required: [true, "Please add a address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postslcode"],
      maxlength: [5, "Postal Code can not be more than 5 digits"],
    },
    telephone: {
      type: String,
    },
    region: {
      type: String,
      required: [true, "Please add a region"],
    },
    opentime: {
      type: Date,
      required: true
    },
    closetime: {
      type: String,
      required: true
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete appointments when a coworking is deleted
CoworkingSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Appointments begin removed from coworking ${this._id}`);
    await this.model("Appointment").deleteMany({ coworking: this._id });
    next();
  }
);

// Reverse populate with virtuals
CoworkingSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "coworking",
  justOne: false,
});

module.exports = mongoose.model("Coworking", CoworkingSchema);
