require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//monddB by Satyjit 
//mongoDB URI ashraf //Code worked by ashraf
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

    //JWT and Token Setting related API
    app.post("/jwt", async (req, res) => {
      const user = req.body;//called as data or payload
      const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: '1d' });
      res.send({ token });

    })

    //JWT middleware
    const verifyToken = (req, res, next) => {
      
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      //Token Verification
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: "unauthorized access" });
        }
        req.decoded = decoded;
        next();
      })
    }


           //request verification for admins after JWT verification
           const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === "admin";

            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden admin access' });
            }
            next()
        }


        //admin confirmation API
        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden admin access' })
            }
            const query = { email: email };
            const adminUser = await userCollection.findOne(query);
            let admin = false;
            if (adminUser) {
                admin = adminUser?.role === "admin";
            };
            console.log({ admin })
            res.send({ admin });
        })

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


app.get("/", (req, res) => {
  res.send("Server Running")
})


app.listen(port, () => { console.log(`server is running at port: ${port}`) })