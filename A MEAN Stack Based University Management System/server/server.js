const app=require('./app');
const logger = require('./utils/loggers');


const connectDB = require('./config/connection/db')


const PORT = process.env.PORT || 6000

connectDB()

// app.listen(PORT,()=>console.log(`Server running on port ${PORT} `))


app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
});
