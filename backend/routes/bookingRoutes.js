const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { bookingRequestedEmail, bookingStatusUpdatedEmail } = require('../utils/email');

const router = express.Router();

/** POST /api/bookings — logged-in user requests a viewing ("Check Availability") */
router.post('/', protect, async (req, res) => {
  try {
    const { carId, visitDate, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.status === 'sold') {
      return res.status(400).json({ success: false, message: 'This car has already been sold.' });
    }

    const booking = await Booking.create({
      car: carId,
      user: req.user._id,
      visitDate,
      message,
    });

    const populated = await booking.populate('car', 'brand carName images price');

    // Notify admins by email — a failed send never blocks the booking itself
    const admins = await User.find({ role: 'admin' }).select('email');
    const carLabel = `${car.brand} ${car.carName}`;
    admins.forEach((admin) => {
      bookingRequestedEmail({
        adminEmail: admin.email,
        userName: req.user.name,
        userPhone: req.user.phone,
        carLabel,
        visitDate,
      });
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create booking', error: err.message });
  }
});

/** GET /api/bookings/mine — current user's bookings ("My Bookings") */
router.get('/mine', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car', 'brand carName images price status')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
  }
});

/** GET /api/bookings — all bookings, admin only ("Manage Bookings") */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car', 'brand carName images price')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err.message });
  }
});

/** PUT /api/bookings/:id/status — admin confirms/cancels a booking */
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('car', 'brand carName')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (status === 'confirmed' || status === 'cancelled') {
      bookingStatusUpdatedEmail({
        userEmail: booking.user.email,
        userName: booking.user.name,
        carLabel: `${booking.car.brand} ${booking.car.carName}`,
        status,
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking', error: err.message });
  }
});

/** DELETE /api/bookings/:id — user cancels their own pending booking */
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    await booking.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: err.message });
  }
});

module.exports = router;
