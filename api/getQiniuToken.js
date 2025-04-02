const qiniu = require('qiniu');

// 配置七牛云
const accessKey = '2Zz1c44YONpMxmBnt2wigoYbBhjQyRAJ_9vRgkkf';
const secretKey = 'giHMmS8kQiqixDTKewsflKlvW9VbmDHWX5p13tVE';
const bucket = 'miloce';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 生成上传凭证
const options = {
  scope: bucket,
  expires: 7200
};

const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

module.exports = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      uptoken: uploadToken
    });
  } catch (error) {
    console.error('获取七牛云token失败:', error);
    res.status(500).json({
      success: false,
      error: '获取上传凭证失败'
    });
  }
}; 