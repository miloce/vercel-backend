const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/miloce?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const userSchema = new mongoose.Schema({
  userId: String,
  userData: Object,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const { userId } = req.query;
    try {
      const user = await User.findOne({ userId });
      res.status(200).json(user ? user.userData : {});
    } catch (error) {
      res.status(500).send('Error fetching data');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};