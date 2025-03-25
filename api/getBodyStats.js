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
 * 身体数据统计模型
 */
const bodyStatsSchema = new mongoose.Schema({
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
  eveningWeight: {
    type: Number,
    default: 0
  },
  calorieIntake: {
    type: Number,
    default: 0
  },
  bodyFatPercentage: {
    type: Number,
    default: 0
  },
  exerciseDuration: {
    type: Number,
    default: 0
  },
  waistCircumference: {
    type: Number,
    default: 0
  },
  hipCircumference: {
    type: Number,
    default: 0
  },
  thighCircumference: {
    type: Number,
    default: 0
  },
  waterIntake: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
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

const BodyStats = mongoose.models.BodyStats || mongoose.model('BodyStats', bodyStatsSchema);

/**
 * API处理函数
 * @param {Object} req - HTTP请求对象
 * @param {Object} res - HTTP响应对象
 */
module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { userId, date, startDate, endDate } = req.query;

      // 验证必填参数
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter',
          details: 'userId is required'
        });
      }

      // 查询条件
      const query = { userId };

      // 如果提供了具体日期，获取单一日期的数据
      if (date) {
        query.date = date;
        const record = await BodyStats.findOne(query);
        
        if (record) {
          return res.status(200).json({
            success: true,
            data: record
          });
        } else {
          // 如果找不到记录，返回默认空记录
          return res.status(200).json({
            success: true,
            data: {
              userId,
              date,
              weight: 0,
              eveningWeight: 0,
              calorieIntake: 0,
              bodyFatPercentage: 0,
              exerciseDuration: 0,
              waistCircumference: 0,
              hipCircumference: 0,
              thighCircumference: 0,
              waterIntake: 0,
              notes: ''
            }
          });
        }
      }
      
      // 如果提供了日期范围，获取该范围内的所有记录
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.date = { $gte: startDate };
      } else if (endDate) {
        query.date = { $lte: endDate };
      }

      // 获取记录并按日期排序
      const records = await BodyStats.find(query).sort({ date: -1 });

      res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        details: 'Only GET method is supported'
      });
    }
  } catch (error) {
    console.error('Error fetching body stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching body stats',
      details: error.message
    });
  }
}; 