import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB, disconnectDB } from '../config/db.js';
import { fetchData, fetchFilters } from './data.js';
import { updateMatches } from './matches.js';
import { updateTournaments } from './tournaments.js';

dotenv.config();

const app = express();
app.use(function setCommonHeaders(req, res, next) {
  res.set('Access-Control-Allow-Private-Network', 'true');
  next();
});

const corsOptions = {
  origin: [process.env.REACT_URL, 'http://192.168.1.120:3000'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Private-Network'],
  exposedHeaders: ['Access-Control-Allow-Private-Network'],
  methods: ['GET', 'POST', 'PUT'],
};

app.use(cors(corsOptions)); // Apply custom CORS options globally

const errorHandling = (err) => {
  console.error('Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Internal Server Error');
};

async function startServer() {
  try {
    await connectDB();

    app.get('/matches', async (req, res) => {
      try {
        const params = req.query;
        const data = await fetchData(params);
        res.header('Access-Control-Allow-Private-Network', 'true');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        errorHandling(err);
      }
    });

    app.get('/matches/filters', async (req, res) => {
      try {
        const params = req.query;
        const data = await fetchFilters(params);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        errorHandling(err);
      }
    });

    app.put('/update-tournaments', async (req, res) => {
      try {
        const tournaments = await updateTournaments();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tournaments));
      } catch (err) {
        errorHandling(err);
      }
    });

    app.put('/update-matches', async (req, res) => {
      try {
        const matches = await updateMatches();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(matches));
      } catch (err) {
        errorHandling(err);
      }
    });

    const PORT = process.env.NODE_PORT;
    app.listen(PORT, (err) => {
      if (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
      console.log(`Server listening on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Server shutting down...');
      await disconnectDB();
      app.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
