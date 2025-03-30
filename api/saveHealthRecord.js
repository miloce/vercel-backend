const mongoose = require('mongoose');

/**
 * 数据库连接配置
 * @returns {Promise} Mongoose连接实例
 */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/?retryWrites=true&w=majority&appName=miloce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

/**
 * 健康记录数据模型
 */
const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    default: 0
  },
  // 饮食记录
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'extra'],
      required: true
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
  // 多个运动记录数组
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
  // 保留单个运动记录字段，保持向后兼容
  exercise: {
    duration: {
      type: Number,
      default: 0
    },
    calories: {
      type: Number,
      default: 0
    },
    exerciseType: {
      type: String,
      default: ''
    }
  },
  // 记录创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);

/**
 * API处理函数
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { userId, date, weight, meals, exercises, exercise } = req.body;

      // 数据验证
      if (!userId || !date) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'userId and date are required'
        });
      }

      // 构建更新数据
      const updateData = {
        weight: Number(weight) || 0,
        meals: Array.isArray(meals) ? meals.map(meal => ({
          mealType: meal.type,
          calories: Number(meal.calories) || 0,
          description: meal.description || ''
        })) : [],
        updatedAt: new Date()
      };

      // 处理新的exercises数组
      if (Array.isArray(exercises) && exercises.length > 0) {
        updateData.exercises = exercises.map(ex => ({
          duration: Number(ex.duration) || 0,
          calories: Number(ex.calories) || 0,
          type: ex.type || ''
        }));
      } else {
        updateData.exercises = [];
      }

      // 保留对旧版本的兼容性
      if (exercise) {
        updateData.exercise = {
          duration: Number(exercise.duration) || 0,
          calories: Number(exercise.calories) || 0,
          exerciseType: exercise.type || ''
        };
      }

      // 更新或创建记录
      const record = await HealthRecord.findOneAndUpdate(
        { userId, date },
        updateData,
        { 
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        success: true,
        message: 'Health record saved successfully',
        data: record
      });
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Save health record error:', error);
    res.status(500).json({
      error: 'Error saving health record',
      details: error.message
    });
  }
}; 