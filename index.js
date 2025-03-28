require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require("socket.io"); // Socket io
const http = require("http"); // ✅ HTTP module imported
const { MongoClient, ServerApiVersion } = require('mongodb');



const app = express();
const port = process.env.PORT || 5000;

// ✅ HTTP server created
const server = http.createServer(app);

// ✅ Socket.io server setup
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173", // React Frontend cors
    origin: "*", // React Frontend cors for any site
    methods: ["GET", "POST"]
  }
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ WebSocket Events
//connection: Triggered when a user connects.
io.on("connection", (socket) => { 
  console.log("A user connected:", socket.id); 

  //message: Listens for messages from clients
  socket.on("message", (msg) => { 
    console.log("Message received:", msg);
    io.emit("message", msg); // Broadcasts to all clients
  });

  //disconnect: Logs when a user leaves.
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// ✅ MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5awq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const eduVibe = client.db('eduVibe');
    const userCollection = eduVibe.collection('users');
    const contactsCollection = eduVibe.collection('contacts');

    app.get("/users", async (req, res) => {
      try {
        const users = await userCollection.find().toArray();
        res.send(users);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch users" });
      }
    });

    app.post("/contacts", async (req, res) => {
      try {
        const newContact = req.body;
        const result = await contactsCollection.insertOne(newContact);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to save contact" });
      }
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// ❌  app.listen(port)  (not connecting with socket)
// ✅ server.listen(port) (Required for both Express routes and WebSocket connections)
server.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
