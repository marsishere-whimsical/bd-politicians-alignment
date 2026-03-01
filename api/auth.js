export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { password } = req.body;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (password === correctPassword) {
        return res.status(200).json({ authenticated: true });
    }

    return res.status(401).json({ authenticated: false });
}
