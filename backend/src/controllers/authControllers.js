import { prisma } from "../config/db.config.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import {
  createCustomerProfile,
  createRiderProfile,
} from "../utils/profieCreator.js";

//register user controller
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("BODY:", req.body);
    console.log("NAME:", name);

    //check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //createUser
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    });
    // 3️⃣ Create profile based on role
    if (role === "CUSTOMER") {
      await createCustomerProfile(user.userID, req.body);
    } else if (role === "RIDER") {
      await createRiderProfile(user.userID, req.body);
    }
    //generate jwt token
    // const token = generateToken(user.userID, res); we do not want to keep user logged in

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.userID,
          name: name,
          email: email,
        },
        // token,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
};

//  jwt login authentication
const logIn = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid password or email" });
  }
  //verify password
  const validPassword = await bcrypt.compare(password, user.password);
  console.log(validPassword)
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid password or email" });
  }

  //generate jwt token
  const token = generateToken(user.userID, res);
  console.log(token)

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.userID,
        email: user.email,
      },
      token,
    },
  });
};

//logout controller
const logOut = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "successful",
    message: "logout successfully",
  });
};
export { register, logIn, logOut };
