const jwt = require("jsonwebtoken")
const {isTokenRevoked} = require("./tokenBlacklist")

exports.verifyToken = (req, res, next)=>{
    // check is user is loggedin
    // next()
    // console.log(req.headers.abc)
    // if(req.headers.abc==="HelloJi"){
    //     next()
    // } else {
    //     return res.json({message: "Header is missing"})
    // }


    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({error: "Not authorized, Login first"})
    }

    const prefix = authHeader.substring(0,7)
    if(!prefix || prefix !== 'Bearer '){
        return res.status(401).json({error: "Not authorized, Login first"})
    }

    const token = authHeader.substring(7)

    if(isTokenRevoked(token)){
        return res.status(401).json({error: "Invalid or Revoked token"})
    }
    

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token;
        next();
    } catch(err){
        return res.status(401).json({error: "Invalid or Expired token"})
    }


            
}

exports.requireAdmin = (req, res, next)=>{
    // check is admin is loggedin
    // next()
    if(req.user.role!=="admin"){
        return res.status(403).json({error: "Admin required"})
    }

    next();
}


