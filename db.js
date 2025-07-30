const {MongoClient} = require('mongodb'); 

const dbURL = process.env.ATLAS_URI;

let db; 
async function connectToDB(){
    try{
    const client = new MongoClient(dbURL); 
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db("cs355db");
    console.log("connected to database:". db.databaseName); 
    } catch (error){
    console.log('Error connecting to MongoDB');
    throw error; 
    }
}

function getCollection(collectionName){
    if (!db){
        throw new Error('Database connection not established');
    }
    return db.collection(collectionName); 
}

module.exports = {
    connectToDB,
    getCollection,
};