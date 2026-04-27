export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const { prompt } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com",
                "X-Title": "PBL_Planner"
            },
            body: JSON.stringify({
                // 修改点：这是 OpenRouter 数据库中最标准的 Gemini 1.5 Flash ID
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
            // 如果还是 404，这里会输出 OpenRouter 报错的原始 JSON 内容
            res.status(500).json({ error: "OpenRouter 报错: " + JSON.stringify(data) });
        }
    } catch (error) {
        res.status(500).json({ error: "连接异常: " + error.message });
    }
}
