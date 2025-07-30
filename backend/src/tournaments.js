const dateFns = require('date-fns');
const Tournament = require('./models/Tournament');

const matchDate = new Date(new Date().setHours(0, 0, 0, 0));
const matchDatePlusOne = dateFns.add(matchDate, { days: 1 });

async function updateTournaments() {
  const url = `https://football.esportsbattle.com/api/tournaments?page=1&dateFrom=${dateFns.format(matchDate, 'yyyy-MM-dd HH:mm')}&dateTo=${dateFns.format(matchDatePlusOne, 'yyyy-MM-dd HH:mm')}&location=2`;
  console.info('Tournament url:', url);
  return await fetch(url)
    .then((res) => res.json())
    .then(async (json) => {
      console.info('Tournament length:', json.tournaments.length);
      const result = await upsertTournaments(json.tournaments);
      console.log('Bulk upsert result:', result);
      return {
        success: true,
        message: 'Tournaments updated successfully',
        result: result,
      };
    })
    .catch((err) => console.error('Error:', err));
}

async function upsertTournaments(tournaments) {
  const bulkOperations = tournaments.map((tournament) => ({
    updateOne: {
      filter: { id: tournament.id },
      update: { $set: tournament },
      upsert: true,
    },
  }));
  try {
    return await Tournament.bulkWrite(bulkOperations);
  } catch (error) {
    console.error('Error during bulk upsert:', error);
  }
}

module.exports = { updateTournaments };
