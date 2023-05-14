// Import necessary packages and libraries
const express = require("express");
const http = require("http");
const https = require("https");
const dotenv = require("dotenv");

// Initialize the app and create a server
const app = express();
const server = http.createServer(app);

// Load environment variables
dotenv.config();

// Serve static files from the public directory
app.use(express.static("public"));

// Listen on the specified port
server.listen(process.env.PORT, (err) => {
  if (err) {
    throw err;
  } else {
    console.log(`Server is running on port ${process.env.PORT}`);
  }
});

// Initialize socket.io and listen for connections
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  console.log("A user has connected!");

  // Set the Thingspeak URL to retrieve data from
  const url = "https://api.thingspeak.com/channels/2120838/feeds.json?results=2";

  // Make an HTTPS request to retrieve the data
  https.get(url, (response) => {
    response.on("data", (data) => {
      // Parse the response data into a JavaScript object
      const dataOut = JSON.parse(data);

      // Extract the desired values from the object
      const output = {
        tds: dataOut.feeds[0].field1,
        temperature: dataOut.feeds[0].field2,
        ec: dataOut.feeds[0].field3,
      };
      console.log(output);

      // Send the extracted data to the client via socket.io
      socket.emit("data", output);
    });
  });
});

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html", (err) => {
    console.log(err);
  });
});
