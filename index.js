require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ msg: "Volunteer Management system" });
});

app.listen(port,()=>{
    console.log(`server on running port ${port}`);
})

// cookie options
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
// };

// //creating Token
// app.post("/jwt", logger, async (req, res) => {
//     const user = req.body;
//     console.log("user for token", user);
//     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

//     res.cookie("token", token, cookieOptions).send({ success: true });
//   });

//   //clearing Token
//   app.post("/logout", async (req, res) => {
//     const user = req.body;
//     console.log("logging out", user);
//     res
//       .clearCookie("token", { ...cookieOptions, maxAge: 0 })
//       .send({ success: true });
//   });
