export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 自检：如果没读到 Key，直接报错
    if (!apiKey) {
        return res.status(500).json({ error: 'Vercel 后台没找到 GEMINI_API_KEY，请检查 Environment Variables 拼写' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            // 如果 Google 返回了错误（比如 Location not supported）
            return res.status(500).json({ error: 'Google API 报错: ' + data.error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: '网络连接故障: ' + error.message });
    }
}
