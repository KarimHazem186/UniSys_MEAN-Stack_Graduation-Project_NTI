const jwt = require('jsonwebtoken')

function generateAccessToken(user){
    const payload={
        userId:user._id,
        role:user.role
    };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    const options = {expiresIn:"1h"}

    return jwt.sign(payload,secretKey,options);
}

function generateRefreshToken(user){
    const payload = {
        userId:user._id,
        role:user.role
    };
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    const options = {expiresIn:"7d"}
    return jwt.sign(payload,secretKey,options);
}


function generateResetToken(userId) {
    return jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"10m"
    })
}


module.exports ={
    generateAccessToken,
    generateRefreshToken,
    generateResetToken
}
