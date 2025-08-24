const mongoose = require('mongoose')
const logger = require('../../utils/loggers')

const connectDB = ()=> {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(()=> logger.info("✅ MongoDB connected") )
        .catch((err)=> logger.error(" DB connection error:",err))
}

module.exports = connectDB

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (err) {
//     console.error(err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
