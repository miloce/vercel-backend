const axios = require('axios');
const crypto = require('crypto');

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  const { encryptedData, iv, code } = req.body;

  if (!encryptedData || !iv || !code) {
    return res.status(400).send({ error: 'encryptedData, iv 和 code 都是必须的' });
  }

  try {
    // 首先通过code获取session_key
    const response = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    );

    const { openid, session_key } = response.data;

    if (!openid || !session_key) {
      throw new Error('获取session_key失败');
    }

    // 解密获取微信运动数据
    const decryptedData = decryptWeRunData(encryptedData, iv, session_key);

    res.status(200).json({ 
      success: true, 
      data: decryptedData,
      openid // 同时返回用户openid
    });
  } catch (error) {
    console.error('解密微信运动数据失败:', error);
    res.status(500).send({ error: '解密微信运动数据失败' });
  }
};

/**
 * 解密微信运动数据
 * @param {string} encryptedData - 加密的数据
 * @param {string} iv - 加密算法的初始向量
 * @param {string} sessionKey - 会话密钥
 * @returns {Object} 解密后的数据对象
 */
function decryptWeRunData(encryptedData, iv, sessionKey) {
  // 创建解密器
  const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
  const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');

  try {
    // 解密
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    
    const result = JSON.parse(decoded);
    
    // 返回解密结果
    return result;
  } catch (err) {
    throw new Error('解密失败: ' + err.message);
  }
} 