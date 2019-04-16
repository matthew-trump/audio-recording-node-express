const express = require('express');
const multer = require('multer');
const format = require('util').format;

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});
//https://www.zeolearn.com/magazine/uploading-files-to-aws-s3-using-nodejs

const AWS = require('aws-sdk');
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/** write uploaded buffer to local file */
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("** ERROR: audio upload NO FILE");
        res.status(400).send('No file uploaded.');
        return;
    }
    const filename = req.file.originalname;
    const sampleRateHertz = parseInt(req.query.sampleRateHertz);
    const encoding = req.query.encoding;
    console.log("RECEIVED FILE", filename, sampleRateHertz, encoding);


    const uploadpath = "samples/" + filename;
    console.log("WRITING TO FILENAME", uploadpath);

    const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        ContentType: req.file.mimetype,
        Key: uploadpath,
        Body: req.file.buffer
    };
    s3.upload(params, function (s3Err, data) {
        if (s3Err) {
            console.log(s3Err);
            res.status(500).json({ error: s3Err });
        } else {
            console.log(`File uploaded successfully at ${data.Location}`);
            res.status(200).json({ path: data.Location });
        }

    });
});



module.exports = router;