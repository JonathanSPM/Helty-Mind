import http from "node:http";
import { readFile, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 3000);

const systemPrompt = `Eres Helty Mind, un asistente de apoyo emocional para estudiantes universitarios.
Responde en español, con empatía, claridad y mensajes breves. Escucha primero y haz una pregunta útil cuando corresponda.
No digas que eres psicólogo, no diagnostiques, no prometas confidencialidad absoluta y no sustituyas a un profesional.
Puedes sugerir técnicas sencillas de autocuidado, respiración y organización académica.
Si la persona menciona suicidio, autolesiones, peligro inmediato o que no puede mantenerse a salvo, prioriza su seguridad:
recomienda contactar ahora a emergencias de su país, acudir a urgencias o avisar a una persona de confianza que esté físicamente cerca.
Pregunta si está en peligro inmediato. No dejes la respuesta solo en consejos generales.
Cuando parezca conveniente, sugiere solicitar una cita con el departamento de Psicología de la universidad.`;

try {
  for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // .env es opcional cuando las variables ya están configuradas en el sistema.
}

async function askAI(messages) {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY no configurada");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [{ role: "system", content: systemPrompt }, ...messages.slice(-12)],
      max_tokens: 350,
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`DeepSeek respondió ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "No pude preparar una respuesta. Intenta de nuevo en un momento.";
}

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function handleChat(request, response) {
  let rawBody = "";
  for await (const chunk of request) rawBody += chunk;

  try {
    const body = JSON.parse(rawBody);
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const validMessages = messages
      .filter(message => ["user", "assistant"].includes(message.role) && typeof message.content === "string")
      .map(message => ({ role: message.role, content: message.content.slice(0, 2000) }));

    if (!validMessages.length || validMessages.at(-1).role !== "user") {
      return json(response, 400, { error: "Se necesita un mensaje del estudiante." });
    }

    return json(response, 200, { reply: await askAI(validMessages) });
  } catch (error) {
    console.error(error.message);
    return json(response, 500, { error: "La IA no está disponible en este momento." });
  }
}

async function serveFile(request, response) {
  const requestedPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filePath = normalize(join(root, requestedPath));
  if (!filePath.startsWith(root)) return json(response, 403, { error: "Acceso no permitido." });

  try {
    const content = await new Promise((resolve, reject) => readFile(filePath, (error, data) => error ? reject(error) : resolve(data)));
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
    response.writeHead(200, { "Content-Type": `${types[extname(filePath)] || "application/octet-stream"}; charset=utf-8` });
    response.end(content);
  } catch {
    json(response, 404, { error: "Archivo no encontrado." });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/chat") return handleChat(request, response);
  if (request.method === "GET") return serveFile(request, response);
  json(response, 405, { error: "Método no permitido." });
});

server.listen(port, () => console.log(`Helty Mind disponible en http://localhost:${port}`));