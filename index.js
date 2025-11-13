const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
// console.log(process.env);
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pr7icaj.mongodb.net/?appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const pawmart = client.db("pawmart");
    const usersCollection = pawmart.collection("users");
    const productsCollection = pawmart.collection("listings");
    const bidsCollection = pawmart.collection("orders");

    // user related apis

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/users/:userId", async (req, res) => {
      const id = req.params.userId;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email: email };
      const isExisting = await usersCollection.findOne(query);
      if (isExisting) {
        res.send({ message: "User already exist. Do not needed insert again", currentUser: isExisting });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send({ currentUser: result });
      }
    });

    app.patch("/users/:userId", async (req, res) => {
      const id = req.params.userId;
      const updatedUser = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedUser.name,
          price: updatedUser.price,
        },
      };
      const option = {};
      const result = await usersCollection.updateOne(query, update, option);
      res.send(result);
    });

    app.delete("/users/:userId", async (req, res) => {
      const id = req.params.userId;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // product related apis
    app.get("/recentProducts", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({
          date: -1,
        })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const category = req.query.category;
      const query = {};
      if (email) {
        query.email = email;
      } else if (category && category != "All Categories") {
        query.category = category;
      }
      const cursor = productsCollection.find(query).sort({
        date: -1,
      });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/search", async (req, res) => {
      const search = req.query.search;
      const query = { name: { $regex: search, $options: "i" } };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/products/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.delete("/products/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/products/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: req.body.name,
          category: req.body.category,
          price: req.body.price,
          location: req.body.location,
          description: req.body.description,
          image: req.body.photo,
          email: req.body.email,
          date: req.body.date,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    // orders related apis
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });
    app.get("/orders/:id", async (req, res) => {
      const product = req.params.id;
      console.log(product);
      const query = {};
      if (product) {
        query.product = product;
      }
      const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/orders", async (req, res) => {
      const bid = req.body;
      const result = await bidsCollection.insertOne(bid);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Paw Mart server is running.....");
});

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
