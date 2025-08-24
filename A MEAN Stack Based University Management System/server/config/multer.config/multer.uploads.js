const multer = require("multer");
const path = require("path");
const fs = require("fs");
const appError = require('../../utils/appError.js');


// Supported file types and limits
 const fileTypeMap = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  audio: {
    types: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  video: {
    types: ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  document: {
    types: [
      'application/pdf', // .pdf
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain' // .txt
    ],
    maxSize: 50 * 1024 * 1024 // 50MB
  }
};

// Flatten all MIME types
const allMimeTypes = [
  ...fileTypeMap.image.types,
  ...fileTypeMap.audio.types,
  ...fileTypeMap.video.types,
  ...fileTypeMap.document.types
];



// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const mime = file.mimetype;
    const fieldName = file.fieldname;
    const userId = req.user?.userId?.toString() || "anonymous";

    let subFolder = "others";

    if (fieldName === "profileImg" &&fileTypeMap.image.types.includes(mime)) {
      subFolder = `images/user_${userId}`;
    } else if (fieldName === "audio" &&fileTypeMap.audio.types.includes(mime)) {
      subFolder = `audio/user_${userId}`;
    } else if (fieldName === "video" &&fileTypeMap.video.types.includes(mime)) {
      subFolder = `videos/user_${userId}`;
    } else if (fieldName === "document" &&fileTypeMap.document.types.includes(mime)) {
      subFolder = `documents/user_${userId}`;
    }else {
      return cb(appError.create('❌ Unsupported file type', 400));
    }

   // Absolute path inside 'public/uploads/...'
    const folderPath = path.join(__dirname, '..', 'public', 'uploads', subFolder);

    // Create the folder recursively if it doesn't exist
    try {
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (err) {
      return cb(err);
    }

    cb(null, folderPath); 
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});


// File filter
const fileFilter = function (req, file, cb) {
  const mime = file.mimetype;

  if (allMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(appError.create("❌ File type not allowed", 400), false);
  }
};

// Set limits dynamically (default 2MB fallback)
const limits = {
  fileSize: function (req, file, cb) {
    const mime = file.mimetype;

    if (fileTypeMap.image.types.includes(mime)) return cb(null, fileTypeMap.image.maxSize);
    if (fileTypeMap.audio.types.includes(mime)) return cb(null, fileTypeMap.audio.maxSize);
    if (fileTypeMap.video.types.includes(mime)) return cb(null, fileTypeMap.video.maxSize);
    if (fileTypeMap.document.types.includes(mime)) return cb(null, fileTypeMap.document.maxSize);

    return cb(null, 2 * 1024 * 1024); // fallback to 2MB
  }
};


// Init multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Global max for any single file
  }
});

module.exports = upload
  


