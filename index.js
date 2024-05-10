require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");

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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ze9kj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const volunteerCollection = client
      .db("volunteerManagementDB")
      .collection("volunteers");

    // get all volunteers from the database
    app.get("/volunteers", async (req, res) => {
      const result = await volunteerCollection.find().toArray();
      res.send(result);
    });

    app.get("/volunteers/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email: email };
      console.log(email);
      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    // add volunteer to the database
    app.post("/add-volunteer", async (req, res) => {
      const volunteer = req.body;
      console.log(volunteer);
      const result = await volunteerCollection.insertOne(volunteer);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send({ msg: "Volunteer Management system" });
});

app.listen(port, () => {
  console.log(`server on running port ${port}`);
});

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
