const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.SECRET_KEY}@cluster0.28gkq0d.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const database = client.db('carDoctor');
    const serviceCollection = database.collection('services');
    const ordersCollection = database.collection('orders');

    // services routes
    app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { service_id: 1, title: 1, price: 1, img: 1 }
      }
      const result = await serviceCollection.findOne(query, options)
      res.send(result);
    });

    //orders route
    app.get('/orders', async(req, res) => {
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await ordersCollection.find(query).toArray();
      res.send(result)
    });

    app.post('/orders', async(req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.send(result)
    });

    app.patch('/orders/:id', async(req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updateOrder.status
        }
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/orders/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('car doctor server is running....')
})

app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`);
})