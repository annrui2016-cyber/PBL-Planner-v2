export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5", // 依然使用 Gemini 模型
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        const data = await response.json();
        
        // OpenRouter 的返回格式稍微不同，我们要适配一下
        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            res.status(500).json({ error: data.error?.message || "中继服务调用失败" });
        }
    } catch (error) {
        res.status(500).json({ error: "网络连接故障: " + error.message });
    }
}
