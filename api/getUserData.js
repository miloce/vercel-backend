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
  userData: Object,
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
    const { openid } = req.query;

    if (!openid) {
      return res.status(400).json({
        error: 'Missing openid parameter'
      });
    }

    // 返回默认数据结构
    const userData = {
      openid: openid,
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      bodyFat: '',
      bmi: '',
      calorieIntake: '',
      birthDate: '',
      lastUpdate: new Date().toISOString()
    };

    // 返回成功响应
    return res.status(200).json(userData);

  } catch (error) {
    console.error('Error in getUserData:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
};
