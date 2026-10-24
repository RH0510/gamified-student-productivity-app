const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Get all tasks for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, xpReward } = req.body;
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      xpReward: xpReward || 10
      priority: priority || 'Medium',
      category: category || 'Academic'
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. Complete task & award XP
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    // Check that task exists AND belongs to logged-in user
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.completed) return res.status(400).json({ message: 'Task already completed' });

    task.completed = true;
    await task.save();

    // Award XP to User
    const user = await User.findById(req.user.id);
    user.xp = (user.xp || 0) + task.xpReward;
    
    // Level up calculation (e.g., Level up every 100 XP)
    const newLevel = Math.floor(user.xp / 100) + 1;
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    await user.save();

    res.json({ task, user: { xp: user.xp, level: user.level }, leveledUp });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;