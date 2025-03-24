const axios = require('axios');

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).send('Code is required');
  }

  try {
    // 调用微信接口获取openid
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    );

    const { openid, session_key } = response.data;

    if (!openid) {
      throw new Error('Failed to get openid');
    }

    res.status(200).json({ openid });
  } catch (error) {
    console.error('Error getting openid:', error);
    res.status(500).send('Error getting openid');
  }
}; 