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

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// 使用相同的数据存储
let userDataStore = new Map();

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
    console.log('Requesting data for openid:', openid); // 调试日志

    if (!openid) {
      return res.status(400).json({
        error: 'Missing openid parameter'
      });
    }

    // 从存储中获取数据
    let userData = userDataStore.get(openid);
    console.log('Retrieved data:', userData); // 调试日志

    // 如果没有找到数据，返回默认值
    if (!userData) {
      userData = {
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
    }

    // 返回数据
    return res.status(200).json(userData);

  } catch (error) {
    console.error('Error in getUserData:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
};
