'use strict';
let async = require('async');
const formidable = require('formidable');
const { forEach } = require('async');
let fs = require('fs');
let path = require('path');

module.exports = function (Paper) {
    Paper.upload = function (paperFile, type, grade, paper_subject_id, option, cb) {
        let filePath = fs.realpathSync(path.join('./upload/paper'));
        const form = new formidable.IncomingForm();
        form.uploadDir = filePath;
        form.maxFileSize = 5000 * 1024 * 1024;

        form.on('progress', (bytesReceived, bytesExpected) => {
            console.log(Math.round((bytesReceived / bytesExpected) * 100) + ' % ');
        });

        form.on('aborted', () => {
            let error = new Error('Aborted');
            error.statusCode = 400;
            error.code = 'ABORTED';
            return cb(error);
        });

        let filesArray = [];
        form.on('file', function (field, file) {
            console.log("field: ", field);
            filesArray.push(file);
        });

        form.parse(option, (err, fields, files) => {

            forEach(filesArray, (file, file_cb) => {
                fs.rename(file.filepath, `${form.uploadDir}/${file.originalFilename}`, (err) => {
                    const saveObject = saveObjectMaker(fields, originalFilename);
                    console.log("saveObject: ", saveObject);
                    console.error(err)
                    if (err) return cb(err);
                    file_cb()
                });
            }, key_err => {
                console.log('======================================');
                Paper.create(saveObject, (saveErr, saveResult) => {
                    if (saveErr) return cb(saveErr);
                    return cb(null, saveResult);
                })
            });

        });
    };

    function saveObjectMaker(data, fileName) {
        const saveObject = { fileName, type: '', grade: '', paper_subject_id: -1 }
        for (var key in data) {
            console.log(key, data[key][0]);
            saveObject[key] = data[key][0];
        }
        console.log("saveObject: ", saveObject);
        return saveObject
    }

    Paper.remoteMethod('upload', {
        accepts: [
            {
                arg: 'paperFile', type: 'file', source: { http: 'multipart/form-data' }
            },
            {
                arg: 'type', type: 'string',
            },
            {
                arg: 'grade', type: 'string',
            },
            {
                arg: 'paper_subject_id', type: 'number',
            },
            {
                arg: 'options', type: 'object', http: (ctx) => { return ctx.req; }
            }
        ],
        http: {
            path: '/upload',
            verb: 'post',
            'consumes': [
                'multipart/form-data'
            ],
            'produces': [
                'multipart/form-data'
            ]
        },
        returns: {
            root: true,
            type: 'string'
        }
    });

    Paper.download = function (fileName, res, cb) {
        let filePath = path.resolve('./upload/paper'); // Resolves the file path correctly
        res.setHeader('Content-Type', 'application/pdf');

        try {
            // Read the file in binary mode without specifying 'utf8'
            let file = fs.readFileSync(path.join(filePath, fileName));

            // Send the binary data directly
            return res.send(file);
        } catch (e) {
            let error = new Error('File Not Found');
            error.code = 'FILE_NOT_FOUND';
            error.statusCode = 400;
            return cb(error);
        }
    };

    Paper.remoteMethod('download', {
        accepts: [
            {
                arg: 'filename', type: 'string', source: { http: 'path' }
            },
            { arg: 'res', type: 'object', 'http': { source: 'res' } }
        ],
        http: {
            path: '/download/:filename',
            verb: 'get'
        },
        returns: {
            root: true
        }
    });
}