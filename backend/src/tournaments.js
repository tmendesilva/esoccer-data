import { addDays, formatISO, subDays } from 'date-fns';
import Tournament from './models/Tournament.js';

async function updateTournaments() {
  const url = buildURLQuery(`${$process.env.ESOCCER_API_URL}/tournaments`, {
    page: 1,
    dateFrom: formatISO(subDays(new Date(), 1)),
    dateTo: formatISO(addDays(new Date(), 1)),
    location: [1, 2],
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

async function getTournamentLocations() {
  await Tournament.distinct('location');
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
    .map((p) => {
      if (Array.isArray(p[1])) {
        return p[1].map((v) => `${p[0]}=${v}`).join('&');
      }
      return `${p[0]}=${p[1]}`;
    })
    .join('&');

export { getTournamentLocations, updateTournaments };
