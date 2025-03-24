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

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 连接数据库
    await connectDB();

    const { openid } = req.query;
    console.log('Requesting data for openid:', openid);

    if (!openid) {
      return res.status(400).json({
        error: 'Missing openid parameter'
      });
    }

    // 从 MongoDB 获取数据
    const user = await User.findOne({ userId: openid });
    console.log('Retrieved from MongoDB:', user);

    // 如果没有找到数据，返回默认值
    if (!user) {
      const defaultData = {
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
      return res.status(200).json(defaultData);
    }

    // 返回找到的数据
    return res.status(200).json(user.userData);

  } catch (error) {
    console.error('Error in getUserData:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
};
