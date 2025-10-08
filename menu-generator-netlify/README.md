# Generador de Menú Semanal (Netlify Function) · para Lovable

Esta función serverless recibe tu despensa y devuelve un **menú semanal** en formato JSON usando tu **OpenAI API Key**.

## 1) Estructura

```
menu-generator-netlify/
├─ netlify.toml
├─ package.json
└─ netlify/
   └─ functions/
      └─ generarMenu.js
```

## 2) Despliegue rápido

1. **Sube esta carpeta a GitHub** (nuevo repositorio).
2. En **Netlify** → *Add new site from Git* → conecta tu repo.
3. En **Site settings → Environment variables** añade:
   - `OPENAI_API_KEY = <tu clave de OpenAI>`
4. Publica. Obtendrás un endpoint como:
   `https://TU-SITIO.netlify.app/.netlify/functions/generarMenu`

## 3) Probar con `curl`

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"alimentos":"Garbanzos, pasta, huevos, patatas, avena, plátanos", "restricciones":"ninguna"}' \
  https://TU-SITIO.netlify.app/.netlify/functions/generarMenu
```

Deberías recibir algo como:

```json
{
  "ok": true,
  "menu": [
    { "dia": "Lunes", "desayuno": "...", "comida": "...", "cena": "..." },
    ...
  ]
}
```

## 4) Conectar desde **Lovable**

- Añade un **botón** “Generar menú” en tu pantalla **Menú Semanal**.
- Acción: **Webhook / POST**.
- URL: `https://TU-SITIO.netlify.app/.netlify/functions/generarMenu`
- **Payload** (ajusta a tus variables en Lovable):

```json
{
  "alimentos": "{{ lista_despensa_como_texto }}",
  "restricciones": "{{ data.Preferences.restricciones || 'ninguna' }}"
}
```

- Muestra la respuesta en un **viewer** o **guárdala** en tu tabla `Meal_Plan`.
  - Si Lovable permite **transformar** la respuesta, parsea `menu` y crea/actualiza 7×3 filas (D-L, desayuno/comida/cena).

## 5) Modelos y coste

- El ejemplo usa `gpt-4o-mini` (barato y suficiente). Puedes cambiar el modelo si quieres.
- Como la llamada sale de tu Netlify hacia OpenAI con tu API key, **no gastas créditos de Lovable**.

## 6) Errores comunes

- `OPENAI_API_KEY not set` → falta la variable en Netlify.
- 405 Method Not Allowed → hiciste GET en lugar de POST.
- JSON inválido → el modelo devolvió texto con markdown; el código intenta extraer el bloque `[ ... ]` automáticamente.