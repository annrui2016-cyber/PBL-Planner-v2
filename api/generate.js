export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    const { prompt } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apiKey.trim(),
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com",
                "X-Title": "PBL Planner"
            },
            body: JSON.stringify({
                // 修改点：使用 OpenRouter 官方最标准的模型 ID
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
            // 如果报错，把 OpenRouter 返回的详细 JSON 直接吐出来供我们排查
            res.status(500).json({ error: "API返回详情: " + JSON.stringify(data) });
        }
    } catch (error) {
        res.status(500).json({ error: "通讯异常: " + error.message });
    }
}
