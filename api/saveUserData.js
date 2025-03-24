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

  if (req.method === 'POST') {
    const { userId, userData } = req.body;
    try {
      await User.findOneAndUpdate({ userId }, { userData }, { upsert: true });
      res.status(200).send('Data saved successfully');
    } catch (error) {
      res.status(500).send('Error saving data');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};