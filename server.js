const express = require('express');
const fs = require('fs');
const path = require('path');
const server = express();
const { createHash } = require('crypto');
const hash = createHash('sha256');

console.log('Override URL: ' + process.env.OVERRIDE_URL);

if (!process.env.PORT || !process.env.API_KEY) {
    console.log('Missing Environment Variable(PORT/API_KEY)');
    process.exit(0);
}

let out_folder = 'files/';
fs.mkdir(out_folder, { recursive: true }, (err) => { if (err) throw err });


server.use(express.json());
server.use(express.static(out_folder));

server.get('/', (req, res) => { res.send('File Host API'); });

server.post('/api/upload/', (req, res) => {
    let request_ip = req.socket.remoteAddress;
    if (req.body.API_KEY && req.body.base64 && req.body.ext) {
        if (req.body.API_KEY == process.env.API_KEY) {
            console.log('VALID ' + request_ip + ' ' + req.body.ext + ' ' + req.header('Content-Length'));
            let filename = hash.copy().update(req.body.base64).digest('hex') + '.' + req.body.ext;
            fs.writeFile(out_folder + filename, req.body.base64, 'base64', (err) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(JSON.stringify({ error: 'Could not save file.' }));
                } else {
                    let url = req.protocol + "://" + "localhost:" + process.env.PORT + "/" + filename;
                    if (process.env.OVERRIDE_URL)
                        url = req.protocol + "://" + process.env.OVERRIDE_URL + (process.env.OVERRIDE_URL.endsWith('/') ? "" : "/") + filename
                    res.status(200).send(JSON.stringify({
                        filename: filename,
                        url: url
                    }));
                }
            });
        } else {
            console.log('INVALID API KEY ' + request_ip);
            res.sendStatus(403);
        }
    } else {
        console.log('INVALID PARAMS ' + request_ip);
        res.status(400).send('Missing Parameters');
    }
});

if (process.env.DELETE_HOURS) {
    console.log('Will delete files older than ' + process.env.DELETE_HOURS + ' hours.');
    setInterval(() => {
        fs.readdir(out_folder, (err, files) => {
            if (err) { console.error('Could not read output folder.'); }

            files.forEach((file, index) => {
                let file_path = path.join(out_folder, file);
                fs.stat(file_path, (err, stats) => {
                    if (err) {
                        console.error(err);
                    } else {
                        let now = Date.now();
                        let mdate = stats.mtime;
                        let age = (now - mdate) / 1000 / 60 / 60;
                        if (age > process.env.DELETE_HOURS) {
                            fs.unlink(file_path, (err) => {
                                if (err) { console.error(err); }
                                else { console.log('Deleting ' + file) }
                            });
                        }
                    }
                });
            });
        });
    }, 60 * 60 * 1000);
}
server.listen(process.env.PORT, () => { console.log('Server running on port ' + process.env.PORT) });