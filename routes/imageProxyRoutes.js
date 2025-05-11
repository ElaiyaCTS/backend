
//routes/imageProxyRoutes.js
import express from "express";
import axios from "axios";
const router = express.Router();

router.get("/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  try {
    // Fetch the image as a stream
    const response = await axios.get(driveUrl, {
      responseType: "stream",
    });

    // Set the content type for the image
    const contentType = response.headers["content-type"];
    res.set("Content-Type", contentType);
    
    // Set CORS headers to allow frontend to access the image
    res.set("Access-Control-Allow-Origin", "*");  // Allows any origin to access the image

    // Pipe the image stream directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Error in image proxy:", error.message);
    res.status(500).send("Image proxy error");
  }
});

export default router;
