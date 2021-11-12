const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.npegz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('drone-pilot');
        const userCollection = database.collection('user-data');

        // add an user data
        app.post('/add-user', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log('an user added')
            res.json(result);
        })

        // get all user
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const getUsers = await cursor.toArray();
            res.send(getUsers)
        })
        // get an user
        app.get('/users/:uid', async (req, res) => {
            const uidGet = req.params.uid;
            console.log(uidGet)
            const query = { userIdentity: uidGet };
            const getUser = await userCollection.findOne(query)
            // const result = await getUser.toArray();
            res.json(getUser);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Drone Pilots Server is Running')
})
app.listen(port, () => {
    console.log('Drone Pilots Server Running on port ', port);
})