// const httpStatusText = require('../utils/httpStatusText')
// const appError = require('../utils/appError');
// const ExpressValidator = require('../utils/ExpressValidator');
// // const myValidator = new ExpressValidator();


// const validateRequest = (req,_res,next)=>{
//   const result = ExpressValidator.validationResult(req)
//   if (typeof result.array != "function") {
//       return next(appError.create("express-validator mis-configured", 500));
//     }
  
//     const errorsArr = result.array({ onlyFirstError: true });
  
//     if (errorsArr.length) {
//       const formattedError = errorsArr.map((err) => ({
//         field: err.param,
//         message: err.msg,
//       }));
  
//       return next(
//         appError.create(
//           "Validation Failed",
//           400,
//           httpStatusText.FAIL || "fail",
//           formattedError
//         )
//       );
//     }
//     next();
// }

// module.exports = validateRequest;


// module.exports = (req, _res, next) => {
  // const result = myValidator.validationResult(req);
//    if (typeof result.array !== 'function') {
//       return next(appError.create('express‑validator mis‑configured', 500));
//     }

//     const errorsArr = result.array({ onlyFirstError: true });


//   if (errorsArr.length) {
//       // return res.status(statusCode||400).json({
//       //   success: false,
//         // errors: errors.map(err => ({
//         //   field: err.param,
//         //   message: err.msg,
//         // }))
//       // });
      
//       // ORRRRRRRRRRRRRRRR
  
//       // Bulid readable array first
//       const formattedError = errorsArr.map(err => ({
//           field: err.param,
//           message: err.msg,
//       }));
  
//       // Pass to global handler with 400 (Bad Request)
//       return next(
//         // appError.create("Validation Failed",400,httpStatusText.FAIL ||'fail',{errors:formattedError})
//         appError.create("Validation Failed",400,httpStatusText.FAIL ||'fail',formattedError)
//       )
  
//     }
  
//     // No validation issues - carry on
//     next(); // proceed to controller
// };



////// ORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
// const ExpressValidator = require('../utils/ExpressValidator');
// const myValidator = new ExpressValidator();

// module.exports = (req, _res, next) => {
//   const errors = myValidator.validationResult(req);
//   if (!errors.isEmpty()) {
//     const err = new Error('Validation failed');
//     err.statusCode = 400;
//     err.errors = errors.array();
//     throw err;
//   }
//   next();
// };
