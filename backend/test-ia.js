
const OpenAI = require("openai");

async function testIA() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("ERRO: OPENAI_API_KEY não encontrada no ambiente.");
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey });

    try {
        console.log("Iniciando teste de comunicação com OpenAI...");
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Olá, responda com a palavra: FUNCIONANDO" }],
            max_tokens: 10
        });

        console.log("RESPOSTA DA API:", response.choices[0].message.content);
        if (response.choices[0].message.content.includes("FUNCIONANDO")) {
            console.log("TESTE CONCLUÍDO COM SUCESSO!");
        } else {
            console.log("RESPOSTA RECEBIDA, MAS NÃO CONTEÚDO ESPERADO.");
        }
    } catch (error) {
        console.error("ERRO NA API OPENAI:", error.message);
        process.exit(1);
    }
}

testIA();
