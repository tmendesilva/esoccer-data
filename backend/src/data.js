import { addMinutes, format } from 'date-fns';
import Match from './models/Match.js';
import Tournament from './models/Tournament.js';

const flattenObject = (obj, prefix = '', result = {}) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};

async function fetchData(params) {
  try {
    console.warn(params);

    let filters = {
      $and: [
        {
          date: {
            $gte: new Date(params.dateFrom),
          },
          $or: [
            {
              date: {
                $lte: addMinutes(params.dateTo, 16), // add 20 minutes
              },
            },
            {
              status_id: [2, 3],
            },
          ],
        },
      ],
    };

    if (params.location) {
      filters.$and.push({
        location: params.location && parseInt(params.location),
      });
    }

    const matches = await Match.aggregate([
      {
        $lookup: {
          from: 'tournaments', // The foreign collection to join with
          localField: 'tournament.id', // Field from the input documents (Post)
          foreignField: 'id', // Field from the documents of the "from" collection (User)
          as: 'tournaments', // The name of the new array field to add to the input documents
        },
      },
      {
        $addFields: {
          location: { $first: '$tournaments.location.id' },
        },
      },
      {
        $match: filters,
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    console.log(matches[0]);
    return matches.map((match) => {
      return {
        id: match.id,
        date: format(match.date, 'yyyy-MM-dd | HH:mm', {
          timeZone: 'America/Sao_Paulo',
        }),
        status_id: match.status_id,
        location: match.tournaments[0].location.id,
        location_name: match.tournaments[0].location.token,
        participant1_nickname: match.participant1.nickname,
        participant2_nickname: match.participant2.nickname,
        participant1_score: match.participant1.score,
        participant2_score: match.participant2.score,
        scoreTotal: match.participant1.score + match.participant2.score,
      };
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchFilters = async (params) => {
  try {
    const locations = await Tournament.distinct('location', {
      start_date: {
        $gte: new Date(params.dateFrom),
        $lte: addMinutes(params.dateTo, 16), // add 16 minutes
      },
    });
    return {
      locations,
    };
  } catch (error) {
    console.error('Error:', error);
  }
};

export { fetchData, fetchFilters };
