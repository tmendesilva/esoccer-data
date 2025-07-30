import { mongoose } from 'mongoose';
const { Schema } = mongoose;

const TournamentSchema = new Schema({
  id: String,
  token: String,
  token_international: String,
  marker: String,
  status_id: Number,
  start_date: Date,
  league: Object,
  location: Object,
});

const Tournament = mongoose.model('Tournament', TournamentSchema);

export default Tournament;
