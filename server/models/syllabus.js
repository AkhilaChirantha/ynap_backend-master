'use strict';
let async = require('async');

module.exports = function (Syllabus) {
    Syllabus.download = function (fileName, res, cb) {
        let filePath = fs.realpathSync(path.join('./upload/subtitle'));
    
        try {
          let file = fs.readFileSync(filePath + `/${fileName}`, 'utf8');
          return res.send(file);
        } catch (e) {
          let error = new Error('File Not Found');
          error.code = 'FILE_NOT_FOUND';
          error.statusCode = 400;
    
          return cb(error);
        }
      };
    
      Syllabus.remoteMethod('download', {
        accepts: [
          {
            arg: 'filename', type: 'string', source: {http: 'path'}
          },
          {arg: 'res', type: 'object', 'http': {source: 'res'}}
        ],
        http: {
          path: '/download/:filename',
          verb: 'get'
        },
        returns: {
          root: true
        }
      });
    };
    
