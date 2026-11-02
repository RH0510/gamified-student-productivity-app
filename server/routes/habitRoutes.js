const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const habitController = require('../controllers/habitController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all habits for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new habit
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, frequency } = req.body;
    const newHabit = new Habit({
      userId: req.user.id,
      title,
      frequency: frequency || 'daily'
    });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Complete habit & check streaks
router.put('/:id/complete', authMiddleware, habitController.completeHabit);

// Delete habit
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;