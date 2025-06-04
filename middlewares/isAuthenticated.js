import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not logged in",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);

    if (!decode) {
      return res.status(401).json({
        message: "Token not valid",
        success: false,
      });
    }

    req.id = decode.userId;

    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Authentication failed",
      success: false,
      error: e.message,
    });
  }
};

export default isAuthenticated;
