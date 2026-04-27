export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;

    // 检查点 1：确认钥匙有没有读到
    if (!apiKey) {
        return res.status(500).json({ error: "Vercel 没读到 API Key，请检查环境变量名是否完全一致。" });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`, // 这里的 Bearer 后面有个空格
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com", // OpenRouter 有时需要这个
                "X-Title": "PBL Planner"
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5",
                "messages": [{ "role": "user", "content": req.body.prompt }]
            })
        });

        const data = await response.json();

        // 检查点 2：确认 OpenRouter 的返回结构
        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            // 这里会打印 OpenRouter 报错的真实原因（比如：余额不足或模型不可用）
            res.status(500).json({ error: data.error?.message || JSON.stringify(data) });
        }
    } catch (error) {
        res.status(500).json({ error: "连接 OpenRouter 失败: " + error.message });
    }
}
