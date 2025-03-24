const axios = require('axios');

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        error: 'Missing code parameter'
      });
    }

    // 请求微信接口获取 openid
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WECHAT_APP_ID,
        secret: WECHAT_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = response.data;

    if (errcode) {
      return res.status(400).json({
        error: errmsg
      });
    }

    // 返回 openid 和 session_key
    res.status(200).json({
      openid,
      session_key
    });

  } catch (error) {
    console.error('Error getting openid:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}; 