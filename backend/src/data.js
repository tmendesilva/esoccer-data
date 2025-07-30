import { format } from 'date-fns';
import Match from './models/Match.js';

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
    const matches = await Match.find(
      {
        date: {
          $gte: params.dateFrom,
          $lte: params.dateTo,
        },
        status_id: [2, 3],
      },
      {
        _id: 0,
        id: 1,
        date: 1,
        status_id: 1,
        participant1: {
          nickname: 1,
          score: 1,
        },
        participant2: {
          nickname: 1,
          score: 1,
        },
      },
      {
        sort: {
          date: 1,
        },
      },
    ).lean();
    return matches.map((match) => {
      match.date = format(match.date, 'yyyy-MM-dd | HH:mm', {
        timeZone: 'America/Sao_Paulo',
      });
      match.scoreTotal = match.participant1.score + match.participant2.score;
      return flattenObject(match);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

export { fetchData };
