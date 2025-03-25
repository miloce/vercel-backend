const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/?retryWrites=true&w=majority&appName=miloce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const healthRecordSchema = new mongoose.Schema({
  userId: String,
  date: String,
  weight: Number,
  meals: [{
    type: String,
    calories: Number,
    description: String
  }],
  exercise: {
    duration: Number,
    calories: Number,
    type: String
  }
});

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    const { userId, date } = req.query;
    try {
      const record = await HealthRecord.findOne({ userId, date });
      res.status(200).json(record || {});
    } catch (error) {
      res.status(500).send('Error fetching health record');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}; 