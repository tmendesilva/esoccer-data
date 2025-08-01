import { addDays, subDays } from 'date-fns';
import Match from './models/Match.js';
import Tournament from './models/Tournament.js';

const matchDateYesterday = subDays(new Date(), 1);
const matchDateTomorrow = addDays(new Date(), 1);

async function updateMatches() {
  try {
    const tournaments = await Tournament.find({
      start_date: {
        $gte: matchDateYesterday,
        $lte: matchDateTomorrow,
      },
      // status_id: {
      //   $lte: 3, // 2: not started, 3: in progress, 4: finished
      // },
    });

    console.info('Tournament length:', tournaments.length);

    let bulkOperations = [];
    const promises = tournaments.map(async (tourn) => {
      const url = `https://football.esportsbattle.com/api/tournaments/${tourn.id}/matches`;
      await fetch(url)
        .then((res) => res.json())
        .then((matches) => {
          bulkOperations = makeBulkOperations(bulkOperations, matches);
        })
        .catch((err) => {
          console.error('Error:', err);
        });
    });

    await Promise.all(promises);
    const result = await upsertMatches(bulkOperations);
    console.log('Bulk upsert result:', result);
    return {
      success: true,
      message: 'Matches updated successfully',
      result,
    };
  } catch (err) {
    console.error('Error:', err);
  }
}

function makeBulkOperations(bulk, matches) {
  matches.map((match) => {
    bulk.push({
      updateOne: {
        filter: { id: match.id },
        update: { $set: match },
        upsert: true,
      },
    });
  });
  return bulk;
}

async function upsertMatches(bulkOperations) {
  try {
    return await Match.bulkWrite(bulkOperations);
  } catch (error) {
    console.error('Error during bulk upsert:', error);
  }
}

export { updateMatches };
