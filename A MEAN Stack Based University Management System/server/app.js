const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

const path = require('path')
const cookieParser = require('cookie-parser')
const helmet = require('helmet');
const limiter = require('./utils/rateLimit');
const logger = require('./utils/loggers');
const morganMiddleware = require('./middlewares/logMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const corsMiddleware = require('./middlewares/corsConfig');

require('dotenv').config()


const app = express()

const userRoutes = require('./routes/user.routes.js')






// Middleware
app.use(helmet());

app.use(limiter);

// const allowedOrigins = [process.env.CLIENT_URL, 'https://yourdomain.com'];
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// ,credentials: true }));

app.use(corsMiddleware);
 
app.use(xss());
app.use(mongoSanitize());
app.use(compression());


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());



// app.use(morgan('combined')); // ✅    
app.use(morgan('dev')); // ✅  
app.use(morganMiddleware); // ✅ logs


// logger.info('Starting app...');
// logger.warn('Low disk space');
// logger.error('Something went wrong');

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});


process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);  
});


// Sample route
app.get('/', (req, res) => {
  // logger.info('GET / route hit');
  res.send('Welcome to the university Website');
});

app.get('/fail', (req, res) => {
  throw new Error('💥 Crash route hit!');
});

app.get('/error', (req, res, next) => {
  const error = new Error("Something went wrong!");
  next(error); 
});


// Static serving of uploads
app.use('/uploads', express.static(path.join(__dirname,'public' ,'uploads')));


app.use('/api/auth',userRoutes)


// Global Error Handler
app.use(errorHandler);

module.exports = app



