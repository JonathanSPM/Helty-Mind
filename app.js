// ─── VARIABLES GLOBALES ───
let nombreEstudiante = "";
let matriculaEstudiante = "";
let historialChat = [];

// ─── LÓGICA DE LOGIN Y SALIDA ───
function iniciarSesion() {
  const inputNombre = document.getElementById('student-name').value.trim();
  const inputMatricula = document.getElementById('student-id').value.trim();

  if (!inputNombre || !inputMatricula) {
    alert("Por favor, ingresa tu nombre y matrícula para continuar.");
    return;
  }

  nombreEstudiante = inputNombre;
  matriculaEstudiante = inputMatricula;

  document.getElementById('login-page').classList.remove('active');
  document.getElementById('chat-page').classList.add('active');
  document.getElementById('user-greeting').innerText = `Estudiante: ${nombreEstudiante} | Matrícula: ${matriculaEstudiante}`;
  
  // Limpiar chat anterior si existiera
  document.getElementById('chat-messages').innerHTML = '';
  document.getElementById('quick-replies').innerHTML = '';
  historialChat = [];

  setTimeout(() => {
    const bienvenida = `¡Hola, ${nombreEstudiante}! 👋 Qué valiente eres por entrar aquí hoy. La universidad y la vida personal pueden ser abrumadoras, y a veces sentimos que tenemos que poder con todo solos, pero no es así. 🌿\n\nEste es un espacio seguro y confidencial. ¿Qué te tiene intranquilo/a hoy? Escribe todo lo que necesites desahogar. 🫂`;
    appendMessage(bienvenida, 'bot');
  }, 600);
}

// Abortar y regresar al inicio
function cerrarApp() {
  const confirmar = confirm("¿Estás seguro de que deseas salir de la aplicación? Tu progreso no se guardará.");
  if (confirmar) {
    document.getElementById('chat-page').classList.remove('active');
    document.getElementById('login-page').classList.add('active');
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
  }
}

// ─── LÓGICA DE LA SESIÓN CON EL PSICÓLOGO ───
function terminarSesion() {
  const msj = `Qué bueno que te desahogaste, ${nombreEstudiante}. Has dado un paso muy importante al hablar de lo que sientes. 🌟\n\nSin embargo, recuerda que soy un asistente virtual. Tal vez sería mucho mejor continuar esta conversación a profundidad en una sesión con un profesional.\n\n¿Quieres que te agende una cita con la psicóloga de la universidad? 👩‍⚕️📅`;
  appendMessage(msj, 'bot');
}

function abrirRespiracion() {
  const msjRespiracion = `Tómate un momento, ${nombreEstudiante}. Cierra los ojos si puedes. 🌬️\n\n1. Inhala profundamente por la nariz contando hasta 4.\n2. Sostén el aire contando hasta 7.\n3. Exhala lentamente por la boca contando hasta 8.\n\nRepite esto 4 veces. Yo estoy aquí esperándote. ⏳ Cuando te sientas un poco más tranquilo/a, dime cómo te sientes.`;
  appendMessage(msjRespiracion, 'bot');
}

// ─── DICCIONARIO UNIVERSITARIO PROFUNDO ───
const RESPUESTAS_IA = [
  // Contexto: Familia (Papás, hermanos, exigencia)
  { 
    keys: ['papá', 'padre', 'mamá', 'madre', 'padres', 'papás', 'familia', 'casa', 'hermano', 'hermana', 'hogar'], 
    reply: `La familia puede ser nuestra mayor red de apoyo, pero también una gran fuente de estrés. 🏠💔 A veces sentimos que nuestros papás o familiares no valoran nuestro esfuerzo, que sus expectativas nos asfixian o que simplemente no nos comprenden en esta etapa universitaria.\n\n¿Sientes que te exigen demasiado o que hay un problema de comunicación en casa? No estás solo/a en esto, te escucho sin juzgar. 🫂` 
  },

  // Contexto: Estrés, Tesis, Exámenes, Sobrecarga
  { 
    keys: ['examen', 'tesis', 'proyecto', 'estres', 'estrés', 'calificaciones', 'reprobe', 'reprobé', 'materias', 'uni', 'carrera', 'sobrecarga', 'tarea'], 
    reply: `Sé que la vida académica puede sentirse como una olla de presión, especialmente cuando se juntan las entregas y los exámenes. 📚🤯 A veces creemos que nuestro valor depende de un número o de cuánto producimos, pero tu salud mental es mucho más importante que cualquier calificación. Es completamente válido sentir que no puedes con todo a la vez. 🌿\n\n¿Qué es lo que más te agobia de todo esto hoy?` 
  },

  // Contexto: Problemas con Profesores o Compañeros
  { 
    keys: ['profesor', 'maestro', 'equipo', 'compañeros', 'injusto', 'ambiente', 'clase'], 
    reply: `Las dinámicas en las aulas pueden ser muy frustrantes. 👨‍🏫 Lidiar con un profesor difícil o compañeros que no aportan genera un desgaste mental brutal, porque te sientes atrapado. 😤 Entiendo tu enojo y tu impotencia, tienes derecho a sentirte así.\n\n¿Qué fue lo que detonó esto hoy? 🌧️` 
  },

  // Contexto: Ser Foráneo / Soledad
  { 
    keys: ['solo', 'sola', 'foraneo', 'foránea', 'lejos', 'extraño', 'soledad', 'amigos', 'encajar', 'nadie'], 
    reply: `La universidad puede ser un lugar lleno de gente, pero a la vez increíblemente solitario. Estar lejos de casa o sentir que no encajas es un peso inmenso. 🧳 Llorar por sentirte solo no te hace débil, te hace humano. 🌧️\n\n¿Qué es lo que más extrañas o lo que más te pesa cargar a solas hoy? 🫂` 
  },

  // Contexto: Futuro / Crisis Vocacional / Presión Financiera
  { 
    keys: ['futuro', 'equivocado', 'dinero', 'trabajo', 'practicas', 'titulacion', 'pagar', 'deudas'], 
    reply: `Pensar en el futuro asusta. 🧭 La presión de no equivocarte de carrera, o la angustia del dinero, es demasiado para una sola persona. 💸 Date el permiso de no tener todas las respuestas hoy. Vamos un día a la vez. 🌅\n\n¿Qué es lo que más miedo te da del futuro cercano?` 
  },

  // ─── RESPUESTAS PARA LA CITA PSICOLÓGICA ───
  // Sí / Aceptar cita
  { 
    keys: ['si, agendar', 'sí quiero', 'agendar', 'quiero la cita', 'si por favor', 'sí por favor'], 
    reply: `Entendido. ✅ He registrado tu solicitud con tu matrícula ${matriculaEstudiante}. El departamento de Psicología de la universidad se pondrá en contacto contigo a tu correo institucional en las próximas 24 horas para asignarte un horario. 📩\n\nRecuerda que dar este paso es un gran acto de valentía. Estoy muy orgulloso/a de ti. 🌟` 
  },
  
  // No / Rechazar cita
  { 
    keys: ['no, gracias', 'despues', 'luego', 'ahora no'], 
    reply: `Lo entiendo perfectamente, no hay ninguna prisa. Respeto tus tiempos. 🕰️ Mientras tanto, puedes seguir escribiendo aquí todo lo que necesites sacar de tu mente. ¿Hay algo más de lo que te gustaría desahogarte hoy? 💭` 
  }
];

const RESPUESTA_DEFAULT = "Te leo con mucha atención. 🌿 A veces, simplemente estructurar nuestros pensamientos y ponerlos en palabras nos quita un peso de encima. Sigue contándome, ¿qué más ha estado pasando por tu mente? 💭";

// ─── MOTOR DE CHAT ───
function getBotReply(texto) {
  const lower = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (let item of RESPUESTAS_IA) {
    if (item.keys.some(k => lower.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
      return item.reply;
    }
  }
  return RESPUESTA_DEFAULT;
}

function appendMessage(text, type) {
  const box = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `msg ${type}`;
  
  const formattedText = text.replace(/\n/g, '<br>');
  msgDiv.innerHTML = `<div class="bubble">${formattedText}</div>`;
  
  box.appendChild(msgDiv);
  box.scrollTop = box.scrollHeight;

  if (type === 'user' || type === 'bot') {
    historialChat.push({ role: type === 'user' ? 'user' : 'assistant', content: text });
  }

  // Si el bot pregunta por agendar, mostrar botones dinámicos
  if (text.includes("¿Quieres que te agende una cita con la psicóloga")) {
    document.getElementById('quick-replies').innerHTML = `
      <button class="tag" onclick="sendQuickReply('Sí, agendar')">✅ Sí, quiero agendar</button>
      <button class="tag" onclick="sendQuickReply('No, gracias')">❌ Por ahora no</button>
    `;
  }
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  
  if (!text) return;

  document.getElementById('quick-replies').innerHTML = ''; // Ocultar botones rápidos

  appendMessage(text, 'user');
  input.value = '';

  const inputButton = document.querySelector('.btn-send');
  inputButton.disabled = true;
  inputButton.textContent = '...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: historialChat })
    });
    if (!response.ok) throw new Error('La IA no respondió');
    const data = await response.json();
    appendMessage(data.reply, 'bot');
  } catch (error) {
    appendMessage(getBotReply(text), 'bot');
  } finally {
    inputButton.disabled = false;
    inputButton.textContent = '↑';
  }
}

function sendQuickReply(text) {
  document.getElementById('chat-input').value = text;
  sendMessage();
}