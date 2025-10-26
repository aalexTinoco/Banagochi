# ✅ Checklist de Verificación - Sistema de Login

## Pre-requisitos

- [ ] Servidor de usuarios corriendo en `http://localhost:4000`
- [ ] Servidor operacional corriendo en `http://localhost:4001`
- [ ] Archivo `.env` creado (copiar de `.env.example`)
- [ ] Dependencias instaladas (`npm install` o `yarn install`)

## Pruebas de Funcionalidad

### 1. DeviceId Hook
```bash
# Verificar que se genera correctamente
- [ ] DeviceId se genera al abrir la app
- [ ] DeviceId se persiste entre recargas
- [ ] DeviceName tiene formato correcto
- [ ] resetDeviceId() funciona correctamente
```

### 2. Login Normal (Dispositivo Conocido)

**Pasos:**
1. [ ] Abrir app en navegador/simulador
2. [ ] Ir a pantalla de login
3. [ ] Ingresar email: `dierez00@gmail.com`
4. [ ] Ingresar contraseña válida
5. [ ] Click en "Entrar"

**Resultado esperado:**
- [ ] Loading spinner aparece
- [ ] Request se envía a `/api/auth/login`
- [ ] Response incluye `isNewDevice: false`
- [ ] Alert muestra: "¡Bienvenido Diego!"
- [ ] Redirección a `/home`
- [ ] Token guardado en HttpClient

**Verificar en DevTools:**
```javascript
// Network tab
Request URL: http://localhost:4000/api/auth/login
Method: POST
Body: {
  email: "dierez00@gmail.com",
  password: "...",
  deviceId: "web-1761458187-abc123",
  deviceName: "Web Browser"
}

// Response
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "isNewDevice": false,
  "user": {...}
}
```

### 3. Login con Dispositivo Nuevo

**Pasos:**
1. [ ] Reset deviceId (usar función de testing)
2. [ ] Ir a pantalla de login
3. [ ] Ingresar email: `dierez00@gmail.com`
4. [ ] Ingresar contraseña válida
5. [ ] Click en "Entrar"

**Resultado esperado:**
- [ ] Loading spinner aparece
- [ ] Request se envía a `/api/auth/login`
- [ ] Response incluye `isNewDevice: true`
- [ ] Modal de verificación biométrica se abre
- [ ] Credenciales quedan guardadas en `pendingCredentials`

**Verificar en DevTools:**
```javascript
// Response
{
  "message": "Dispositivo nuevo detectado...",
  "isNewDevice": true,
  "requiresBiometric": true
}
```

### 4. Verificación Biométrica

**Pasos:**
1. [ ] Modal de verificación está abierto
2. [ ] Click en "Capturar selfie"
3. [ ] Seleccionar opción (cámara o galería)
4. [ ] Capturar/seleccionar imagen de rostro
5. [ ] Preview de selfie aparece
6. [ ] Click en "Capturar INE"
7. [ ] Capturar/seleccionar imagen de INE
8. [ ] Preview de INE aparece
9. [ ] Click en "Verificar identidad"

**Resultado esperado:**
- [ ] Loading spinner en botón
- [ ] Request FormData se envía
- [ ] Response incluye token
- [ ] Modal se cierra
- [ ] Alert: "Verificación exitosa! Tu dispositivo ha sido registrado"
- [ ] Redirección a `/home`

**Verificar en DevTools:**
```javascript
// Network tab
Request URL: http://localhost:4000/api/auth/login
Method: POST
Content-Type: multipart/form-data
Body (FormData):
  - email: "dierez00@gmail.com"
  - password: "..."
  - deviceId: "web-1761458200-xyz789"
  - deviceName: "Web Browser"
  - selfie: File
  - ine: File

// Response
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "isNewDevice": false,
  "user": {...}
}
```

### 5. Manejo de Errores

#### Error 401 - Credenciales Incorrectas
- [ ] Ingresar email correcto
- [ ] Ingresar contraseña incorrecta
- [ ] Click en "Entrar"
- [ ] Error message: "Email o contraseña incorrectos"

#### Error 404 - Usuario No Encontrado
- [ ] Ingresar email no registrado
- [ ] Click en "Entrar"
- [ ] Error message: "Usuario no encontrado"

#### Error de Red
- [ ] Detener servidor
- [ ] Intentar login
- [ ] Error message: "Error de conexión. Verifica tu internet"

#### Error de Verificación Biométrica
- [ ] Abrir modal de verificación
- [ ] Capturar imágenes que no coincidan
- [ ] Click en "Verificar identidad"
- [ ] Alert: "Verificación biométrica fallida"
- [ ] Modal permanece abierto

### 6. Validaciones de Formulario

- [ ] Botón deshabilitado cuando email está vacío
- [ ] Botón deshabilitado cuando password está vacío
- [ ] Botón deshabilitado cuando deviceId está cargando
- [ ] Error message cuando se intenta submit con campos vacíos
- [ ] Inputs deshabilitados durante loading

### 7. Modal de Verificación Biométrica

- [ ] Modal se abre con animación slide
- [ ] Botón "Cancelar" cierra el modal
- [ ] Info box muestra mensaje correcto
- [ ] Sección de selfie funciona
- [ ] Sección de INE funciona
- [ ] Botón "Verificar" deshabilitado sin imágenes
- [ ] Preview de imágenes funciona
- [ ] Botón "Cambiar foto" funciona
- [ ] Permisos de cámara se solicitan
- [ ] Permisos de galería se solicitan

### 8. Navegación

- [ ] Botón "Atrás" en header funciona
- [ ] Link "Registrar" navega a `/auth/register`
- [ ] Login exitoso redirige a `/home`
- [ ] Botón "Cancelar" en modal no redirige

## Pruebas de Integración

### API Service
```typescript
// Verificar que el token se guarda
import { AuthService } from '@/services/api';

const response = await AuthService.login({...});
const token = AuthService.getToken();
console.log(token); // Debe mostrar el token
```

### HttpClient
```typescript
// Verificar que las peticiones incluyen el token
import { HttpClient } from '@/services/api';

// Después de login, cualquier petición debe incluir:
// Header: Authorization: Bearer {token}
```

### DeviceId
```typescript
import { getDeviceId, getStoredDeviceName } from '@/hooks/use-device-id';

const deviceId = await getDeviceId();
const deviceName = await getStoredDeviceName();

console.log({ deviceId, deviceName });
```

## Console Logs a Verificar

Durante login normal:
```
deviceId: web-1761458187-abc123
deviceName: Web Browser
Login attempt with device: web-1761458187-abc123
Login successful
```

Durante login con nuevo dispositivo:
```
deviceId: web-1761458200-xyz789
deviceName: Web Browser
Login attempt with device: web-1761458200-xyz789
New device detected, biometric verification required
Modal opened for biometric verification
```

Durante verificación biométrica:
```
Selfie captured: blob:http://...
INE captured: blob:http://...
Submitting biometric verification
Biometric verification successful
Device registered
```

## Errores Comunes y Soluciones

### "Cannot find module '@/services/api'"
```bash
# Verificar que los archivos existen
ls services/api.ts
ls services/modules/
ls services/types/
```

### "Device ID is null"
```typescript
// Verificar que el hook está inicializado
const { deviceId, loading } = useDeviceId();
if (loading) return <Loading />;
```

### "FormData is not defined"
```typescript
// En web, FormData está disponible globalmente
// En mobile, asegurarse de tener react-native-fetch
```

### "Image picker permissions denied"
```typescript
// Verificar en app.json:
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Necesitamos acceso a tu galería"
        }
      ]
    ]
  }
}
```

## Estado Final

Después de todas las pruebas:
- [ ] Login normal funciona
- [ ] Login con nuevo dispositivo funciona
- [ ] Verificación biométrica funciona
- [ ] Todos los errores se manejan correctamente
- [ ] Navegación funciona correctamente
- [ ] Token se guarda correctamente
- [ ] DeviceId persiste correctamente
- [ ] UI responsive y sin bugs

---

**Nota**: Si alguna prueba falla, revisar los logs de consola y la respuesta del servidor para identificar el problema.
