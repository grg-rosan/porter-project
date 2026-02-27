import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config.js";

//read the token form the request
//check if the token is valid
export const authMiddleware = async (req, res, next) => {
  //<-------get token form headers ------>
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return res.status(401).json({ message: "not authorized" });
  }

  //<<-----verify if user exists ------->
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { userID: decoded.id },
    });
    if (!user) {
      return res.status(401).json({ error: "user no longer exists" });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: "not authorized, token failed" });
  }
};
