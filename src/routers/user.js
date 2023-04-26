const express = require("express");
const File = require("../models/File");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const shortid = require("shortid");
require("dotenv").config();

const router = new express.Router();

const bucketName = process.env.AWS_BUCKET;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const region = process.env.AWS_REGION;

AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region,
});

const s3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { originalname: file.originalname });
    },
    key: function (req, file, cb) {
      const shortLink = shortid.generate();
      cb(null, shortLink);
    },
  }),
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try{
    if(req.file.key){
      const url = req.file.key;
    const shortLink = url;
    const NumberOfcount = 0;
    const Org_link=`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${shortLink}`
    // Create new file document
    const file = new File({
      shortLink: url,
      originalLink:Org_link,
      openLinkCount:NumberOfcount,
    });
    // Save file document to database
    await file.save();
    res.json({ shortLink });
    }else{
      res.status(500).send("Unable to upload");
    }
  }catch(error){
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Define file download route using short link
router.get("/:shortLink", async (req, res) => {
  try {
    const file = await File.findOne({ shortLink: req.params.shortLink });
    if (!file) {
      return res.status(404).send("File not found");
    }
    res.redirect(file.originalLink);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
