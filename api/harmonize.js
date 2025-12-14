import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    // 1. Pega os dados que o site mandou
    const { image, ingredients, category, userName } = await request.json();

    // 2. Configura a IA com a chave que está na Vercel
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Monta o Prompt (o pedido para o Sommelier)
    let prompt = `Você é um Sommelier profissional chamado EasyWine.
    O usuário ${userName || 'Amante de Vinho'} quer uma harmonização.
    
    Detalhes do prato:
    ${ingredients ? `Ingredientes/Prato: ${ingredients}` : ''}
    ${category ? `Categoria: ${category}` : ''}
    ${image ? `(O usuário enviou uma foto do prato)` : ''}

    Sua tarefa: Indique o MELHOR vinho para harmonizar.
    
    Responda EXATAMENTE neste formato JSON (sem ```json ou markdown):
    {
      "estilo": "Nome do Estilo do Vinho (ex: Cabernet Sauvignon Encorpado)",
      "explicacao": "Um parágrafo curto, elegante e sedutor explicando por que combina.",
      "temperatura": "XX - XX°C",
      "paises": ["País 1", "País 2"],
      "perfil": "Frutado, Seco, Amadeirado",
      "caracteristicas": {
        "corpo": 1 a 5,
        "acidez": 1 a 5,
        "taninos": 1 a 5,
        "docura": 1 a 5
      }
    }`;

    // 4. Se tiver imagem, prepara ela para a IA
    let result;
    if (image) {
      // Remove o cabeçalho do base64 se existir (data:image/...)
      const base64Data = image.split(',')[1] || image;
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }

    // 5. Devolve a resposta para o site
    const responseText = result.response.text();
    
    // Limpa a resposta para garantir que é JSON puro
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return new Response(cleanJson, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Erro no Sommelier' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
    }

