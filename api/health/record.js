const mongoose = require('mongoose');
const { connectToDatabase } = require('../../utils/db');

// 健康记录模型
const HealthRecord = mongoose.model('HealthRecord', {
  userId: String,
  date: String,
  weight: Number,
  meals: [{
    type: String,
    calories: Number,
    items: [{
      name: String,
      calories: Number,
      amount: Number
    }]
  }],
  exercise: [{
    name: String,
    duration: Number,
    caloriesBurned: Number
  }]
});

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const { userId, date } = req.query;
      
      // 获取当天记录
      const record = await HealthRecord.findOne({ userId, date });
      
      // 获取所有记录用于统计
      const allRecords = await HealthRecord.find({ userId }).sort({ date: 1 });
      
      const response = {
        weight: record?.weight || 0,
        recordDays: allRecords.length,
        initialWeight: allRecords[0]?.weight || 0,
        weightLoss: allRecords[0]?.weight - (record?.weight || 0),
        caloriesExceeded: calculateCaloriesExceeded(record),
        caloriesBurned: calculateCaloriesBurned(record)
      };

      res.json({ success: true, data: response });
    } else {
      res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error) {
    console.error('健康记录API错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

function calculateCaloriesExceeded(record) {
  if (!record?.meals) return 0;
  return record.meals.reduce((total, meal) => {
    return total + (meal.calories || 0);
  }, 0);
}

function calculateCaloriesBurned(record) {
  if (!record?.exercise) return 0;
  return record.exercise.reduce((total, exercise) => {
    return total + (exercise.caloriesBurned || 0);
  }, 0);
} 