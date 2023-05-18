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
const { exec } = require("child_process");
const { writeFile, readFile } = require("fs");

const databasePath = "./database.json";
var dispH = 15;
var dispW = 15;
var ip = "192.168.0.8";
var waitTime = 4;

app.use(bodyParser.json());
app.use(cors());
app.use(filUpload());
app.use(express.json({ limit: "50mb" }));

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

// Define a route for sending the list of videos
app.get("/videosList", (req, res) => {
    const folderPath = "../Sources/"; // replace with the actual path to the folder
    const videoExtensions = [".mp4", ".mov", ".avi"]; // define the list of video extensions

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Unable to read folder contents" });
        }

        const videos = files.filter((file) =>
            videoExtensions.includes(path.extname(file))
        );

        return res.json({ videos });
    });
});

// Defining route for sending the list of images
app.get("/imageList", (req, res) => {
    const folderPath = "../Sources/"; // replace with the actual path to the folder
    const imageExtensions = [".png", ".jpg", ".jpeg"]; // define the list of video extensions

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res
                .status(500)
                .json({ message: "Unable to read folder contents" });
        }

        const images = files.filter((file) =>
            imageExtensions.includes(path.extname(file))
        );

        return res.json({ images });
    });
});

//defining routes for receving image to display
app.post("/playImage", (req, res) => {
    const img = req.body.imageName;
    console.log(img);
    console.log("Processning");
    // console.log(`python3 playImage.py ${ip} ${dispH} ${dispW} ${img} ${waitTime}`)
    exec(
        `cd .. ; cd Codes/; python3 playImage.py ${ip} ${dispH} ${dispW} ${img} ${waitTime}`,
        (err, stdout) => {
            console.log("Processing done");
            console.log(stdout);
        }
    );
    res.status(201).send("Image played successfully");
});

//defining routes for receving image to display
app.post("/playVideo", (req, res) => {
    const vid = req.body.videoName;
    console.log(vid);
    console.log("Processning");
    // console.log(`python3 playVideo.py ${ip} ${dispH} ${dispW} ${vid} ${waitTime}`)
    exec(
        `cd .. ; cd Codes/; python3 playVideo.py ${ip} ${dispH} ${dispW} ${vid} ${waitTime}`,
        (err, stdout) => {
            console.log("Processing done");
            console.log(stdout);
        }
    );
    res.status(201).send("Video played successfully");
});

//defining routes for image upload
app.post("/uploadImage", (req, res) => {
    const imageFile = req.files.image;
    const fileName = imageFile.name;

    console.log(`fecthing Image ${fileName}`);

    imageFile.mv(`../Sources/${fileName}`, (error) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error uploading Image");
        } else {
            console.log("Image received Successfully");
            res.send("Image uploaded successfully!");
        }
    });
});

//defining rotes for video upload
app.post("/uploadVideo", (req, res) => {
    const videoFile = req.files.video;
    const fileName = videoFile.name;

    console.log(`fecthing video ${fileName}`);

    videoFile.mv(`../Sources/${fileName}`, (error) => {
        if (error) {
            console.error(error);
            res.status(500).send("Error uploading video");
        } else {
            console.log("File received Successfully");
            res.send("Video uploaded successfully!");
        }
    });
});
//defining route to config conroller ip
app.post("/configControllerIP", (req, res) => {
    ip = req.body.ipController;
    console.log(`New IP of Controller : ${ip}`);
    data = {
        ipConroller: `${ip}`,
        displayHeight: `${dispH}`,
        displayWidth: `${dispW}`,
    };

    writeFile(databasePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
            console.log("An error has occurred ", error);
            return;
        }
        console.log("Data written successfully to the file");
    });
    res.send("Controller IP Set successfully");
});

//defining route to config conroller ip
app.post("/configDispH", (req, res) => {
    dispH = req.body.height;
    console.log(`New Height of Display : ${dispH}`);

    data = {
        ipConroller: `${ip}`,
        displayHeight: `${dispH}`,
        displayWidth: `${dispW}`,
    };

    writeFile(databasePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
            console.log("An error has occurred ", error);
            return;
        }
        console.log("Data written successfully to the file");
    });
    res.send("Display Height Set successfully");
});

//defining route to config conroller ip
app.post("/configDispW", (req, res) => {
    dispW = req.body.width;
    console.log(`New width of Display : ${dispW}`);
    data = {
        ipConroller: `${ip}`,
        displayHeight: `${dispH}`,
        displayWidth: `${dispW}`,
    };
    writeFile(databasePath, JSON.stringify(data, null, 2), (error) => {
        if (error) {
            console.log("An error has occurred ", error);
            return;
        }
        console.log("Data written successfully to the file");
    });
    res.send("Display Width Set successfully");
});

//defining route for info request
app.get("/info", (req, res) => {
    console.log(`ip:${ip}, dispH:${dispH}, dispW:${dispW}`);
    res.json({ ip, dispH, dispW });
});

//listening to port 5000s
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    // data = {"ipConroller":`${ip}`,"displayHeight":`${dispH}`,"displayWidth":`${dispW}`}
    fs.readFile(databasePath, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        jsonString = JSON.parse(data);
        dispH = jsonString.displayHeight;
        dispW = jsonString.displayWidth;
        ip = jsonString.ipConroller;

        console.log({
            ipConroller: `${ip}`,
            displayHeight: `${dispH}`,
            displayWidth: `${dispW}`,
        });
    });
});

app.post("/setController", (req, res) => {
    const { dispHeight, dispWidth, ipAddress } = req.body;
    dispH = dispHeight;
    dispW = dispWidth;
    ip = ipAddress;

    // Check if the IP address is valid
    if (!ipRegex.test(ipAddress)) {
        return res.status(400).json({ message: "Invalid IP address" });
    }

    res.status(201).send("New configration completed");
});
