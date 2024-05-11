require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://volunteer-management-91459.web.app",
      "https://volunteer-management-91459.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ze9kj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb+srv://volunteer:WAeAMbvRV06W3Hff@cluster0.6ze9kj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const requestCollection = client
      .db("volunteerManagementDB")
      .collection("requests");

    // get all volunteers from the database
    app.get("/all-volunteers", async (req, res) => {
      const search = req.query?.search;
      console.log(search);

      let query = {};
      if (search) {
        query = { title: { $regex: search, $options: "i" } };
      }

      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/volunteers/:email", async (req, res) => {
      const email = req.params?.email;
      const query = { email: email };
      // console.log(email);
      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    // get a single volunteer by id
    app.get("/volunteers/s/:id", async (req, res) => {
      const id = req.params?.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    // add volunteer to the database
    app.post("/add-volunteer", async (req, res) => {
      const volunteer = req.body;
      console.log(volunteer);
      const result = await volunteerCollection.insertOne(volunteer);
      res.send(result);
    });

    // update a specific volunteer document
    app.put("/volunteers/:id", async (req, res) => {
      const updateVolunteer = req.body;
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...updateVolunteer,
        },
      };
      const result = await volunteerCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // delete a volunteer by id
    app.delete("/volunteers/:id", async (req, res) => {
      const id = req.params?.id;
      console.log(id, "form client");
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.deleteOne(query);
      res.send(result);
    });

    // request related api

    app.get("/requests/:email", async (req, res) => {
      const {
        params: { email },
      } = req;
      console.log(email, "from client");
      const result = await requestCollection
        .find({
          "organizer_info.organizer_email": email,
        })
        .toArray();
      res.send(result);
    });

    app.post("/requests", async (req, res) => {
      const volunteerReq = req.body;

      // const query = {
      //   email:volunteerReq?.organizer_email,
      //   postId:volunteerReq?.postId
      // }

      // const alreadyRequest = await requestCollection.findOne(query)
      // console.log(alreadyRequest);
      // if(alreadyRequest) {
      //   return res.status(400).send('You have already request this post!')
      // }

      const result = await requestCollection.insertOne(volunteerReq);

      const updateDoc = {
        $inc: { volunteer: -1 },
      };

      const reqQuery = { _id: new ObjectId(volunteerReq?.postId) };
      const updateReqCount = await volunteerCollection.updateOne(
        reqQuery,
        updateDoc
      );
      console.log(updateReqCount, "updated doc");

      res.send(result);
    });

    app.delete("/requests/:id", async (req, res) => {
      const {
        params: { id },
      } = req;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
