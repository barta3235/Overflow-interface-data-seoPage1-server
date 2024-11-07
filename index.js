const express = require('express')
const cors = require('cors')
const app = express()
const multer = require('multer');
const port = process.env.port || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


app.use(cors({origin: '*'}))



//middleware
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n2g3mj5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const clientCollection = client.db('seoPage1').collection('clients')


        //get all clients
        app.get('/clients', async (req, res) => {
            const result = await clientCollection.find().toArray()
            res.send(result)
        })



        //post attachment
        app.post('/attachments', upload.array('files'), async (req, res) => {
            try {
                const files = req.files;
                const { clientId } = req.body;

                if (!clientId || !files.length) {
                    return res.status(400).send({ message: 'Client ID and files are required' });
                }

                const fileDetails = files.map(file => ({
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    data: file.buffer
                }));

                const result = await clientCollection.updateOne(
                    { _id: new ObjectId(clientId) },
                    { $push: { files: { $each: fileDetails } } }
                );

                if (result.modifiedCount === 1) {
                    res.send({ message: 'Files uploaded successfully' });
                } else {
                    res.status(500).send({ message: 'Failed to update client with files' });
                }
            } catch (error) {
                console.error('Error uploading files:', error);
                res.status(500).send({ message: 'Error uploading files', error });
            }
        });



        //get post by id
        app.get('/attachments/:id',async(req,res)=>{
            const id= req.params.id
            const query={_id: new ObjectId(id)} 
            const result= await clientCollection.findOne(query)
            res.send(result)
        })








        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', async (req, res) => {
    res.send("Server Working")
})

app.listen(port, () => {
    console.log("Server working")
})