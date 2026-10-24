const Habit = require('../models/Habit');
const User = require('../models/User');

exports.completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const now = new Date();
    const last = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
    
    let isConsecutive = false;
    if (last) {
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours >= 20 && diffHours <= 48) {
        isConsecutive = true; // Completed consecutive day
      } else if (diffHours < 20) {
        return res.status(400).json({ message: 'Habit already completed today' });
      }
    }

    // Update streak
    habit.streakCount = isConsecutive ? habit.streakCount + 1 : 1;
    habit.lastCompleted = now;
    await habit.save();

    // Award XP to user (e.g., 15 XP per habit completed)
    const xpEarned = 15;
    await User.findByIdAndUpdate(habit.userId, { $inc: { xp: xpEarned } });

    res.json({ message: 'Habit marked as complete!', streakCount: habit.streakCount, xpEarned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};