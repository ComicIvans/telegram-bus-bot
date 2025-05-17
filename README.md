# 🚍 Bot Autobús Granada

Bot de Telegram que permite consultar la información de próximas salidas de autobuses urbanos de Granada y configurar notificaciones personalizadas según parada, línea, días y franjas horarias.

**AVISO:** Este proyecto sólo hace uso de datos públicos. El autor no se responsabiliza de cambios en la web fuente ni de usos indebidos de la información.

## Funcionalidades

- Consulta directa de horarios por número de parada.
- Suscripciones personalizadas para franjas horarias y días específicos.
- Acceso restringido a usuarios autorizados.

## Uso

1. Clona este repositorio.
2. Crea un archivo `.env` con el siguiente contenido:

```env
TG_TOKEN=tu_token_de_telegram
LOG_LEVEL=info
URL=url_a_la_web_de_consulta_de_paradas
```

3. Instala las dependencias:

```bash
bun install
```

4. Ejecuta el bot en modo desarrollo:

```bash
bun run dev
```
