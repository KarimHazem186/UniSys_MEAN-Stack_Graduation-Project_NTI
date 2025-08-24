const fs = require('fs');
const { fileTypeMap } = require('../config/multer.config/multer.uploads');

function validateFileSize(req, res, next) {
  const file = req.file;
  if (!file) {
    return next(); // no file uploaded
  }

  const mime = file.mimetype;

  const typeConfig = Object.values(fileTypeMap).find(({ types }) => types.includes(mime));
  const maxSize = typeConfig ? typeConfig.maxSize : 50 * 1024 * 1024; // fallback 50MB

  if (file.size > maxSize) {
    // Delete the file to avoid storage clutter
    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to delete oversized file:', err);
      return res.status(400).json({ message: 'File size exceeds limit' });
    });
  } else {
    next();
  }
}
module.exports = validateFileSize;