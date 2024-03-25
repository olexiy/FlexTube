const express = require("express");
const http = require("http");

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = process.env.VIDEO_STORAGE_PORT;

if (!process.env.PORT) {
  throw new Error("PORT environment variable is not set");
}

const app = express();

app.get("/video", async (req, res) => {
  console.log(`Request received to {VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}`);
  const forwardRequest = http.request(
    {
      host: VIDEO_STORAGE_HOST,
      port: VIDEO_STORAGE_PORT,
      path: "/files/SampleVideo_1280x720_1mb.mp4",
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
