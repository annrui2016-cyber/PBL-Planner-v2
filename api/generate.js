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
                // 修改点：使用 OpenRouter 官方文档中最标准的 ID
                "model": "google/gemini-2.0-flash-exp:free", 
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            // 如果报错，它会打印出 OpenRouter 此时建议的模型列表或原因
            res.status(500).json({ error: "OpenRouter 报错: " + (data.error?.message || "未知模型错误") });
        }
    } catch (error) {
        res.status(500).json({ error: "连接异常: " + error.message });
    }
}
