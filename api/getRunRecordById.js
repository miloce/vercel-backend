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
 * API处理函数 - 仅通过runId获取跑步记录
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { runId } = req.query;

      // 数据验证
      if (!runId) {
        return res.status(400).json({
          error: 'Missing required field',
          details: 'runId is required'
        });
      }

      // 仅根据runId查询记录，不需要userId
      const record = await RunRecord.findOne({ runId });
      
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
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only GET method is supported'
      });
    }
  } catch (error) {
    console.error('Get run record by ID error:', error);
    res.status(500).json({
      error: 'Error getting run record',
      details: error.message
    });
  }
}; 