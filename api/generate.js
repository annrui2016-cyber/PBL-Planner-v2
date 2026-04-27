export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(500).json({ error: "环境变量 GEMINI_API_KEY 为空" });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apiKey.trim(), // 使用最稳妥的字符串拼接，并自动去掉多余空格
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com",
                "X-Title": "Chinese PBL Planner"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5",
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            res.status(500).json({ error: "OpenRouter 报错: " + JSON.stringify(data.error) });
        }
    } catch (error) {
        res.status(500).json({ error: "服务器通讯异常: " + error.message });
    }
}
