# Bot de Citas WhatsApp 🤖💈

Bot automatizado para gestión de citas usando WhatsApp, Gemini AI y Google Calendar.

## Características

- ✅ Agendamiento automático de citas
- 🤖 Análisis de mensajes con Gemini AI
- 📅 Integración con Google Calendar
- ⚡ Verificación de disponibilidad en tiempo real
- 💬 Interfaz conversacional natural

## Configuración Requerida

### 1. Gemini AI
- Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Google Calendar API
- Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
- Habilita Google Calendar API
- Crea una Service Account y descarga las credenciales

### 3. Variables de Entorno
Copia `.env.example` a `.env` y configura:

```env
GEMINI_API_KEY=tu_api_key
GOOGLE_CALENDAR_ID=tu_calendario@gmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."