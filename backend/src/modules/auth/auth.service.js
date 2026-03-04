import { prisma } from "../../config/db.config.js";
import bcrypt from "bcryptjs";
import {
  createCustomerProfile,
  createRiderProfile,
} from "../../shared/utils/profieCreator.js";

//register user controller
const registerUser = async (userData) => {
  try {
    const { name, email, password, role } = userData;

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
    //Create profile based on role
    if (role === "CUSTOMER") {
      await createCustomerProfile(user.userID, req.body);
    } else if (role === "RIDER") {
      await createRiderProfile(user.userID, req.body);
    }

    return user;
  } catch (error) {
    console.error(error);
  }
};

//  jwt login authentication
const logInUser = async (userData) => {
  const { email, password } = userData;
  console.log(email, password);

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new Error("Invalid password or email");
  }
  //verify password
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error("Invalid password or email");
  }
  
  return user;
};

export { registerUser, logInUser};
