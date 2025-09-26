# Backend 25Watts – API de Cupones y Canjes

Este proyecto es un backend construido con `NestJS` y `Prisma` para gestionar cupones y su canje. Incluye validación, CORS y Swagger para documentación en tiempo de ejecución.

## Cómo levantar el servidor

- Requisitos: Node.js 18+ y npm
- Variables de entorno (opcionales):
  - `PORT`: puerto del servidor (por defecto `3000`).
  - `CORS_ORIGINS`: lista separada por comas de orígenes permitidos, por ejemplo: `http://localhost:5173,http://localhost:3000`.
  - `CORS_ORIGIN`: origen único permitido si no usas `CORS_ORIGINS` (por defecto `http://localhost:5173`).

Pasos:

```bash
npm install
# modo desarrollo (watch)
npm run start:dev

# modo producción (tras compilar)
npm run build
  npm run start:prod
  ```

  Una vez iniciado, el servidor escuchará en `http://localhost:<PORT>`.
 
 ## Configuración de base de datos (PostgreSQL + Prisma)

 - Requisitos: PostgreSQL 13+ instalado y accesible.
 - Crea una base de datos (por ejemplo, `coupons_db`).
 - Configura la variable de entorno `DATABASE_URL` en un archivo `.env` en la raíz del proyecto con el siguiente formato:
 
 ```env
 DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB?schema=public"
 ```
 
 Ejemplo local:
 
 ```env
 DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coupons_db?schema=public"
 ```
 
 Comandos útiles de Prisma:
 
 ```bash
 # Generar el cliente de Prisma (necesario después de cambiar el esquema)
 npx prisma generate
 
 # Aplicar migraciones a la base de datos (usa las migraciones existentes en prisma/migrations/)
 npx prisma migrate dev
 
 # (Opcional) Explorar la base con UI
 npx prisma studio
 ```
 
 Archivos relevantes:
 
 - `prisma/schema.prisma` → modelo de datos de Prisma.
 - `prisma/migrations/` → migraciones versionadas.
 
 Notas:
 
 - Asegúrate de que `DATABASE_URL` esté presente antes de levantar el servidor en entornos reales.
 - En producción, considera connection pooling (p. ej., pgBouncer) y parámetros SSL si tu proveedor lo requiere (p. ej., `sslmode=require`).

## Cómo funciona el servidor
- `PrismaService` (`src/prisma.service.ts`) administra la conexión a la base de datos usando `@prisma/client`.

> Nota: Asegúrate de configurar tu base de datos y el `DATABASE_URL` (si corresponde) para `Prisma`. Ejecuta migraciones según tu esquema antes de usar en producción.

## Rutas disponibles

- Raíz
  - `GET /` → respuesta de salud básica ("Hello World!").

- Cupones (`src/coupons/`)
  - `POST /coupons` → Crear cupón
    - Body (`CreateCouponDto`): `code` (string), `description` (string), `value` (number ≥ 0), `expirationDate` (ISO string), `status` (opcional: `active|inactive|redeemed|expired`).
  - `GET /coupons` → Listar cupones con filtros opcionales
    - Query: `status` (string), `minValue` (number), `maxValue` (number), `expiresBefore` (ISO string).
  - `GET /coupons/:id` → Obtener un cupón por id (numérico).
  - `PUT /coupons/:id` → Actualizar cupón
    - Body (`UpdateCouponDto`): campos parciales; `expirationDate` se convierte a `Date` si viene como string.
  - `DELETE /coupons/:id` → “Soft delete”: cambia `status` a `inactive`.

- Canjes (`src/redemptions/`)
  - `POST /redeem` → Canjear un cupón
    - Body (`RedeemCouponDto`): `code` (string), `user` (string opcional).
    - Reglas de negocio: el cupón debe existir, estar `active`, no estar `redeemed` y no estar expirado. Usa una transacción para crear el canje y marcar el cupón como `redeemed`.
  - `GET /redemptions` → Listar canjes.
  - `GET /redemptions/:id` → Detalle de un canje por id.

## Documentación en tiempo de ejecución (Swagger)

Con el servidor corriendo, abre:

- `http://localhost:<PORT>/api` → Swagger UI para explorar y probar los endpoints.

## Tests

```bash
# unit tests
npm test

# cobertura
npm run test:cov

# e2e tests
npm run test:e2e
```

## Estructura relevante

- `src/app.module.ts` – módulo raíz.
- `src/main.ts` – bootstrap del servidor, CORS, validación y Swagger.
- `src/coupons/` – controlador, servicio y DTOs de cupones.
- `src/redemptions/` – controlador, servicio y DTOs de canjes.
- `src/prisma.service.ts` – cliente de Prisma y ciclo de vida.

## Notas finales

- Cualquier ajuste de CORS se hace en `src/main.ts` y por variables de entorno.
- Para producción, recuerda configurar logs, variables de entorno seguras y la base de datos de `Prisma` correctamente.
