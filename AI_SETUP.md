# 🤖 Configuración de IA - FOCA

## 🆓 OPCIÓN RECOMENDADA: Groq (GRATIS Y ULTRA RÁPIDO)

### ¿Por qué Groq?
- ✅ **100% GRATIS** - 14,400 requests por día
- ⚡ **ULTRA RÁPIDO** - El más rápido del mercado (tokens/segundo)
- 🧠 **Modelos potentes** - Llama 3.1 70B (mejor que GPT-3.5)
- 💾 **Memoria contextual** - Recuerda conversaciones anteriores
- 🌍 **Multiidioma** - Soporte para todos los idiomas

### Cómo obtener tu API Key de Groq (2 minutos):

1. Ve a https://console.groq.com
2. Crea una cuenta gratis (con Google o email)
3. Ve a "API Keys" en el menú
4. Click en "Create API Key"
5. Copia la key (empieza con `gsk_...`)

### Configuración:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega estas líneas:

```env
AI_PROVIDER=groq
GROQ_API_KEY=tu_key_aqui_gsk_xxxxx
```

3. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

¡Listo! Ahora tienes una IA más inteligente y GRATIS 🎉

---

## 💰 OPCIÓN ALTERNATIVA: OpenAI (DE PAGO)

Si prefieres usar OpenAI (GPT-4):

1. Ve a https://platform.openai.com/api-keys
2. Crea una API key
3. Configura en `.env.local`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx
```

**Nota:** OpenAI es de pago ($0.01 por 1000 tokens aprox.)

---

## 🆚 COMPARACIÓN

| Característica | Groq (Gratis) | OpenAI (Pago) |
|---------------|---------------|---------------|
| **Precio** | 100% Gratis | ~$0.01/1000 tokens |
| **Velocidad** | ⚡⚡⚡⚡⚡ Ultra rápido | ⚡⚡⚡ Rápido |
| **Calidad** | 🧠🧠🧠🧠 Excelente | 🧠🧠🧠🧠🧠 Mejor |
| **Límite** | 14,400 req/día | Sin límite (pagando) |
| **Modelo** | Llama 3.1 70B | GPT-4 Turbo |

---

## 🎯 NUEVAS CARACTERÍSTICAS

### Memoria Contextual
La IA ahora RECUERDA lo que dijiste antes:

```
Usuario: "Me gusta programar"
IA: "¡Genial! ¿Qué lenguajes usas?"
Usuario: "Python y JavaScript"
IA: "Nice! ¿Cuánto tiempo llevas con Python?"
Usuario: "¿Qué lenguajes uso?"
IA: "Me dijiste hace un momento que usas Python y JavaScript. ¿Todo bien?"
```

### Detección de Repeticiones
Si preguntas lo mismo dos veces, la IA lo nota:

```
Usuario: "¿Cómo te llamas?"
IA: "Soy Maya"
Usuario: "¿Cómo te llamas?"
IA: "Me preguntaste eso hace un momento, soy Maya. ¿Está todo bien?"
```

### Conversaciones Más Naturales
- Respuestas más cortas (1-2 frases)
- Lenguaje casual y espontáneo
- Manejo inteligente de interrupciones
- Correcciones implícitas (no te dice "error")

---

## 🔧 TROUBLESHOOTING

### Error: "Failed to process chat request"
- Verifica que tu API key sea correcta
- Asegúrate de tener `AI_PROVIDER=groq` o `AI_PROVIDER=openai`
- Reinicia el servidor (`npm run dev`)

### La IA no responde
- Revisa la consola del navegador (F12)
- Verifica que `.env.local` esté en la raíz del proyecto
- Comprueba que la API key no tenga espacios extras

### Respuestas muy lentas
- Con Groq debería ser instantáneo
- Con OpenAI puede tardar 1-2 segundos
- Verifica tu conexión a internet

---

## 📊 MODELOS DISPONIBLES

### Groq (configurado por defecto):
- `llama-3.1-70b-versatile` - Conversaciones generales ✅ (actual)
- `llama-3.1-8b-instant` - Más rápido, menor calidad
- `mixtral-8x7b-32768` - Bueno para contextos largos

### OpenAI:
- `gpt-4-turbo-preview` - Mejor calidad ✅ (actual)
- `gpt-3.5-turbo` - Más barato, menor calidad

Para cambiar el modelo, edita `src/app/api/chat/route.ts`

---

## 🚀 PRÓXIMAS MEJORAS

- [ ] Soporte para Google Gemini (también gratis)
- [ ] Modo offline con Ollama (local)
- [ ] Persistencia de conversaciones
- [ ] Exportar historial de práctica
- [ ] Análisis de progreso

---

## ❓ PREGUNTAS FRECUENTES

**¿Es seguro usar mi API key?**
Sí, la key solo se usa en tu servidor (Next.js API routes), nunca se expone al navegador.

**¿Cuánto cuesta Groq?**
¡Es completamente gratis! 14,400 requests diarios es MÁS que suficiente.

**¿Puedo cambiar de Groq a OpenAI después?**
Sí, solo cambia `AI_PROVIDER=openai` en `.env.local`

**¿Funciona sin internet?**
No, pero puedes usar Ollama (local) en el futuro.

---

¿Necesitas ayuda? Abre un issue en GitHub o contáctame.
