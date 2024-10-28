import { Scraper } from "agent-twitter-client";
import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create the scraper instance
const scraper = new Scraper();

// Initialize scraper with authentication
async function initializeScraper(): Promise<void> {
  try {
    const username = process.env.TWITTER_USERNAME;
    const password = process.env.TWITTER_PASSWORD;

    if (!username || !password) {
      throw new Error("Twitter credentials not found in environment variables");
    }

    // Login to Twitter
    await scraper.login(username, password);

    const cookies = await scraper.getCookies();
    console.log("Successfully authenticated with Twitter");
  } catch (error) {
    console.error("Failed to initialize Twitter scraper:", error);
    process.exit(1);
  }
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/send-tweet", async (req: Request, res: Response) => {
  try {
    const tweetText = req.query.tweetText as string;
    const replyToTweetId = req.query.replyToTweetId as string | undefined;

    if (!tweetText) {
      return res.status(400).json({
        success: false,
        message: "Tweet text is required",
      });
    }

    const isLoggedIn = await scraper.isLoggedIn();
    if (!isLoggedIn) {
      await initializeScraper();
    }

    const resData = await scraper.sendTweet(tweetText, replyToTweetId);

    res.json({
      success: true,
      message: "Tweet sent successfully",
      resData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error sending tweet",
      error: (err as Error).message,
    });
  }
});

app.get("/get-tweets", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const isLoggedIn = await scraper.isLoggedIn();
    if (!isLoggedIn) {
      await initializeScraper();
    }

    const tweets = scraper.getTweetsByUserId(userId, limit);
    const tweetsArray: any[] = [];

    for await (const tweet of tweets) {
      console.log(tweet);
      tweetsArray.push(tweet);
    }

    res.json({
      success: true,
      tweets: tweetsArray,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving tweets",
      error: (err as Error).message,
    });
  }
});

initializeScraper().then(() => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
});
