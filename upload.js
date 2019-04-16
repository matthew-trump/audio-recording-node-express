const express = require('express');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});

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


    const path = "samples/" + filename;
    console.log("WRITING TO FILENAME", path);

    fs.writeFile(path, req.file.buffer, { encoding: 'base64' },
        (err, result) => {
            if (err) {
                console.log("ERROR", err);
                res.status('500').json({ error: err });
            } else {
                res.status('200').json({ path: path })
            }
        }
    )
});

module.exports = router;