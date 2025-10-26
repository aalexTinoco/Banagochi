# Changelog - Actualización de API Service

## Fecha: 25 de Octubre de 2025

### 🔄 Cambios Realizados

#### 1. **Corrección de Campos Biométricos**
- ✅ Cambiado `faceImage` → `selfie` en `LoginRequest` y `RegisterRequest`
- ✅ Cambiado `voiceAudio` → `ine` en `LoginRequest` y `RegisterRequest`
- ✅ Actualizado `api.ts` para usar los nuevos nombres de campos

**Razón:** Los endpoints del backend esperan `selfie` e `ine` según la colección de Postman.

#### 2. **Nuevo Campo en IUser**
- ✅ Agregado campo `domicilio?: string` en la interfaz `IUser`
- ✅ Agregado en `RegisterRequest` y `UpdateUserRequest`

**Razón:** El formulario de registro en Postman incluye el campo `domicilio`.

#### 3. **Módulo de Tarjetas de Crédito (NUEVO)**

##### Interfaces Creadas:
```typescript
- CardType = 'banortemujer' | 'banorteclasica' | 'banorteoro'
- CardStatus = 'active' | 'inactive' | 'blocked'
- ICreditCard
- CreateCreditCardRequest
- UpdateCreditCardRequest
- CreditCardResponse
```

##### Endpoints Agregados en config.ts:
```typescript
CARDS: {
  CREATE: '/api/cards',
  GET_USER_CARDS: '/api/cards/user/:userId',
  GET_BY_ID: '/api/cards/:cardId',
  UPDATE: '/api/cards/:cardId',
  DELETE: '/api/cards/:cardId',
}
```

##### Métodos Agregados en api.ts:
- `createCreditCard(data: CreateCreditCardRequest)`
- `getUserCreditCards(userId: string)`
- `getCreditCardById(cardId: string)`
- `updateCreditCard(cardId: string, data: UpdateCreditCardRequest)`
- `deleteCreditCard(cardId: string)`

#### 4. **Documentación Actualizada (README.md)**

##### Secciones Añadidas:
- **Tarjetas de Crédito** con ejemplos completos:
  - Crear tarjeta (Banorte Mujer, Clásica, Oro)
  - Obtener tarjetas del usuario
  - Actualizar tarjeta
  - Eliminar tarjeta

##### Ejemplos Actualizados:
- Registro de usuario ahora incluye `domicilio`
- Update de usuario incluye `domicilio`
- TypeScript imports incluyen `ICreditCard` y `CardType`

---

## 📊 Resumen de Archivos Modificados

### 1. `types.ts`
- ✅ IUser: Agregado campo `domicilio`
- ✅ RegisterRequest: Agregado `domicilio`, cambiado a `selfie` e `ine`
- ✅ LoginRequest: Cambiado a `selfie` e `ine`
- ✅ UpdateUserRequest: Agregado `domicilio`
- ✅ Nuevas interfaces para Credit Cards
- ✅ Nueva interfaz `CreditCardResponse`

### 2. `config.ts`
- ✅ Agregada sección `CARDS` con 5 endpoints

### 3. `api.ts`
- ✅ Importadas nuevas interfaces de tarjetas
- ✅ Corregidos campos biométricos en `register()` y `login()`
- ✅ Agregadas 5 nuevas funciones para tarjetas de crédito
- ✅ Headers corregidos para incluir Content-Type en requests JSON

### 4. `README.md`
- ✅ Nueva sección "Tarjetas de Crédito" con 4 ejemplos
- ✅ Actualizados ejemplos de registro y actualización de usuario
- ✅ Actualizados imports de TypeScript

---

## ✅ Validación

### Errores de TypeScript: **0**
- Todos los archivos compilan sin errores
- Las interfaces están correctamente definidas
- Los tipos coinciden en toda la aplicación

### Cobertura de Endpoints
| Servicio | Endpoints | Status |
|----------|-----------|--------|
| Auth | 7 | ✅ |
| Users | 9 | ✅ |
| Menu | 3 | ✅ |
| **Cards** | **5** | ✅ **NUEVO** |
| Projects | 12 | ✅ |
| Asides | 8 | ✅ |
| Transactions | 5 | ✅ |
| **TOTAL** | **49** | ✅ |

---

## 🎯 Próximos Pasos Recomendados

1. **Testing**: Probar los nuevos endpoints de tarjetas con el backend
2. **Validación**: Verificar que los campos `selfie` e `ine` funcionan correctamente
3. **UI/UX**: Crear componentes de formulario para tarjetas de crédito
4. **Seguridad**: Implementar validación de número de tarjeta (Luhn algorithm)
5. **Enmascaramiento**: Mostrar solo últimos 4 dígitos de tarjeta en la UI

---

## 📝 Notas Técnicas

### Tipos de Tarjetas Banorte:
- **banortemujer**: Tarjeta Banorte Mujer
- **banorteclasica**: Tarjeta Banorte Clásica  
- **banorteoro**: Tarjeta Banorte Oro

### Campos Biométricos:
- **selfie**: Imagen del rostro del usuario
- **ine**: Foto del INE (Identificación Nacional Electoral)

### Base URL:
- Servicio de Tarjetas usa el mismo servicio que Auth/Users
- Puerto: 4000 (según colección Postman)
- Configurado en: `API_CONFIG.USERS_SERVICE`
