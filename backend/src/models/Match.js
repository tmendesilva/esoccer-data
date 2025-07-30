import { mongoose } from 'mongoose';
const { Schema } = mongoose;

const MatchSchema = new Schema({
  id: Number,
  date: Date,
  status_id: Number,
  tournament: Object,
  console: Object,
  participant1: Object,
  participant2: Object,
});

const Match = mongoose.model('Match', MatchSchema);

export default Match;
