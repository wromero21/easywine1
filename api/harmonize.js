import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { image, ingredients, category, userName } = req.body;
    // O backend pega a chave segura da Vercel
    const apiKey = process.env.GOOGLE_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave API não configurada no servidor.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // PROMPT REFINADO: Neutro, Sofisticado e Honesto.
    const prompt = `
      Atue como um Sommelier Profissional, Moderno e Sofisticado.
      
      CONTEXTO:
      - Cliente: ${userName || "Prezado"}.
      - Categoria: ${category || "Não informada"}.
      - Descrição/Prato: ${ingredients || "Não informado"}.
      
      DIRETRIZES:
      1. TOM DE VOZ: 
         - Elegante, mas acessível. Sem "sommelierês" complexo.
         - Português brasileiro neutro (sem gírias regionais).
      
      2. IDENTIFICAÇÃO:
         - Se houver foto: Priorize a análise visual.
         - Se houver apenas texto: Use o conceito do prato.

      3. PROTOCOLO DE HONESTIDADE:
         - Se for um clássico (Feijoada, Churrasco, Sushi): Reconheça a bebida tradicional (Caipirinha, Cerveja, Saquê) como excelente opção, mas apresente o vinho como uma alternativa de experiência.
           Ex: "João, embora a caipirinha seja a alma deste prato, um Espumante Brut traz uma leveza surpreendente..."
         - Se for Fast Food: Trate com sofisticação irônica ("High-Low"), elevando a experiência.

      OUTPUT JSON (Estrito):
      {
        "estilo": "Nome do estilo",
        "caracteristicas": { "corpo": 5, "acidez": 5, "taninos": 0, "docura": 1 },
        "perfil": "3 aromas (ex: Frutas Negras, Especiarias)",
        "explicacao": "Frase direta e elegante para o cliente.",
        "temperatura": "Ex: 16-18°C",
        "paises": ["País 1", "País 2"]
      }
    `;

    const parts = [{ text: prompt }];
    
    if (image) {
      const base64Data = image.split(',')[1] || image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
    
    return res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error('Erro Backend:', error);
    return res.status(500).json({ error: 'Erro ao harmonizar.' });
  }
}
