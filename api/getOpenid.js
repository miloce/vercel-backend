const axios = require('axios');

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
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        error: 'Missing code parameter'
      });
    }

    // 检查环境变量
    if (!process.env.WECHAT_APP_ID || !process.env.WECHAT_APP_SECRET) {
      console.error('Missing WECHAT_APP_ID or WECHAT_APP_SECRET');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    // 请求微信接口
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APP_ID,
        secret: process.env.WECHAT_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = response.data;

    if (errcode) {
      console.error('WeChat API error:', errmsg);
      return res.status(400).json({
        error: errmsg
      });
    }

    // 返回成功结果
    return res.status(200).json({
      openid,
      session_key
    });

  } catch (error) {
    console.error('Error in getOpenid:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      message: error.message
    });
  }
}; 
