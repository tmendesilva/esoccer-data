import Match from './models/Match.js';
import Tournament from './models/Tournament.js';

async function updateMatches(params) {
  try {
    const tournaments = await Tournament.find({
      start_date: {
        $gte: new Date(params.dateFrom),
        $lte: new Date(params.dateTo),
      },
      // status_id: {
      //   $lte: 3, // 2: not started, 3: in progress, 4: finished
      // },
    });

    console.info('Tournament length:', tournaments.length);

    let bulkOperations = [];
    const promises = tournaments.map(async (tourn) => {
      const url = `${process.env.ESOCCER_API_URL}/tournaments/${tourn.id}/matches`;
      console.info('Match url:', url);
      await fetch(url)
        .then((res) => res.json())
        .then((matches) => {
          console.info('Match length:', matches.length);
          bulkOperations = makeBulkOperations(
            bulkOperations,
            matches.map((match) => {
              return {
                ...match,
                location: {
                  id: tourn.location.id,
                  name: tourn.location.token,
                },
              };
            }),
          );
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
