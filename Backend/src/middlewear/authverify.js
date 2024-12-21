const jwt = require('jsonwebtoken');
const User = require('../models/user'); 
const responseHandler = require('../utils/responseHandler');

// Middleware to verify if the request has a valid token
const authverify = async (req, res, next) => {
  try {
    let token = undefined;

    // Extract the token from the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
      token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Assuming "Bearer <token>"
    }else if(req.cookies.authToken){
      token = req.cookies.authToken;
    }

    if (!token) {
      return responseHandler(res, 401, 'Access denied. No token provided.');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET should be stored in environment variables

    // Find the user based on the decoded ID (stored in the token)
    const user = await User.findById(decoded.userId); 

    if (!user) {
      return responseHandler(res, 401, 'User not found.');
    }

    // Attach the user to the request object for further use in routes
    req.user = user;

    // Call the next middleware or route handler
    next();

  } catch (err) {
    console.error('Error in authverify:', err.message || err);
    return responseHandler(res, 401, 'Invalid token or token expired.');
  }
};

module.exports = authverify;
