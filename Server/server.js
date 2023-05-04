const express = require("express");
const bodyParser = require("body-parser");
const filUpload = require("express-fileupload");
const cors = require("cors");
const http = require("http");
const app = express();
const port = process.env.PORT || 5000;
const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const fs = require("fs");
const path = require("path");

var dispH = null;
var dispW = null;
var ip = null;

app.use(bodyParser.json());
app.use(cors());
app.use(filUpload());

app.post("/calculate", (req, res) => {
    const { dispHeight, dispWidth, ipAddress } = req.body;

    dispH = dispHeight;
    dispW = dispWidth;
    ip = ipAddress;
    // Check if the IP address is valid
    if (!ipRegex.test(ipAddress)) {
        return res.status(400).json({ message: "Invalid IP address" });
    }

    // Send a GET request to the IP address
    http.get(`http://${ipAddress}`, (response) => {
        let data = "";

        // Append the response data to the 'data' variable
        response.on("data", (chunk) => {
            data += chunk;
        });

        // Check the response status code
        response.on("end", () => {
            if (response.statusCode === 200) {
                // Do something with the received data
                const result = dispHeight + dispWidth;
                console.log(dispHeight, dispWidth);

                // Send a response back to the client
                res.json({ result });
            } else {
                // Return a response indicating that the IP address is not available
                res.status(404).json({ message: "IP address not available" });
            }
        });
    }).on("error", (error) => {
        // Return a response indicating that the IP address is not available
        res.status(404).json({ message: "IP address not available" });
    });
});

app.get("/fileslist", (req, res) => {
    const folderPath = "../Sources/";

    // Read the contents of the folder
    fs.readdir(folderPath, (error, files) => {
        if (error) {
            return res
                .status(500)
                .json({ message: "Unable to read folder contents" });
        }

        // Filter the files to only include images and videos
        const imageRegex = /\.(jpg|jpeg|png|gif)$/i;
        const videoRegex = /\.(mp4|avi|mov)$/i;
        const filteredFiles = files.filter(
            (file) => imageRegex.test(file) || videoRegex.test(file)
        );

        // Map the files to their full path
        const filePaths = filteredFiles.map((file) =>
            path.join(folderPath, file)
        );

        // Map the files to their file names only
        const fileNames = filteredFiles.map((file) => path.basename(file));

        // Send the list of files in the response
        res.json({ files: fileNames });
    });
});

app.post("/processimage", (req, res) => {
    const image = req.files.classimage;
    console.log(image);
    fs.writeFileSync(`../Sources/${image.name}`, image.data, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    res.status(201).send("Image updated successfully");
});

app.get("/info", (req, res) => {
    console.log(dispH, dispW, ip);
    res.json({ dispH, dispW, ip });
});

//listening to port 5000s
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
