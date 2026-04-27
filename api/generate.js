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
                // 使用 OpenRouter 目前最标准的 Gemini 模型 ID
                "model": "google/gemini-flash-1.5", 
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        const data = await response.json();

        // 如果成功返回
        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            // 这里会把 404 的具体原因吐出来
            console.error("OpenRouter Error Details:", data);
            res.status(500).json({ error: "OpenRouter 报错: " + JSON.stringify(data.error || data) });
        }
    } catch (error) {
        res.status(500).json({ error: "服务器通讯异常: " + error.message });
    }
}
