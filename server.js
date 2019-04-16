const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const upload = require('./upload');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/samples', express.static(path.join(__dirname, 'samples')))

app.use("/upload", upload);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log(`ENVIRONMENT ${process.env.ENVIRONMENT}`)
    console.log(`DEFAULT_TARGET ${process.env.DEFAULT_TARGET}`)
    console.log('Press Ctrl+C to quit.');

});