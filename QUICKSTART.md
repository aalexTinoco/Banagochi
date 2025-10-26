# 🎯 Quick Start - Sistema de Login

## Para empezar en 5 minutos

### 1. Configuración (1 min)

```bash
# Crear archivo .env
cp .env.example .env

# Editar .env con tus URLs
EXPO_PUBLIC_USERS_API_URL=http://localhost:4000
EXPO_PUBLIC_OPERATIONAL_API_URL=http://localhost:4001
```

### 2. Probar Login Normal (2 min)

```typescript
// 1. Abrir app
npm start

// 2. Navegar a /login

// 3. Ingresar credenciales
Email: dierez00@gmail.com
Password: [tu contraseña]

// 4. Click en "Entrar"

// ✅ Deberías ver: "¡Bienvenido Diego!"
// ✅ Redirección a /home
```

### 3. Probar Dispositivo Nuevo (2 min)

```javascript
// 1. En consola del navegador (F12):
localStorage.removeItem('banagochi_device_id');
localStorage.removeItem('banagochi_device_name');
location.reload();

// 2. Login con las mismas credenciales

// ✅ Deberías ver: Modal de verificación biométrica
// ✅ Captura selfie e INE
// ✅ Verificación exitosa
```

## Estructura de Archivos

```
✅ app/(auth)/login.tsx              - Pantalla de login
✅ hooks/use-device-id.ts            - Hook de deviceId
✅ components/biometric-verification-modal.tsx - Modal
✅ services/api.ts                   - Cliente API
✅ services/modules/auth.service.ts  - Servicio auth
```

## API Endpoints Usados

```typescript
POST /api/auth/login
// Body normal:
{
  email: string,
  password: string,
  deviceId: string,
  deviceName: string
}

// Body con biometría (FormData):
{
  email: string,
  password: string,
  deviceId: string,
  deviceName: string,
  selfie: File,
  ine: File
}
```

## Respuestas del Servidor

### Login Exitoso
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "isNewDevice": false,
  "user": {
    "id": "123",
    "name": "Diego",
    "email": "diego@email.com"
  }
}
```

### Dispositivo Nuevo
```json
{
  "message": "Dispositivo nuevo detectado...",
  "isNewDevice": true,
  "requiresBiometric": true
}
```

## Estados del Flujo

```
1. INITIAL
   ↓ (usuario escribe)
2. TYPING
   ↓ (click entrar)
3. LOADING
   ↓ (response recibida)
4a. SUCCESS → /home
   O
4b. NEW_DEVICE → Modal
   ↓ (captura imágenes)
5. BIOMETRIC_VERIFICATION
   ↓ (verificación exitosa)
6. SUCCESS → /home
```

## Troubleshooting Rápido

### "Error de conexión"
- ✅ Verificar que los servidores estén corriendo
- ✅ Verificar URLs en .env

### "Device ID is null"
- ✅ Esperar a que `deviceLoading` sea `false`
- ✅ Verificar consola por errores

### "Modal no se abre"
- ✅ Verificar respuesta del servidor incluye `isNewDevice: true`
- ✅ Verificar console.log en submit()

### "Verificación biométrica falla"
- ✅ Verificar que selfie e INE sean del mismo usuario
- ✅ Verificar formato de imágenes (JPEG)
- ✅ Verificar logs del servidor

## Comandos Útiles

```bash
# Resetear deviceId
localStorage.removeItem('banagochi_device_id');
localStorage.removeItem('banagochi_device_name');

# Ver deviceId actual
localStorage.getItem('banagochi_device_id');

# Ver todos los datos guardados
Object.keys(localStorage);

# Limpiar todo localStorage
localStorage.clear();
```

## Próximos Pasos

1. ✅ Probar flujo completo
2. ✅ Ver documentación detallada en:
   - `LOGIN_README.md` - Flujo completo
   - `API_DOCUMENTATION.md` - Servicios API
   - `TESTING_CHECKLIST.md` - Testing
   - `TESTING_EXAMPLES.md` - Ejemplos

3. ✅ Implementar mejoras opcionales:
   - AsyncStorage para mobile
   - Face ID / Touch ID
   - Logs de auditoría

---

**¿Todo funciona?** → Continúa con el registro y otras funcionalidades
**¿Problemas?** → Revisa TESTING_CHECKLIST.md y logs
