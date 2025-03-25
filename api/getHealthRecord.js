const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect('mongodb+srv://miloce:miloce@miloce.nod1a.mongodb.net/?retryWrites=true&w=majority&appName=miloce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const healthRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
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
}, { timestamps: true });

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId, date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const record = await HealthRecord.findOne({ userId, date });
    
    res.status(200).json({ success: true, data: record || null });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ error: 'Error fetching health record', details: error.message });
  }
}; 