import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET;
const jwtIssuer = process.env.JWT_ISSUER;

export default {
  port: port,
  jwtIssuer,
  jwtSecret,
};
