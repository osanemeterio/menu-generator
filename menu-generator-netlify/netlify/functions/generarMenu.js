// netlify/functions/generarMenu.js
// Classic Netlify Functions syntax (CommonJS). Node 18 has global fetch.
exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method Not Allowed" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const alimentos = body.alimentos || "";
    const restricciones = body.restricciones || "ninguna";

    const prompt = `Genera un menú semanal con desayuno, comida y cena para 7 días.
Usa solamente estos alimentos disponibles (puedes asumir condimentos básicos como sal, aceite y especias comunes):
${alimentos}

Respeta estas restricciones: ${restricciones}.
Intenta no repetir la misma receta más de 2 veces en la semana y busca variedad (legumbre, cereal, verdura, proteína).

Devuélvelo en formato JSON **válido** exactamente con esta estructura:
[
  {"dia":"Lunes","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Martes","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Miércoles","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Jueves","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Viernes","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Sábado","desayuno":"...","comida":"...","cena":"..."},
  {"dia":"Domingo","desayuno":"...","comida":"...","cena":"..."}
]`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: "OPENAI_API_KEY not set" }) };
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "";

    let menu;
    try {
      menu = JSON.parse(content);
    } catch (e) {
      const firstBracket = content.indexOf("[");
      const lastBracket = content.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const maybeJson = content.slice(firstBracket, lastBracket + 1);
        menu = JSON.parse(maybeJson);
      } else {
        menu = content;
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, menu })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err) })
    };
  }
};