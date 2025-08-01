import { mongoose } from 'mongoose';
const { Schema } = mongoose;

const MatchSchema = new Schema({
  id: Number,
  date: Date,
  status_id: Number,
  tournament: Object,
  console: Object,
  location: {
    id: Number,
    name: String,
  },
  participant1: {
    nickname: String,
    score: Number,
  },
  participant2: {
    nickname: String,
    score: Number,
  },
});

const Match = mongoose.model('Match', MatchSchema);

export default Match;
