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

    if (req.method === 'GET') {
      const { userId, runId, limit = 10, skip = 0 } = req.query;

      // 数据验证
      if (!userId) {
        return res.status(400).json({
          error: 'Missing required field',
          details: 'userId is required'
        });
      }

      // 如果提供了runId，则获取单条记录
      if (runId) {
        const record = await RunRecord.findOne({ userId, runId });
        
        if (!record) {
          return res.status(404).json({
            error: 'Record not found',
            details: `No record found with runId: ${runId}`
          });
        }
        
        // 更新浏览次数
        record.viewCount += 1;
        await record.save();
        
        return res.status(200).json({
          success: true,
          data: record
        });
      }
      
      // 否则获取用户的所有记录
      const limitNum = parseInt(limit);
      const skipNum = parseInt(skip);
      
      const records = await RunRecord.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum);
        
      const totalCount = await RunRecord.countDocuments({ userId });
      
      return res.status(200).json({
        success: true,
        data: {
          records,
          total: totalCount,
          page: Math.floor(skipNum / limitNum) + 1,
          limit: limitNum
        }
      });
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only GET method is supported'
      });
    }
  } catch (error) {
    console.error('Get run records error:', error);
    res.status(500).json({
      error: 'Error getting run records',
      details: error.message
    });
  }
}; 