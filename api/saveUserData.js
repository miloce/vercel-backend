const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/?retryWrites=true&w=majority&appName=miloce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const userSchema = new mongoose.Schema({
  userId: String,
  userData: {
    name: String,
    age: String,
    gender: String,
    height: String,
    weight: String,
    bodyFat: String,
    bmi: String,
    calorieIntake: String,
    birthDate: String,
    lastUpdate: String
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 设置 CORS 头
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
  // 设置 CORS
  setCorsHeaders(res);

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 连接数据库
    await connectDB();

    // 检查请求方法
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: '只支持 POST 请求'
      });
    }

    const { openid, field, value } = req.body;
    console.log('Received update:', { openid, field, value });

    if (!openid || !field) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 构建更新对象
    const updateData = {
      [`userData.${field}`]: value,
      'userData.lastUpdate': new Date().toISOString()
    };

    // 只更新指定字段
    const result = await User.findOneAndUpdate(
      { userId: openid },
      { 
        $set: updateData
      },
      { upsert: true, new: true }
    );

    console.log('Updated MongoDB:', result);

    return res.status(200).json({
      success: true,
      message: '数据保存成功',
      data: result.userData
    });

  } catch (error) {
    console.error('Error in saveUserData:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
};
