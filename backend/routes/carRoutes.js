const express = require('express');
const mongoose = require('mongoose');
const Car = require('../models/Car');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * POST /api/cars/upload — admin only
 * Accepts up to 10 image files (field name: "images"), stores them on disk,
 * returns their public URLs so the admin form can add them to a car's `images` array.
 */
router.post('/upload', protect, adminOnly, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    res.status(201).json({ success: true, data: urls });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});


/**
 * GET /api/cars
 * Query params: search, brand, fuelType, transmission, minPrice, maxPrice, sortBy, order, page, limit
 * (Same filter shape as index.php's brand/search handling, extended for a real marketplace.)
 */
router.get('/', async (req, res) => {
  try {
    const { search, brand, fuelType, transmission, minPrice, maxPrice, sortBy, order } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 100);

    const filter = { status: { $ne: 'sold' } };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ brand: regex }, { carName: regex }];
    }
    if (brand) filter.brand = brand;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const SORTABLE = new Set(['price', 'modelYear', 'kmDriven']);
    let sort = { createdAt: -1 };
    if (sortBy && SORTABLE.has(sortBy)) {
      sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    }

    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Car.countDocuments(filter),
    ]);

    res.json({ success: true, count: cars.length, total, page, totalPages: Math.ceil(total / limit) || 1, data: cars });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cars', error: err.message });
  }
});

/** GET /api/cars/brands — distinct brand list for filter chips */
router.get('/brands', async (req, res) => {
  try {
    const brands = await Car.distinct('brand', { status: { $ne: 'sold' } });
    res.json({ success: true, data: brands.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch brands', error: err.message });
  }
});

/** GET /api/cars/:id */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }
    const car = await Car.findById(req.params.id).lean();
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch car', error: err.message });
  }
});

/** POST /api/cars — admin only */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json({ success: true, data: car });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create car', error: err.message });
  }
});

/** PUT /api/cars/:id — admin only */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: car });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update car', error: err.message });
  }
});

/** DELETE /api/cars/:id — admin only */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete car', error: err.message });
  }
});

module.exports = router;
