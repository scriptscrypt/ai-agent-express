"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agent_twitter_client_1 = require("agent-twitter-client");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// Create the scraper instance
const scraper = new agent_twitter_client_1.Scraper();
// Initialize scraper with authentication
function initializeScraper() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const username = process.env.TWITTER_USERNAME;
            const password = process.env.TWITTER_PASSWORD;
            if (!username || !password) {
                throw new Error("Twitter credentials not found in environment variables");
            }
            // Login to Twitter
            yield scraper.login(username, password);
            const cookies = yield scraper.getCookies();
            console.log("Successfully authenticated with Twitter");
        }
        catch (error) {
            console.error("Failed to initialize Twitter scraper:", error);
            process.exit(1);
        }
    });
}
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/send-tweet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tweetText = req.query.tweetText;
        const replyToTweetId = req.query.replyToTweetId;
        if (!tweetText) {
            return res.status(400).json({
                success: false,
                message: "Tweet text is required",
            });
        }
        const isLoggedIn = yield scraper.isLoggedIn();
        if (!isLoggedIn) {
            yield initializeScraper();
        }
        const resData = yield scraper.sendTweet(tweetText, replyToTweetId);
        res.json({
            success: true,
            message: "Tweet sent successfully",
            resData,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Error sending tweet",
            error: err.message,
        });
    }
}));
app.get("/get-tweets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    try {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 10;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const isLoggedIn = yield scraper.isLoggedIn();
        if (!isLoggedIn) {
            yield initializeScraper();
        }
        const tweets = scraper.getTweetsByUserId(userId, limit);
        const tweetsArray = [];
        try {
            for (var _d = true, tweets_1 = __asyncValues(tweets), tweets_1_1; tweets_1_1 = yield tweets_1.next(), _a = tweets_1_1.done, !_a; _d = true) {
                _c = tweets_1_1.value;
                _d = false;
                const tweet = _c;
                console.log(tweet);
                tweetsArray.push(tweet);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = tweets_1.return)) yield _b.call(tweets_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        res.json({
            success: true,
            tweets: tweetsArray,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Error retrieving tweets",
            error: err.message,
        });
    }
}));
initializeScraper().then(() => {
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
});
