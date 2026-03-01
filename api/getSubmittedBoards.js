import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('sandwich-alignment');
    const collection = db.collection('sandwich-board-records');

    // Find boards where source is "user-submitted-on-site" and has at least 5 sandwiches
    const boards = await collection.find({
      source: 'user-submitted-on-site',
      $expr: { $gte: [{ $size: '$sandwichesOnBoard' }, 5] }
    }).sort({ createdAt: -1 }).toArray();

    res.status(200).json({ boards, count: boards.length });

  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards', details: error.message });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
