import { registerUser, logInUser} from "./auth.service.js";
import {generateToken } from "../../shared/utils/generateToken.js"
import asyncHandler from "../../utils/asyncHandler.js";

const register = asyncHandler(async(req, res, next) =>  {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.userID,
          name: user.name,
          email: user.email,
        },
      },
    });
})

async function login(req, res) {
    //login user | if loginUser throws new errro  => asyncHandler catches  => globalMiddleware responds
    const user  = await logInUser(req.body);

    //generate jwt token
    const token = generateToken(user.userID);
    console.log(token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(20).json({
      status: "success",
      data: {
        user: {
          id: user.userID,
          name: user.name,
          email: user.email,
          role: user.role.toLocaleLowerCase()
        },
        // do not show token here because it is aready saved in cookie in generateToken funciton
        token,
      },
    });
}

async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Logout failed",
    });
  }
}

export { register, login, logout };
