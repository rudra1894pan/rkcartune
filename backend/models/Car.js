const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true, index: true },
    carName: { type: String, required: true, trim: true, index: true },
    modelYear: { type: Number, required: true, min: 1980, max: new Date().getFullYear() + 1 },
    price: { type: Number, required: true, min: 0 },
    fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] },
    transmission: { type: String, required: true, enum: ['Manual', 'Automatic'] },
    kmDriven: { type: Number, required: true, min: 0 },
    owners: { type: Number, required: true, default: 1, min: 1 },
    description: { type: String, trim: true, default: '' },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one image is required.',
      },
    },
    status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available', index: true },
  },
  { timestamps: true }
);

CarSchema.index({ brand: 'text', carName: 'text' });

module.exports = mongoose.model('Car', CarSchema);
