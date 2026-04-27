export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: '仅支持 POST' });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const { prompt } = req.body;

    if (!apiKey) {
        return res.status(500).json({ error: "环境变量 GEMINI_API_KEY 未配置" });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com",
                "X-Title": "PBL_Planner"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5", // 确认这个 ID 是 OpenRouter 的标准格式
                "messages": [{ "role": "user", "content": prompt }],
                "temperature": 0.7
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            console.error("OpenRouter Response:", data);
            res.status(500).json({ error: "API返回详情: " + JSON.stringify(data.error || data) });
        }
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ error: "网络请求异常: " + error.message });
    }
}
