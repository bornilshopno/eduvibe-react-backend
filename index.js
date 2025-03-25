require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app=express();
const port= process.env.PORT || 5000

app.use(cors())
app.use(express.json())


//mongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k5awq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const eduVibe = client.db('eduVibe')
    const userCollection = eduVibe.collection('users')
    const contactsCollection = eduVibe.collection('contacts')

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
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res)=>{
res.send("Server Running")
})
 

app.listen(port,()=>{console.log(`server is running at port: ${port}`)})