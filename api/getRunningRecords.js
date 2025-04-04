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
const runningRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  time_data: {
    type: String, // 格式: "00:00:00"
    required: true
  },
  distance_data: {
    type: String, // 格式: "0.00 Km"
    required: true
  },
  kcal_data: {
    type: String, // 格式: "0.00 Kcal"
    required: true
  },
  speed_data: {
    type: String, // 配速格式: "0'00\""
    required: true
  },
  runType: {
    type: Number, // 0: 户外跑, 1: 室内跑
    default: 0
  },
  points_data: {
    type: Array, // 坐标点数据，用于绘制路线
    default: []
  },
  shareImage: {
    type: String, // 分享图片URL
    default: ''
  },
  runId: {
    type: String, // 跑步记录唯一ID
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RunningRecord = mongoose.models.RunningRecord || mongoose.model('RunningRecord', runningRecordSchema);

/**
 * API处理函数 - 获取跑步记录
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    // 获取参数
    const { userId, recordId, limit = 10, page = 1 } = req.query;
    
    // 验证必要参数
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter',
        details: 'userId is required'
      });
    }

    // 如果提供了recordId，则获取单条记录
    if (recordId) {
      const record = await RunningRecord.findOne({ runId: recordId });
      
      if (!record) {
        return res.status(404).json({
          error: 'Record not found',
          details: `No running record found with ID: ${recordId}`
        });
      }
      
      return res.status(200).json({
        success: true,
        data: record
      });
    }
    
    // 否则获取分页列表
    const skip = (page - 1) * limit;
    
    // 获取总记录数
    const totalRecords = await RunningRecord.countDocuments({ userId });
    
    // 获取分页数据，按日期倒序排列
    const records = await RunningRecord.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          total: totalRecords,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalRecords / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get running records error:', error);
    res.status(500).json({
      error: 'Error retrieving running records',
      details: error.message
    });
  }
}; 