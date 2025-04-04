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
  date: {
    type: String,
    required: true
  },
  time_data: {
    type: String,
    required: true
  },
  distance_data: {
    type: String,
    required: true
  },
  speed_data: {
    type: String,
    default: "0'00\""
  },
  kcal_data: {
    type: String,
    required: true
  },
  runType: {
    type: Number,
    enum: [0, 1], // 0: 户外跑, 1: 室内跑
    default: 0
  },
  // 轨迹点数据 (可选，只有户外跑才有)
  points_data: [{
    latitude: Number,
    longitude: Number,
    timestamp: Number
  }],
  // 海拔数据 (可选)
  altitude_data: [{
    altitude: Number,
    timestamp: Number
  }],
  // 每公里配速 (可选)
  km_speed_data: [{
    km: Number,
    speed: String,
    timestamp: Number
  }],
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
      const { 
        userId, 
        date, 
        time_data, 
        distance_data, 
        speed_data, 
        kcal_data, 
        runType,
        points_data,
        altitude_data,
        km_speed_data
      } = req.body;

      // 数据验证
      if (!userId || !date || !time_data || !distance_data || !kcal_data) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'userId, date, time_data, distance_data, and kcal_data are required'
        });
      }

      // 构建记录数据
      const runData = {
        userId,
        date,
        time_data,
        distance_data,
        kcal_data,
        updatedAt: new Date()
      };

      // 添加可选字段
      if (speed_data) runData.speed_data = speed_data;
      if (runType !== undefined) runData.runType = runType;
      
      // 添加轨迹点数据 (如果有)
      if (Array.isArray(points_data) && points_data.length > 0) {
        runData.points_data = points_data.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude,
          timestamp: point.timestamp || Date.now()
        }));
      }
      
      // 添加海拔数据 (如果有)
      if (Array.isArray(altitude_data) && altitude_data.length > 0) {
        runData.altitude_data = altitude_data.map(item => ({
          altitude: item.altitude,
          timestamp: item.timestamp || Date.now()
        }));
      }
      
      // 添加每公里配速数据 (如果有)
      if (Array.isArray(km_speed_data) && km_speed_data.length > 0) {
        runData.km_speed_data = km_speed_data.map(item => ({
          km: item.km,
          speed: item.speed,
          timestamp: item.timestamp || Date.now()
        }));
      }

      // 创建唯一ID，用于区分同一天的多个跑步记录
      const recordId = `${userId}_${date}_${Date.now()}`;

      // 保存记录
      const record = await RunRecord.findOneAndUpdate(
        { _id: recordId },
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
    } else if (req.method === 'GET') {
      // 获取用户的跑步记录
      const { userId, date, limit = 10, skip = 0 } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          details: 'userId is required'
        });
      }
      
      // 构建查询条件
      const query = { userId };
      if (date) query.date = date;
      
      // 查询总数
      const total = await RunRecord.countDocuments(query);
      
      // 获取记录
      const records = await RunRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));
      
      res.status(200).json({
        success: true,
        total,
        data: records
      });
    } else {
      res.status(405).json({
        error: 'Method Not Allowed',
        details: 'Only POST and GET methods are supported'
      });
    }
  } catch (error) {
    console.error('Run record API error:', error);
    res.status(500).json({
      error: 'Error processing run record',
      details: error.message
    });
  }
}; 