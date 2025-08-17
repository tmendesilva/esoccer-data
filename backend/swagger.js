import dotenv from 'dotenv';
import swaggerAutogen from 'swagger-autogen';
dotenv.config();

const doc = {
  info: {
    version: '1.0.0',
    title: 'Esoccer Data API',
    description: 'API documentation for my Node.js project',
  },
  host: process.env.NODE_URL, // Replace with your actual host and port
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./src/server.js']; // Point to your route files

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./src/server.js'); // Your main application file
});
