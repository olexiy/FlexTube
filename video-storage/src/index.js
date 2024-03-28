const express = require("express");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const PORT = process.env.PORT || 3000;
const ACCOUNT_KEY_ID = process.env.ACCOUNT_KEY_ID;
const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET;
const REGION = process.env.REGION || "eu-central-1";

if (!process.env.ACCOUNT_KEY_ID || !process.env.ACCOUNT_SECRET) {
  throw new Error("AWS credentials environment variable not set");
}

// Configure AWS SDK with your credentials
const s3Client = new S3Client({
  region: REGION, // e.g., us-west-2
  credentials: {
    accessKeyId: ACCOUNT_KEY_ID,
    secretAccessKey: ACCOUNT_SECRET,
  },
});

const app = express();

// Define a route to serve files from S3
app.get("/files/:key", async (req, res) => {
  const { key } = req.params;

  // console.log(`Àccess key: ${ACCOUNT_KEY_ID}`);
  // console.log(`Secret key: ${ACCOUNT_SECRET}`);
  // console.log(`Region: ${REGION}`);
  // console.log(`Key: ${key}`);

  // Specify the S3 bucket and key of the file
  const command = new GetObjectCommand({
    Bucket: "video-straming-microservice-storage-1232ghdfgjhjtzhgbcbvcdbg6",
    Key: key,
  });

  try {
    const { ContentType, Body } = await s3Client.send(command);

    // Set the appropriate content type and send the file data
    res.set("Content-Type", ContentType);
    Body.pipe(res); // Stream the data instead of sending it all at once
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving file from S3");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Video Storage Server is running on port ${PORT}`);
});
