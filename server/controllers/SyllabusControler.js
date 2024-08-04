// controllers/SyllabusController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload/syllabus'); // Directory to store the files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage: storage });

module.exports = function (Syllabus) {
  Syllabus.upload = function (req, res, next) {
    upload.single('syllabus')(req, res, function (err) {
      if (err) {
        return next(err);
      }

      const syllabus = new Syllabus({
        title: req.body.title,
        description: req.body.description,
        filePath: req.file.path // Save the file path
      });

      syllabus.save(function (err, syllabus) {
        if (err) {
          return next(err);
        }
        res.json(syllabus);
      });
    });
  };

  Syllabus.remoteMethod('upload', {
    http: { path: '/upload', verb: 'post' },
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'res', type: 'object', http: { source: 'res' } }
    ],
    returns: { arg: 'syllabus', type: 'Syllabus', root: true }
  });
};


Syllabus.download = function (id, res, cb) {
  Syllabus.findById(id, function (err, syllabus) {
    if (err) {
      return cb(err);
    }
    if (!syllabus) {
      return cb(new Error('Syllabus not found'));
    }

    const filePath = syllabus.filePath;
    fs.readFile(filePath, function (err, data) {
      if (err) {
        return cb(err);
      }
      res.set('Content-Type', 'application/pdf');
      res.send(data);
    });
  });
};

Syllabus.remoteMethod('download', {
  http: { path: '/download/:id', verb: 'get' },
  accepts: [
    { arg: 'id', type: 'string', required: true, http: { source: 'path' } },
    { arg: 'res', type: 'object', 'http': { source: 'res' } }
  ],
  returns: { arg: 'file', type: 'file', root: true }
});


