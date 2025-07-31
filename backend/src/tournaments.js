import { addDays, subDays } from 'date-fns';
import Tournament from './models/Tournament.js';

async function updateTournaments() {
  const url = buildURLQuery('https://football.esportsbattle.com/api/tournaments', {
    page: 1,
    dateFrom: subDays(new Date(), 1),
    dateTo: addDays(new Date(), 1),
    location: 2,
  });
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

const buildURLQuery = (url, params) =>
  url +
  '?' +
  Object.entries(params)
    .map((p) => p.map(encodeURIComponent).join('='))
    .join('&');

export { updateTournaments };
