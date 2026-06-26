import * as https from "https";

export function openaiChatCompletion(params: {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      reject(new Error("OPENAI_API_KEY is not set"));
      return;
    }

    const bodyBuffer = Buffer.from(JSON.stringify(params), "utf-8");

    const req = https.request(
      {
        hostname: "api.openai.com",
        port: 443,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": bodyBuffer.length,
        },
        timeout: 120000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(
              Buffer.concat(chunks).toString("utf-8"),
            );
            if (parsed.error) {
              reject(new Error(parsed.error.message));
            } else {
              resolve(parsed.choices[0].message.content || "");
            }
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", reject);
      },
    );

    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.write(bodyBuffer);
    req.end();
  });
}
