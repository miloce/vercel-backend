const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/?retryWrites=true&w=majority&appName=miloce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    default: 0
  },
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'extra']
    },
    calories: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    }
  }],
  exercises: [{
    duration: {
      type: Number,
      default: 0
    },
    calories: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default: ''
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { userId, date } = req.query;
      const record = await HealthRecord.findOne({ userId, date });
      
      // 格式化返回数据
      const formattedData = record ? {
        userId: record.userId,
        date: record.date,
        weight: record.weight || 0,
        meals: record.meals.map(meal => ({
          type: meal.mealType,
          calories: meal.calories,
          description: meal.description
        })),
        exercises: record.exercises && Array.isArray(record.exercises) ? 
          record.exercises.map(ex => ({
            duration: ex.duration || 0,
            calories: ex.calories || 0,
            type: ex.type || ''
          })) : [],
        updatedAt: record.updatedAt
      } : {
        userId,
        date,
        weight: 0,
        meals: [],
        exercises: [],
      };

      res.status(200).json({
        success: true,
        data: formattedData
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed'
      });
    }
  } catch (error) {
    console.error('Error fetching health record:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching health record',
      details: error.message
    });
  }
}; 