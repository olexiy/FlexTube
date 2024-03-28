const express = require("express");
const http = require("http");
const mongodb = require("mongodb");
const amqp = require("amqplib");

if (!process.env.PORT) {
  throw new Error(
    "Please specify the port number for the HTTP server with the environment variable PORT."
  );
}

if (!process.env.RABBIT) {
  throw new Error(
    "Please specify the name of the RabbitMQ host using environment variable RABBIT"
  );
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error(
    "Please specify the video storage host using environment variable VIDEO_STORAGE_HOST"
  );
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error(
    "Please specify the video storage port using environment variable VIDEO_STORAGE_PORT"
  );
}

if (!process.env.DB_HOST) {
  throw new Error(
    "Please specify the database host using environment variable DB_HOST"
  );
}

if (!process.env.DB_NAME) {
  throw new Error(
    "Please specify the name of the database using environment variable DB_NAME"
  );
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const RABBIT = process.env.RABBIT;

async function main() {
  console.log(`Connecting to MongoDB at ${DB_HOST}`);
  const client = await mongodb.MongoClient.connect(DB_HOST);
  const db = client.db(DB_NAME);
  const videosCollection = db.collection("videos");
  console.log("Connected to MongoDB.");

  console.log(`Connecting to RabbitMQ server at ${RABBIT}.`);
  const messagingConnection = await amqp.connect(RABBIT); // Connects to the RabbitMQ server.
  console.log("Connected to RabbitMQ.");

  const messageChannel = await messagingConnection.createChannel();

  if (!process.env.PORT) {
    throw new Error("PORT environment variable is not set");
  }

  function sendViewedMessage(messageChannel, videoPath) {
    console.log(`Publishing message on "viewed" queue.`);

    const msg = { videoPath: videoPath };
    const jsonMsg = JSON.stringify(msg);
    messageChannel.publish("", "viewed", Buffer.from(jsonMsg)); // Publishes message to the "viewed" queue.
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

    sendViewedMessage(messageChannel, videoRecord.videoPath);

    req.pipe(forwardRequest);
  });

  app.listen(PORT, () => {
    console.log(`Video Streaming Server is running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
