# Login con Verificación Biométrica

## 🔐 Flujo de Autenticación

### 1. Login Normal (Dispositivo Conocido)

Cuando el usuario hace login desde un dispositivo ya registrado:

```typescript
// El flujo automático:
1. Usuario ingresa email y contraseña
2. Se genera/obtiene el deviceId del localStorage
3. Se envía petición de login con deviceId
4. Si el dispositivo está registrado → Login exitoso
5. Token se guarda automáticamente
6. Redirección a /home
```

**Respuesta del servidor (dispositivo conocido):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isNewDevice": false,
  "user": {
    "id": "68fdb6c3da6baba3f8a002b2",
    "name": "Diego Antunez Ramirez",
    "email": "dierez00@gmail.com",
    "role": [{"type": "user"}]
  }
}
```

### 2. Login con Dispositivo Nuevo

Cuando el usuario hace login desde un nuevo dispositivo:

```typescript
// El flujo automático:
1. Usuario ingresa email y contraseña
2. Se genera un nuevo deviceId
3. Se envía petición de login
4. Servidor detecta dispositivo nuevo
5. Se abre modal de verificación biométrica
6. Usuario captura selfie e INE
7. Se reenvía login con verificación biométrica
8. Si la verificación es exitosa → Dispositivo registrado
9. Token se guarda automáticamente
10. Redirección a /home
```

**Respuesta del servidor (dispositivo nuevo):**
```json
{
  "message": "Dispositivo nuevo detectado. Se requiere verificación biométrica (selfie e INE)",
  "isNewDevice": true,
  "requiresBiometric": true
}
```

## 📱 Componentes Creados

### 1. `use-device-id.ts` Hook
Maneja la generación y persistencia del deviceId:

```typescript
import { useDeviceId } from '@/hooks/use-device-id';

const { deviceId, deviceName, loading, resetDeviceId } = useDeviceId();

// deviceId: ID único del dispositivo
// deviceName: Nombre descriptivo del dispositivo
// loading: Estado de carga
// resetDeviceId: Función para resetear el ID (testing)
```

**Almacenamiento:**
- Web: `localStorage`
- Mobile: In-memory (se puede mejorar con AsyncStorage)

**Formato del deviceId:**
```
ios-1761458187-abc123def456
android-1761458187-xyz789ghi012
```

### 2. `biometric-verification-modal.tsx` Componente
Modal para captura de selfie e INE:

```typescript
<BiometricVerificationModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={async (selfie, ine) => {
    // Lógica de verificación
  }}
  isLoading={false}
/>
```

**Características:**
- ✅ Captura desde cámara o galería
- ✅ Preview de imágenes
- ✅ Validación de campos
- ✅ Estados de carga
- ✅ Manejo de permisos

### 3. `login.tsx` Actualizado
Pantalla de login con flujo completo:

**Estados:**
```typescript
// Form
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);

// Biometric
const [showBiometricModal, setShowBiometricModal] = useState(false);
const [pendingCredentials, setPendingCredentials] = useState(null);

// Device
const { deviceId, deviceName, loading: deviceLoading } = useDeviceId();
```

## 🔄 Flujos de Uso

### Caso 1: Login Exitoso (Dispositivo Conocido)

```typescript
// Usuario: dierez00@gmail.com
// Dispositivo: ios-1761458187-abc123

1. Ingresa credenciales
2. Click en "Entrar"
3. ✅ Login exitoso
4. Alert: "¡Bienvenido Diego!"
5. Redirección a /home
```

### Caso 2: Login con Nuevo Dispositivo

```typescript
// Usuario: dierez00@gmail.com
// Dispositivo: android-1761458200-xyz789 (nuevo)

1. Ingresa credenciales
2. Click en "Entrar"
3. ⚠️ Servidor detecta dispositivo nuevo
4. Se abre modal de verificación
5. Usuario captura selfie
6. Usuario captura INE
7. Click en "Verificar identidad"
8. ✅ Verificación exitosa
9. Alert: "Verificación exitosa! Tu dispositivo ha sido registrado"
10. Redirección a /home
```

### Caso 3: Error de Verificación Biométrica

```typescript
1. Ingresa credenciales
2. Dispositivo nuevo detectado
3. Modal de verificación abierto
4. Usuario captura selfie e INE
5. ❌ Verificación falla (cara no coincide)
6. Alert: "Verificación biométrica fallida"
7. Modal permanece abierto
8. Usuario puede intentar de nuevo
```

## 🛠️ Manejo de Errores

### Errores HTTP
```typescript
try {
  await AuthService.login({...});
} catch (error) {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      // Credenciales incorrectas
    } else if (error.status === 404) {
      // Usuario no encontrado
    } else if (error.status >= 500) {
      // Error del servidor
    }
  }
}
```

### Errores de Conexión
```typescript
catch (error) {
  // Error de red
  setError('Error de conexión. Verifica tu internet');
}
```

### Errores de Dispositivo
```typescript
if (!deviceId || !deviceName) {
  setError('Error al obtener información del dispositivo');
}
```

## 🧪 Testing

### Simular Dispositivo Nuevo

```typescript
import { useDeviceId } from '@/hooks/use-device-id';

const { resetDeviceId } = useDeviceId();

// En cualquier momento, ejecutar:
await resetDeviceId();

// Esto generará un nuevo deviceId
// El próximo login solicitará verificación biométrica
```

### Usuarios de Prueba

```typescript
// Usuario existente
Email: dierez00@gmail.com
Password: [tu contraseña]

// Dispositivos conocidos (ejemplos):
- ios-1761458187-abc123
- android-1761458200-xyz789
```

## 📝 Notas Importantes

1. **DeviceId Persistente**: El deviceId se guarda en localStorage (web) o memoria (mobile). En producción, usar AsyncStorage o SecureStore.

2. **Credenciales Temporales**: Cuando se detecta dispositivo nuevo, las credenciales se guardan en `pendingCredentials` solo durante la sesión de verificación.

3. **Token Automático**: El token se guarda automáticamente en `AuthService` al hacer login exitoso.

4. **Formato de Imágenes**: Las imágenes se convierten a Blob antes de enviarse al servidor.

5. **Permisos**: El modal solicita permisos de cámara y galería automáticamente.

## 🚀 Mejoras Futuras

- [ ] Implementar AsyncStorage para persistencia real en mobile
- [ ] Agregar timeout en la verificación biométrica
- [ ] Implementar retry automático en errores de red
- [ ] Agregar opción de "recordar dispositivo"
- [ ] Implementar Face ID / Touch ID como alternativa
- [ ] Agregar logs de auditoría de dispositivos
- [ ] Implementar notificación cuando se registra nuevo dispositivo

## 🔗 Archivos Relacionados

- `app/(auth)/login.tsx` - Pantalla de login
- `hooks/use-device-id.ts` - Hook de deviceId
- `components/biometric-verification-modal.tsx` - Modal de verificación
- `services/modules/auth.service.ts` - Servicio de autenticación
- `services/utils/http-client.ts` - Cliente HTTP
