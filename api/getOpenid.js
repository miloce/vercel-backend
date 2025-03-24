const axios = require('axios');

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
    // 获取 code 参数
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        error: 'Missing code parameter'
      });
    }

    // 检查环境变量
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('Missing WECHAT_APP_ID or WECHAT_APP_SECRET');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    // 请求微信接口
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: appId,
        secret: appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = response.data;

    // 检查微信返回的错误
    if (errcode) {
      console.error('WeChat API error:', errmsg);
      return res.status(400).json({
        error: errmsg
      });
    }

    // 返回成功结果
    res.status(200).json({
      openid,
      session_key
    });

  } catch (error) {
    // 详细的错误日志
    console.error('Error in getOpenid:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // 返回错误响应
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}; 
