var AWS = require('aws-sdk'),
  mime = require('mime'),
  uuid = require('node-uuid'),
  async = require('fastsync'),
  config = include('config/index.js')().aws_credentials,
	_ = require("lodash");

AWS.config.update(config);
var s3 = new AWS.S3();

/**
 * Gets a data stream from the cloud based on Stored Filename
 * @param bucketName
 * @param storedName
 * @param done
 */
exports.getStreamFromCloud = function getStreamFromCloud(bucketName, storedName, done) {
  var params = {
    Bucket: getBucketName(bucketName),
    Key: storedName
  };
  s3.getObject(params, done);
};

/**
 * Gets a data stream from the cloud based on URL of the file
 * @param bucketName
 * @param url
 * @param done
 */
exports.getStreamFromCloudByUrl = function getStreamFromCloudByUrl(bucketName, url, done) {
  this.getStreamFromCloud(bucketName, getFileNameFromUrl(url), done);
};

/**
 * Uploads a file to the cloud
 * @param bucketName
 * @param file
 * @param fileName
 * @param done
 * @returns {*}
 */
exports.uploadFileToCloud = function uploadFileToCloud(bucketName, file, fileName, done) {
  var extension = getExtension(fileName);
  if (!extension) {
    if (done) return done('could not find file extension for filename ' + fileName, null);
  } else {
    extension = '.' + extension;
  }

  var storedName = uuid.v4() + extension;
  var params = {
    Body: file,
    Bucket: getBucketName(bucketName),
    ACL: 'public-read',
    Key: storedName,
    ContentType: mime.lookup(fileName)
  };
  s3.putObject(params, function(err, result) {
    if (err) {
      if (err.code === 'NoSuchBucket') {
        s3.createBucket({
          Bucket: getBucketName(bucketName)
        }, function(err) {
          if (err) {
            console.warn(getBucketName(bucketName) + ", this bucket name is invalid");
            if (done) return done(err, null);
            return;
          }
          return uploadFileToCloud(bucketName, file, fileName, done);
        });
      } else {
        if (done) return done(err, null);
      }
    } else {
      var url = 'https://' + getBucketName(bucketName) + '.s3.amazonaws.com/' + storedName;
      if (done) return done(null, {
        url: url,
        storedName: storedName,
        fileName: fileName,
        res: result
      });
    }
  });
};

/**
 * Uploads multiple files to the cloud and returns the link information
 * @param bucketName
 * @param files
 * @param done
 */
exports.uploadAttachments = function uploadAttachments(bucketName, files, done) {
  if (files.length <= 0) return done('No files found');
  var _self = this;


  var bucket = bucketName || "venabis";

  var attachments = [];

  var fileUploads = _.map(files, function(f) {
    return function(cb) {
      _self.uploadFileToCloud(bucket, f.data, f.filename, function(error, result) {
        if (error) return cb(error);
        attachments.push({
          FileLocation: result.url,
          FileType: f.mimetype
        });
        cb();
      });
    }
  });
  async.parallel(fileUploads, function(e) {
    if (e) return done(e);
    return done(null, attachments);
  })
};

/**
 * Deletes a file from the cloud based on Stored Filename
 * @param bucketName
 * @param storedName
 * @param [done]
 */
exports.deleteFile = function deleteFile(bucketName, storedName, done) {
  var params = {
    Bucket: getBucketName(bucketName),
    Key: storedName
  };
  s3.deleteObject(params, function(err, data) {
    if (done) done(err, data);
  });
};

/**
 * Deletes a file from the cloud based on URL of the file
 * @param bucketName
 * @param url
 * @param [done]
 */
exports.deleteFileByUrl = function deleteFileByUrl(bucketName, url, done) {
  this.deleteFile(bucketName, getFileNameFromUrl(url), done);
};

/**
 * Gets the cloud URL based on Stored Filename
 * @param bucketName
 * @param storedName
 * @returns {string}
 */
exports.getCloudUrl = function getCloudUrl(bucketName, storedName) {
  return 'https://' + getBucketName(bucketName) + '.s3.amazonaws.com/' + storedName;
};

function getBucketName(bucketName) {
  if (process.env.CONFIG_ENV !== 'production') {
    return 'scolasticus-devuploads';
  } else {
    return 'scolasticus-' + bucketName;
  }
}

function getExtension(fileName) {
  var re = /(?:\.([^.]+))?$/;
  return re.exec(fileName)[1];
}

function getFileNameFromUrl(url) {
  return url.substring(url.lastIndexOf('/') + 1, url.length);
}
