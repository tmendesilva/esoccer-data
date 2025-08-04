import { mongoose } from 'mongoose';
const { Schema } = mongoose;

const Participant = {
  id: Number,
  nickname: String,
  team: {
    id: Number,
    token_international: String,
  },
  score: Number,
  prevPeriodsScores: [Number],
};

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
  participant1: Participant,
  participant2: Participant,
});

const Match = mongoose.model('Match', MatchSchema);

export default Match;
