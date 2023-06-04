const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const app = express();

// You will need to create a .env file that contains your API key
require('dotenv').config();

const apiKey = process.env.ABLY_API_KEY;
const [keyid, keySecret] = apiKey.split(':');

const expiresIn = 3600;
const capability = JSON.stringify({ '*': ['publish', 'subscribe'] });
const jwtOptions = { expiresIn, keyid };

// Define your API routes and logic here
app.get('/api/data', (req, res) => {
  res.json({ message: 'API endpoint reached!' });
});

// Handle requests to our auth endpoint
app.get('/api/auth', (req, res) => {
  console.log('Sucessfully connected to the server auth endpoint');

  // Normally we would validate the user before issuing the JWT token
  // but for simplicity we'll just use their input as the `clientId`

  const randomId = Math.random().toString(16).slice(-8);
  const clientId = req.query.clientId || randomId;

  const jwtPayload = {
    'x-ably-capability': capability,
    'x-ably-clientId': clientId,
  };

  jwt.sign(jwtPayload, keySecret, jwtOptions, (err, tokenId) => {
    console.log('✓ JSON Web Token signed by auth server');
    console.log(': ClientId: [%s]\n\n', clientId);

    if (err) {
      res.status(500).send(`Error requesting token: ${JSON.stringify(err)}`);
      return;
    }

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    console.log(': Sending signed JWT token back to client:\n%s', tokenId);
    res.send(JSON.stringify(tokenId));
  });
});

app.get('/api/word', async (req, res) => {
  try {
    const url = new URL('https://wordsapiv1.p.rapidapi.com/words');
    url.searchParams.set('random', 'true');
    url.searchParams.set('letters', '5');
    url.searchParams.set('hasDetails', 'definitions');
    const response = await axios.get(url, {
      httpsAgent,
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
      }
    });

    console.log(response.data)

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    res.json(response.data);
  } catch (error) {
    console.error('Error retrieving random word:', error);
    res.status(500).json({ message: 'Failed to retrieve random word', error });
  }
});

app.get('/api/words', (req, res) => {
  fs.readFile(path.join(__dirname, 'filteredWords.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to retrieve random word', err });
      return;
    }

    try {
      const words = JSON.parse(data);
      console.log(`${words.length} words`)

      res.json({ words });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(500).json({ message: 'Failed to retrieve random word', err });
    }
  });
});

app.listen(3000, () => {
  console.log('✓ Web server listening on port', 3000);
  console.log(': Ably API key parts:', keyid, keySecret, '\n\n');
});
