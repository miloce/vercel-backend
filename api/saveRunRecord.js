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
 * 跑步记录数据模型
 */
const runRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  runId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: "00:00:00"
  },
  distance: {
    type: Number,
    default: 0
  },
  speed: {
    type: String,
    default: "0'00\""
  },
  calories: {
    type: Number,
    default: 0
  },
  runType: {
    type: Number,
    default: 0  // 0: 户外跑, 1: 室内跑
  },
  points: [{
    latitude: Number,
    longitude: Number,
    timestamp: Number
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const RunRecord = mongoose.models.RunRecord || mongoose.model('RunRecord', runRecordSchema);

/**
 * API处理函数
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { userId, runId, date, time, distance, speed, calories, runType, points } = req.body;

      // 数据验证
      if (!userId || !runId) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'userId and runId are required'
        });
      }

      // 构建更新数据
      const runData = {
        userId,
        runId,
        date: date || new Date().toISOString().split('T')[0],
        time: time || "00:00:00",
        distance: Number(distance) || 0,
        speed: speed || "0'00\"",
        calories: Number(calories) || 0,
        runType: Number(runType) || 0,
        points: Array.isArray(points) ? points : [],
        updatedAt: new Date()
      };

      // 更新或创建记录
      const record = await RunRecord.findOneAndUpdate(
        { userId, runId },
        runData,
        { 
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        success: true,
        message: 'Run record saved successfully',
        data: record
      });
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Save run record error:', error);
    res.status(500).json({
      error: 'Error saving run record',
      details: error.message
    });
  }
}; 