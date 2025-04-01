const axios = require('axios');
const fs = require('fs');

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;

// 获取微信接口调用凭证
async function getAccessToken() {
  try {
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}`
    );
    
    const { access_token, expires_in } = response.data;
    
    if (!access_token) {
      throw new Error('Failed to get access_token');
    }
    
    return access_token;
  } catch (error) {
    console.error('Error getting access_token:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { scene, page = 'pages/run/statement' } = req.body;

  if (!scene) {
    return res.status(400).send('Scene parameter is required');
  }

  try {
    // 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 调用微信接口获取小程序码
    const response = await axios.post(
      `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
      {
        scene: scene,           // 最大32个可见字符，用于参数传递
        page: page,             // 必须是已经发布的小程序存在的页面
        check_path: false,      // 不检查页面是否存在
        env_version: 'release', // 正式版
        width: 280,             // 码的宽度
        auto_color: false,      // 自动配置线条颜色
        line_color: {"r":0,"g":0,"b":0}, // 使用黑色
        is_hyaline: false       // 不需要透明底色
      },
      {
        responseType: 'arraybuffer' // 指定响应类型为二进制数组
      }
    );
    
    // 检查是否返回了图片数据
    if (response.headers['content-type'].includes('image')) {
      // 设置正确的响应头
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
      
      // 返回图片数据
      return res.status(200).send(response.data);
    } else {
      // 可能返回了错误信息，尝试解析
      const errorData = JSON.parse(response.data.toString());
      console.error('微信接口返回错误:', errorData);
      return res.status(500).json(errorData);
    }
  } catch (error) {
    console.error('Error generating wxa code:', error);
    return res.status(500).send('Error generating QR code');
  }
}; 