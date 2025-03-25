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
    type: { type: String },
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
      console.log('Saving record:', { userId, date, weight, meals, exercise });
      const result = await HealthRecord.findOneAndUpdate(
        { userId, date }, 
        { 
          $set: {
            weight: Number(weight) || 0,
            meals: Array.isArray(meals) ? meals : [],
            exercise: {
              duration: Number(exercise?.duration) || 0,
              calories: Number(exercise?.calories) || 0,
              type: exercise?.type || '常规运动'
            }
          }
        },
        { upsert: true, new: true }
      );
      res.status(200).json({ message: 'Health record saved successfully', data: result });
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ error: 'Error saving health record', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}; 