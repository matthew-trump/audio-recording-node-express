const express = require('express');
const multer = require('multer');
const format = require('util').format;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});

const router = express.Router();


const { Storage } = require('@google-cloud/storage');
const GOOGLE_STORAGE_BUCKET_NAME = process.env.GOOGLE_STORAGE_BUCKET_NAME;

const storage = new Storage();
const bucket = storage.bucket(GOOGLE_STORAGE_BUCKET_NAME);


/** write uploaded buffer to google storage */
//see https://cloud.google.com/storage/docs/access-control/making-data-public#buckets

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
    console.log("using storage bucket", GOOGLE_STORAGE_BUCKET_NAME);

    const gcspath = "samples/" + req.file.originalname;
    const bfile = bucket.file(gcspath);

    const stream = bfile.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        },
        resumable: false
    });
    stream.on('error', (err) => {
        console.log(err);
        res.status(500).json({ error: "Unable to save file to bucket: " + req.file.originalname });
        return;
    });
    stream.on('finish', () => {
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${bfile.name}`);
        res.status(200).json({ path: publicUrl });
    });
    stream.end(req.file.buffer);
});


module.exports = router;


