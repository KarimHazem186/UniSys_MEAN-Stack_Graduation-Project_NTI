const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.config");
const appError = require("../../utils/appError");

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
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ],
    maxSize: 50 * 1024 * 1024
  }
};

const allMimeTypes = [
  ...fileTypeMap.image.types,
  ...fileTypeMap.audio.types,
  ...fileTypeMap.video.types,
  ...fileTypeMap.document.types
];

// Helper function to create resize transformation for Cloudinary
function getResizeTransformation(width, height) {
  if (!width && !height) return [];
  return [{
    width: width || null,
    height: height || null,
    crop: "limit"  // Use "limit" to keep aspect ratio, max width/height
  }];
}

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "uploads";

    let transformation = [];

    const mime = file.mimetype;
    if (file.fieldname === "profileImg" && fileTypeMap.image.types.includes(mime)) {
      folder = `images/user_${req.user?.userId || "anonymous"}`;
      transformation = getResizeTransformation(400, 400);
    } else if (file.fieldname === "audio" && fileTypeMap.audio.types.includes(mime)) {
      folder = `audio/user_${req.user?.userId || "anonymous"}`;
    } else if (file.fieldname === "video" && fileTypeMap.video.types.includes(mime)) {
      folder = `videos/user_${req.user?.userId || "anonymous"}`;
    } else if (file.fieldname === "document" && fileTypeMap.document.types.includes(mime)) {
      folder = `documents/user_${req.user?.userId || "anonymous"}`;
    }

    return {
      folder,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      transformation
    };
  }
});

// File filter
const fileFilter = function (req, file, cb) {
  if (allMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(appError.create("❌ File type not allowed", 400), false);
  }
};

// Initialize Multer
const uploadC = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Max 50MB per file
  }
});

module.exports = { uploadC, fileTypeMap };
