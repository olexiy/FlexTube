const express = require("express");
const http = require("http");
const mongodb = require("mongodb");

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

async function main() {
  const client = await mongodb.MongoClient.connect(DB_HOST);
  const db = client.db(DB_NAME);
  const videosCollection = db.collection("videos");

  if (!process.env.PORT) {
    throw new Error("PORT environment variable is not set");
  }

  const app = express();

  app.get("/video", async (req, res) => {
    const videoId = new mongodb.ObjectId(req.query.id);
    console.log(`Mongo findOne for video ID: ${videoId}.`);
    const videoRecord = await videosCollection.findOne({ _id: videoId });
    if (!videoRecord) {
      res.status(404).send("Video not found");
      return;
    }

    console.log(
      `Request forwarded to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}`
    );

    const forwardRequest = http.request(
      {
        host: VIDEO_STORAGE_HOST,
        port: VIDEO_STORAGE_PORT,
        path: `/files/${videoRecord.videoPath}`,
        method: "GET",
        headers: req.headers,
      },
      (forwardResponse) => {
        res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
        forwardResponse.pipe(res);
      }
    );

    req.pipe(forwardRequest);
  });

  app.listen(PORT, () => {
    console.log(`Video Streaming Server is running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Microservice failed to start", err);

  process.exit(1);
});
