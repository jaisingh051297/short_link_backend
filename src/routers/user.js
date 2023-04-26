const express=require('express');
const File=require('../models/File');
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const shortid = require("shortid");
require('dotenv').config();

const router=new express.Router();

const bucketName = process.env.AWS_BUCKET;
const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY;
const accessKeyId= process.env.AWS_ACCESS_KEY;
const region= process.env.AWS_REGION;

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
    const url=req.file.key
    const shortLink = url;
    const originalName = req.file.originalname;
    // Create new file document
    const file = new File({
      shortLink: url,
      originalName: originalName,
    });
    // Save file document to database
    await file.save()
    res.json({ shortLink });
  });
  
  router.get("/:shortLink", async (req, res) => {
    const params = {
      Bucket: bucketName,
      Key: req.params.shortLink,
    };
    const fileStream = s3.getObject(params).createReadStream();
    fileStream.pipe(res);
    // Increment download count for file document
    await File.findOneAndUpdate(
      { shortLink: req.params.shortLink },
      { $inc: { downloadCount: 1 } }
    );
  });

//   router.get('/:shortLink1',async (req,res)=>{
//     const shortLink=req.params.shortLink1
//     console.log(shortLink);
//     try{
//         const file=await File.findOne({shortLink,})
//         if(!file){
//             return res.status(404).send()
//         }else{
//             const URL={url:`https://${bucketName}.s3.${region}.amazonaws.com/${file.shortLink}`,}
//             res.send(URL.url)
//         }
        
//     }catch(error){
//         res.status(500).send(error)
//     }
// })


  module.exports=router