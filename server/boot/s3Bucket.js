const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

module.exports = function (server) {

  AWS.config.update({
    accessKeyId: 'AKIA2NBOC64FFC4N7CUS',
    secretAccessKey: 'OCQD0orP00DEl+LB4Wlb0bYetvuLgpy4GELD0LFw'
  });

  let s3 = new AWS.S3({
    params: {
      Bucket: 'sample-randika',
      ACL: 'private'
    },
    region: 'ap-southeast-1'
  });

  /**
   *
   * @param folderPath {{String}}
   * @param file {{String}}
   * @param fileName {{String}}
   */
  function upload(folderPath, file, fileName, cb) {
    // console.log(file);
    let params = {
      Body: file,
      Key: `mobile_tv/video${folderPath}${fileName}`
    };

    s3.putObject(params).on('httpUploadProgress', (event) => {
      let progress = (Math.round((event.loaded / event.total) * 100));
      console.log(progress);
      cb();
    }).send(err => {
      if (err) {
        console.log(err);
      }
    });

  }

  /**
   *
   * @param fileName {{String}}
   * @param encodedImage {{String}}
   * @param cb {{funtion}}
   * encodedImage should be like " data:image/png;base64,iVBORw0KGgoAAAAN "
   */
  function uploadBase64(fileName, encodedImage, cb) {
    let context = encodedImage.split(',');
    let ContentType = context[0].substr(5, 9);
    console.log();
    var buf = Buffer.from(context[1],'base64');
    let params = {
      Body: buf,
      Key: fileName,
      ContentEncoding: 'base64',
      ContentType: ContentType
    };

    s3.putObject(params).on('httpUploadProgress', (event) => {
      let progress = (Math.round((event.loaded / event.total) * 100));
      console.log(progress);
      cb(true);
    }).send(err => {
      if (err) {
        console.log(err);
        cb(false)
      }
    });
    // cb(true)
  }

  server.S3 = { upload, uploadBase64 };
};
