import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let client;
    try {
      // Initialize and connect the MongoDB client
      client = new MongoClient(uri);
      await client.connect();

      const db = client.db('sandwich-alignment');
      const collection = db.collection('sandwich-board-records');

      // Insert the document
      const result = await collection.insertOne({ ...req.body, createdAt: new Date() });
      res.status(200).json({ insertedId: result.insertedId });

    } catch (error) {
      console.error('Error inserting board state:', error);
      res.status(500).json({ error: 'Failed to insert board state', details: error.message });
    } finally {
      if (client) {
        await client.close();
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
