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
  // 基本体重
  weight: {
    type: Number,
    default: 0
  },
  // 晚上体重
  eveningWeight: {
    type: Number,
    default: 0
  },
  // 摄入热量
  calorieIntake: {
    type: Number,
    default: 0
  },
  // 体脂率
  bodyFatPercentage: {
    type: Number,
    default: 0
  },
  // 锻炼时长(分钟)
  exerciseDuration: {
    type: Number,
    default: 0
  },
  // 腰围(厘米)
  waistCircumference: {
    type: Number,
    default: 0
  },
  // 臀围(厘米)
  hipCircumference: {
    type: Number,
    default: 0
  },
  // 大腿围(厘米)
  thighCircumference: {
    type: Number,
    default: 0
  },
  // 喝水量(毫升)
  waterIntake: {
    type: Number,
    default: 0
  },
  // 备注
  notes: {
    type: String,
    default: ''
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

// 创建复合索引确保每个用户每天只有一条记录
bodyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

const BodyStats = mongoose.models.BodyStats || mongoose.model('BodyStats', bodyStatsSchema);

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
        weight, 
        eveningWeight, 
        calorieIntake, 
        bodyFatPercentage, 
        exerciseDuration,
        waistCircumference,
        hipCircumference,
        thighCircumference,
        waterIntake,
        notes
      } = req.body;

      // 数据验证
      if (!userId || !date) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          details: 'userId and date are required'
        });
      }

      // 准备更新的数据
      const updateData = {};
      
      // 只更新提供的字段
      if (weight !== undefined) updateData.weight = Number(weight) || 0;
      if (eveningWeight !== undefined) updateData.eveningWeight = Number(eveningWeight) || 0;
      if (calorieIntake !== undefined) updateData.calorieIntake = Number(calorieIntake) || 0;
      if (bodyFatPercentage !== undefined) updateData.bodyFatPercentage = Number(bodyFatPercentage) || 0;
      if (exerciseDuration !== undefined) updateData.exerciseDuration = Number(exerciseDuration) || 0;
      if (waistCircumference !== undefined) updateData.waistCircumference = Number(waistCircumference) || 0;
      if (hipCircumference !== undefined) updateData.hipCircumference = Number(hipCircumference) || 0;
      if (thighCircumference !== undefined) updateData.thighCircumference = Number(thighCircumference) || 0;
      if (waterIntake !== undefined) updateData.waterIntake = Number(waterIntake) || 0;
      if (notes !== undefined) updateData.notes = notes || '';
      
      updateData.updatedAt = new Date();

      // 更新或创建记录
      const record = await BodyStats.findOneAndUpdate(
        { userId, date },
        updateData,
        { 
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      res.status(200).json({
        success: true,
        message: 'Body stats saved successfully',
        data: record
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method Not Allowed',
        details: 'Only POST method is supported'
      });
    }
  } catch (error) {
    console.error('Save body stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving body stats',
      details: error.message
    });
  }
}; 