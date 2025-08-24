const cors = require('cors');

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:4200', // from .env
  'https://yourdomain.com', // production domain
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS Blocked: ${origin}`);  
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, headers, etc.)
};

module.exports = cors(corsOptions);
