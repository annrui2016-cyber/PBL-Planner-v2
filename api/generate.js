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
                // 修改点：使用 OpenRouter 确定的免费版模型 ID
                "model": "google/gemini-flash-1.5-exp", 
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            // 这里非常关键：如果还报错，它会打印出具体原因
            res.status(500).json({ error: "OpenRouter返回: " + (data.error?.message || JSON.stringify(data)) });
        }
    } catch (error) {
        res.status(500).json({ error: "服务器通讯异常: " + error.message });
    }
}
