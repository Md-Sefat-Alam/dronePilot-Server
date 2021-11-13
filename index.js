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
        const productsCollection = database.collection('productsCollection');
        const clientOrders = database.collection('clientOrders');
        const reviewCollection = database.collection('reviewCollection');

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

        // update normal user to admin user
        app.put('/users/:uid', async (req, res) => {
            const uidGet = req.params.uid;
            if (uidGet === '618e2f2b5494cb57d536b5e7') {
                return;
            }
            const queryParam = req.query.remove;
            let accessStatus = 'admin'
            if (queryParam) {
                accessStatus = 'normal'
            }

            console.log('hitted update', uidGet);
            const filter = { userIdentity: uidGet };
            const options = { upsert: true };
            const updateUser = {
                $set: {
                    access: accessStatus
                },
            }
            const result = await userCollection.updateOne(filter, updateUser, options)
            res.send(result);
        })

        // get admin or not
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.access === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // add an products
        app.post('/add-product', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.json(result)
        })

        // get product on limit 6
        app.get('/get-product/6', async (req, res) => {
            const cursor = productsCollection.find({});
            const getUsers = await cursor.limit(6).toArray();
            res.send(getUsers)
        })
        // get product all
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const getUsers = await cursor.toArray();
            res.send(getUsers)
        })
        // get product a product by id
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = await productsCollection.findOne(query);
            res.json(cursor);
        })


        // add an order
        app.post('/client-order', async (req, res) => {
            const newProduct = req.body;
            const result = await clientOrders.insertOne(newProduct);
            res.json(result)
        })

        // remove an order
        app.delete('/my-orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await clientOrders.deleteOne(query);
            res.json(result);
        })


        // get my orders
        app.get('/my-orders/:uid', async (req, res) => {
            const uidGet = req.params.uid;
            console.log(uidGet)
            const query = { orderPerson: uidGet };
            const getUser = clientOrders.find(query)
            const result = await getUser.toArray();
            res.send(result);
        })


        // add a review
        app.post('/add-review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.json(result)
        })

        // get all review
        app.get('/get-review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const getReview = await cursor.toArray();
            res.send(getReview)
        })



        // // delete a order collection
        // DELETE API
        // app.delete('/my-orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await deliveryCollection.deleteOne(query);
        //     res.json(result);
        // })

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