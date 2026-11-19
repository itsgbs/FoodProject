const axios = require("axios");

exports.generateDishDescription = async ({
  name,
  category,
  spiceLevel,
  price,
}) => {
  const prompt = `
You are a professional food classification assistant.

Generate ONLY valid JSON.
No markdown.
No explanation text.

IMPORTANT RULES:
- Tags must be accurate restaurant-style tags
- Do NOT misclassify dishes
- Do NOT label main courses as desserts
- Allergens must be realistic
- Serves must be realistic (1 or 2)
- bestFor must be meal timings only

Dish Name: ${name}
Category: ${category}
Spice Level: ${spiceLevel}
Base Price: ${price}

Return JSON in this EXACT format:
{
  "description": "string",
  "tags": ["string"],
  "allergens": ["string"],
  "serves": "string",
  "bestFor": ["string"]
}
`;

  let response;

try {
  response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 700,
        response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
} catch (error) {
  console.log("GROQ STATUS:", error.response?.status);
  console.log("GROQ ERROR:", error.response?.data);
  throw error;
}

  // return JSON.parse(response.data.choices[0].message.content);
  const content = response.data.choices?.[0]?.message?.content;

if (!content || !content.trim()) {
  console.log("Groq returned empty content:", response.data);

  throw new Error("Groq returned an empty response. Please try again.");
}

try {
  return JSON.parse(content);
} catch (error) {
  console.log("Invalid JSON from Groq:", content);

  throw new Error("Groq returned an invalid JSON response.");
}
};