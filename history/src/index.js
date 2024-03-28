const express = require("express");
const mongodb = require("mongodb");
const amqp = require("amqplib");

if (!process.env.PORT) {
  throw new Error(
    "Please specify the port number for the HTTP server with the environment variable PORT."
  );
}

if (!process.env.DB_HOST) {
  throw new Error(
    "Please specify the database host using environment variable DB_HOST."
  );
}

if (!process.env.DB_NAME) {
  throw new Error(
    "Please specify the name of the database using environment variable DB_NAME"
  );
}

if (!process.env.RABBIT) {
  throw new Error(
    "Please specify the name of the RabbitMQ host using environment variable RABBIT"
  );
}

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const RABBIT = process.env.RABBIT;

async function main() {
  const app = express();

  //
  // Enables JSON body parsing for HTTP requests.
  //
  app.use(express.json());


  const dbClient = new mongodb.MongoClient(DB_HOST);
  const db = dbClient.db(DB_NAME);
  const historyCollection = db.collection("history");
  const messagingConnection = await amqp.connect(RABBIT);
  console.log("Connected to RabbitMQ.");

  const messagingChannel = await messagingConnection.createChannel(); 
  await messagingChannel.assertQueue("viewed", {});
  console.log("Created 'viewed' queue.");

  //
  // Start receiving messages from the "viewed" queue.
  //
  await messagingChannel.consume("viewed", async (message) => {
    const payload = JSON.parse(message.content.toString());
    console.log("Received a 'viewed' message:", payload);

    await historyCollection.insertOne({ videoPath: payload.videoPath });
    
    messagingChannel.ack(message);
    console.log("Acknowledging message was handled.");
  });

    //
    // HTTP GET route to retrieve video viewing history.
    //
    app.get("/history", async (req, res) => {
      const skip = parseInt(req.query.skip) || 0;
      const limit = parseInt(req.query.limit) || 10;

      const history = await historyCollection.find()
        .skip(skip)
        .limit(limit)
        .toArray();

      res.json(history);
    }
  );

  app.listen(PORT, () => {
    console.log(`History Microservice is online.`);
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
