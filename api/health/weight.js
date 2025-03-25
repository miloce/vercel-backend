const mongoose = require('mongoose');
const { connectToDatabase } = require('../../utils/db');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { userId, weight, date } = req.body;

      if (!userId || !weight || !date) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少必要参数' 
        });
      }

      // 更新或创建记录
      await HealthRecord.findOneAndUpdate(
        { userId, date },
        { $set: { weight } },
        { upsert: true }
      );

      res.json({ success: true });
    } else {
      res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error) {
    console.error('体重记录API错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}; 