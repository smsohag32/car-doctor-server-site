const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

// middleware 

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

// root path
app.get('/', (req,res)=> {
    res.send('Doctor is running');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6otengp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'})
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded)=>{
    if(error){
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();

  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const servicesCollection = client.db('carDoctor').collection('services');
    const bookingCollection = client.db('carDoctor').collection('bookings')
    
    // jwt 
        app.get('/jwt', (req, res)=>{
          const user = req.body;
          const token = jwt.sign(user, process.env.ACCESS_TOKEN,{
            expiresIn: '1h'
          });
          res.send({token});
        })

        // get services 
    app.get('/services', async (req,res)=>{
      const result = await servicesCollection.find().toArray();
      res.send(result);
    })



    // get specific id data in mongodb

    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const option = {
        projection: {
          _id: 1 ,
          title: 1,
          img: 1,
          price: 1,
        }
      }
      const result = await servicesCollection.findOne(query, option);
      res.send(result)
    })
    // query params  ?email=sohag@gmail.com
    app.get('/bookings', verifyJWT, async(req,res)=>{
      // console.log(req.query);
      // let query = {};
      // if(req.query?.email){
      //   query = {email: req.query.email}
      // }
      // const result = await bookingCollection.find(query).toArray();
      // res.send(result)
      // const token = req.headers.authorization
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        return res.status(403).send({error: true, message: 'forobe access'})
      }
      let query = {}
      if(req.query.email){
        query = { email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);

    })

    // post bookings
    app.post('/bookings', async(req,res)=>{

      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
     
    })
    // patch 
    app.patch('/bookings/:id', async(req, res) => {
      // const id = req.params.id;
      // const filter = {_id: new ObjectId(id)}
      // const updateBooking = req.body;
      // const updateDoc = {
      //   $set: {
      //     status: updateBooking.status,
      //   }
      // }
      // const result = await bookingCollection.updateOne(filter, updateDoc);
      // res.send(result)

      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateBooking = req.body;
      const updateDoc = {
        $set: {
          status: updateBooking.status,
        }
      }
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // delete

    app.delete('/bookings/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);



app.listen(port , ()=> {
    console.log(`car doctor is running on port ${port}`);
})