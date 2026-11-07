const OpenAI = require("openai");
const { groqApiKey, groqModel } = require("../config");

let client = null;

const getClient = () => {
    if (client) {
        return client;
    }

    const apiKey = (groqApiKey || "").trim();

    if (!apiKey) {
        return null;
    }

    try {
        client = new OpenAI({
            apiKey,
            baseURL: "https://api.groq.com/openai/v1"
        });
        return client;
    } catch (error) {
        console.error("Erro ao inicializar cliente de IA:", error);
        return null;
    }
};

module.exports = async ({ args }) => {
    const prompt = args.join(" ").trim();

    if (!prompt) {
        return "Exemplo: ,ia explique o que é Node.js";
    }

    const openAIClient = getClient();

    if (!openAIClient) {
        return "Comando indisponível: chave não configurada";
    }

    try {
        const response = await openAIClient.chat.completions.create({
            model: groqModel,
            messages: [
                {
                    role: "system",
                    content: "Responda em português brasileiro de forma clara e útil."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error(error);
        return "Erro ao consultar a IA.";
    }
};