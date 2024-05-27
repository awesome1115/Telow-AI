const express = require('express');
const app = express();
require('dotenv').config();
const puppeteer = require('puppeteer');
const cors = require('cors');

// Define a whitelist of allowed origins
const whitelist = [process.env.ALLOWED_ORIGIN, 'https://app.telow.com'];

// Configure CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Deny the request
    }
  },
};

app.use(cors(corsOptions)); // Enable CORS for whitelist hosts

app.get('/screenshot', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot();
    const dataUrl = `data:image/png;base64,${screenshot.toString('base64')}`;
    await browser.close();
    res.json({ image: dataUrl });
  } catch (error) {
    console.error('ISSUE', error);
    res.status(500).json({ error: error });
  }
});

app.listen(5001, () => {
  console.log(`Server is running on port 5001`);
});
