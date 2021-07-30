const jwt = require("jsonwebtoken")
module.exports = (req,res,next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json("Authentication failed")
        }
        const decodedToken =  jwt.verify(token,process.env.JWT_KEY);
        req.userData = {userId: decodedToken.userId}
        next()
    } catch (err){
        res.status(403).json("Token is not Valid")
    }
}