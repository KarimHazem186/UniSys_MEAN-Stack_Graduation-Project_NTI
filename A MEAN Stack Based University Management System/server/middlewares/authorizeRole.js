const appError = require("../utils/appError");


module.exports = (...roles) => {
    // ["ADMIN","MANAGER"]
    // console.log("roles ", roles);
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(appError.create('this role is not authorized',401))
        }
        next();
    }
}

// function authorizeRole(requiredRole){
//     return(req,res,next)=>{
//         if(req.user.role!==requiredRole){
//             // return next(AppError.create('Access denied: Admins only', 403));
//             throw appError.create('Access denied', 403);
//         }
//        next();
//     }
// }


// module.exports={authorizeRole}

