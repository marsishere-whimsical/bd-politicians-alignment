import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        let client;
        try {
            client = new MongoClient(uri);
            await client.connect();

            const db = client.db('sandwich-alignment');
            const collection = db.collection('sandwich-board-records');

            // Delete all documents in the collection
            const result = await collection.deleteMany({});

            res.status(200).json({
                message: 'Collection cleared successfully',
                deletedCount: result.deletedCount
            });

        } catch (error) {
            console.error('Error clearing database:', error);
            res.status(500).json({ error: 'Failed to clear collection', details: error.message });
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
