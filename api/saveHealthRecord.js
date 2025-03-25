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
    type: String,  // 'breakfast', 'lunch', 'dinner', 'extra'
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

  if (req.method === 'POST') {
    const { userId, date, weight, meals, exercise } = req.body;
    try {
      await HealthRecord.findOneAndUpdate(
        { userId, date }, 
        { weight, meals, exercise },
        { upsert: true }
      );
      res.status(200).send('Health record saved successfully');
    } catch (error) {
      res.status(500).send('Error saving health record');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}; 