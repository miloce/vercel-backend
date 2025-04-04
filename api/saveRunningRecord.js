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
 * API处理函数 - 保存跑步记录
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { 
        userId, 
        date, 
        time_data, 
        distance_data, 
        kcal_data, 
        speed_data, 
        runType, 
        points_data, 
        shareImage, 
        runId 
      } = req.body;

      // 数据验证
      if (!userId || !runId || !date || !time_data || !distance_data || !kcal_data) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'userId, runId, date, time_data, distance_data and kcal_data are required'
        });
      }

      // 构建跑步记录
      const runningRecord = {
        userId,
        date,
        time_data,
        distance_data,
        kcal_data,
        speed_data: speed_data || "0'00\"",
        runType: runType !== undefined ? runType : 0,
        points_data: Array.isArray(points_data) ? points_data : [],
        shareImage: shareImage || '',
        runId,
        createdAt: new Date()
      };

      // 存储记录 - 如果记录存在则更新，否则创建新记录
      const record = await RunningRecord.findOneAndUpdate(
        { runId },
        runningRecord,
        { 
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      res.status(200).json({
        success: true,
        message: 'Running record saved successfully',
        data: record
      });
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Save running record error:', error);
    res.status(500).json({
      error: 'Error saving running record',
      details: error.message
    });
  }
}; 