export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // 1. 获取并极致清理 Key
    const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/['"‘“’” ]/g, "");
    const { prompt } = req.body;

    // 2. 构造绝对标准的 URL
    const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    try {
        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://vercel.com",
                "X-Title": "PBL_Assistant"
            },
            body: JSON.stringify({
                // 使用 OpenRouter 官方最稳的模型 ID 字符串
                "model": "google/gemini-flash-1.5",
                "messages": [{ "role": "user", "content": prompt }]
            })
        });

        // 3. 捕获原始状态码
        if (response.status === 404) {
            const errorText = await response.text();
            console.error("OpenRouter 404 Raw Text:", errorText);
            return res.status(500).json({ error: `OpenRouter 路径 404。请检查 URL 或模型 ID。原始回复: ${errorText}` });
        }

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ 
                candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] 
            });
        } else {
            res.status(500).json({ error: "接口返回异常: " + JSON.stringify(data.error || data) });
        }
    } catch (error) {
        res.status(500).json({ error: "服务器通讯故障: " + error.message });
    }
}
