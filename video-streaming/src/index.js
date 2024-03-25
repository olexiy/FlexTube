const express = require("express");
const http = require("http");
 
const app = express();

if (!process.env.PORT) {
  throw new Error("PORT environment variable is not set");
}

const PORT = process.env.PORT;
 
app.get("/video", async (req, res) => {
  const videoPath =  "./videos/SampleVideo_1280x720_1mb.mp4";
  const stats = await fs.promises.stat(videoPath);
 
  res.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": "video/mp4",
  });  
  fs.createReadStream(videoPath).pipe(res);
});
 
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});