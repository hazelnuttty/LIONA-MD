const axios = require("axios");

async function skoleAI(question) {
  if (!question) throw new Error("Question is required.");
  const payload = {
    id: "D4uBrf6hBYxJbBEI",
    messages: [
      {
        role: "system",
        content: "Hey there! What can I help you with?",
        parts: [{ type: "text", text: "Hey there! What can I help you with?" }]
      },
      {
        role: "user",
        content: question,
        parts: [{ type: "text", text: question }]
      }
    ],
    prompt: "chat-for-students",
    promptType: "sanity",
    locale: "en-US",
    inputs: {},
    sessionId: "fef302c8-c388-4637-bb3d-c91f379cdc4f",
    model: "gpt-5-mini",
    anonymousUserId: "46308cbe-21c0-475c-a2bf-a2d338445f70"
  };

  const response = await axios.post(
    "https://skoleapi-py.midgardai.io/chat/",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "User-Agent": "Mozilla/5.0"
      },
      responseType: "stream"
    }
  );

  return new Promise((resolve, reject) => {
    let result = "";
    response.data.on("data", (chunk) => {
      const text = chunk.toString();
      const matches = text.match(/0:\"(.*?)\"/g);
      if (matches) {
        for (const m of matches) {
          const clean = m.replace(/^0:\"|\"$|\\n/g, "");
          result += clean;
        }
      }
    });
    response.data.on("end", () => {
      if (!result.trim()) result = "Maaf, saya tidak mendapatkan respons yang valid. Silakan coba lagi.";
      resolve(result.trim());
    });
    response.data.on("error", (err) => reject(err));
  });
}

module.exports = skoleAI;
