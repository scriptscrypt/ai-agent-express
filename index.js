const { Scraper } = require("agent-twitter-client");
const express = require("express");
const app = express();
const port = 3000;

const dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config();

// Create the scraper instance
const scraper = new Scraper();

// Initialize scraper with authentication
async function initializeScraper() {
  try {
    // First check if we have environment variables
    const username = process.env.TWITTER_USERNAME;
    const password = process.env.TWITTER_PASSWORD;

    if (!username || !password) {
      throw new Error("Twitter credentials not found in environment variables");
    }

    // Login to Twitter
    await scraper.login(username, password);

    // Optional: Get and log cookies for future use
    const cookies = await scraper.getCookies();
    console.log("Successfully authenticated with Twitter");
  } catch (error) {
    console.error("Failed to initialize Twitter scraper:", error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/send-tweet", async (req, res) => {
  try {
    const tweetText = req.query.tweetText;

    if (!tweetText) {
      return res.status(400).json({
        success: false,
        message: "Tweet text is required",
      });
    }

    // Check if we're logged in before sending tweet
    const isLoggedIn = await scraper.isLoggedIn();
    if (!isLoggedIn) {
      // Try to re-authenticate if we're not logged in
      await initializeScraper();
    }

    const resData = await scraper.sendTweet(tweetText);

    res.json({
      success: true,
      message: "Tweet sent successfully",
      resData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error sending tweet",
      error: err.message,
    });
  }
});

// Initialize the scraper before starting the server
initializeScraper().then(() => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
});
