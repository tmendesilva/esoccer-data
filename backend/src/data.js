import { addMinutes, format } from 'date-fns';
import lodash from 'lodash';
import Match from './models/Match.js';
const { uniq } = lodash;

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
            $lte: new Date(params.dateTo),
          },
        },
      ],
    };

    if (params.location) {
      filters.$and.push({
        'location.id': parseInt(params.location),
      });
    }

    if (params['status[]']) {
      if (!Array.isArray(params['status[]'])) {
        params['status[]'] = [params['status[]']];
      }
      filters.$and.push({
        status_id: {
          $in: params['status[]'].map((s) => parseInt(s)),
        },
      });
    }

    if (params.player1) {
      filters.$and.push({
        $or: [
          {
            'participant1.nickname': params.player1,
          },
          {
            'participant2.nickname': params.player1,
          },
        ],
      });
    }

    if (params.player2) {
      filters.$and.push({
        $or: [
          {
            'participant1.nickname': params.player2,
          },
          {
            'participant2.nickname': params.player2,
          },
        ],
      });
    }

    const matches = await Match.aggregate([
      {
        $match: filters,
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);
    return matches.map((match) => {
      return {
        id: match.id,
        date: format(match.date, 'yyyy-MM-dd | HH:mm', {
          timeZone: 'America/Sao_Paulo',
        }),
        status_id: match.status_id,
        location_id: match.location?.id || '',
        location: match.location?.name || '',
        player1: match.participant1.nickname,
        player1_score: match.participant1.score,
        player2: match.participant2.nickname,
        player2_score: match.participant2.score,
        scoreTotal:
          !isNaN(parseInt(match.participant1.score)) && !isNaN(parseInt(match.participant2.score))
            ? match.participant1.score + match.participant2.score
            : null,
      };
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchLocationsFilter = async (params) => {
  try {
    const locations = await Match.distinct('location', {
      date: {
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

const fecthPlayersFilter = async (params) => {
  try {
    let filters = {
      date: {
        $gte: new Date(params.dateFrom),
        $lte: addMinutes(params.dateTo, 16), // add 16 minutes
      },
    };
    if (params.location) {
      filters['location.id'] = params.location;
    }
    const player1 = await Match.distinct('participant1.nickname', filters);
    const player2 = await Match.distinct('participant2.nickname', filters);
    return {
      players: uniq([...player1, ...player2]),
    };
  } catch (error) {
    console.error('Error:', error);
  }
};

export { fecthPlayersFilter, fetchData, fetchLocationsFilter };
