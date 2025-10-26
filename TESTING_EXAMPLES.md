# 🧪 Ejemplos de Testing - Sistema de Login

## Testing en Consola del Navegador

### 1. Verificar DeviceId

```javascript
// Abrir DevTools → Console
// Ejecutar:

// Ver deviceId actual
localStorage.getItem('banagochi_device_id');
// → "web-1761458187-abc123def456"

// Ver deviceName actual
localStorage.getItem('banagochi_device_name');
// → "Web Browser"

// Generar nuevo deviceId (simular dispositivo nuevo)
localStorage.removeItem('banagochi_device_id');
localStorage.removeItem('banagochi_device_name');
location.reload();
```

### 2. Verificar Token

```javascript
// En consola después de login exitoso:

// El token se guarda en el HttpClient
// Para verificarlo, hacer una petición autenticada:
fetch('http://localhost:4000/api/users/getall', {
  headers: {
    'Authorization': `Bearer ${/* tu token aquí */}`
  }
}).then(r => r.json()).then(console.log);
```

### 3. Simular Errores

```javascript
// Simular error de red (offline)
// En DevTools → Network → Throttling → Offline

// Simular error 401
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'wrong-password',
    deviceId: 'test-device',
    deviceName: 'Test Device'
  })
}).then(r => r.json()).then(console.log);
```

## Testing con React DevTools

### Ver Estado del Componente

```javascript
// 1. Instalar React DevTools
// 2. Abrir panel de Components
// 3. Seleccionar componente "LoginScreen"
// 4. Ver hooks:

// useDeviceId
{
  deviceId: "web-1761458187-abc123",
  deviceName: "Web Browser",
  loading: false,
  resetDeviceId: function
}

// useState (email)
value: "dierez00@gmail.com"

// useState (password)
value: "••••••••"

// useState (isLoading)
value: false

// useState (showBiometricModal)
value: false
```

## Testing Programático

### Archivo de Test (Jest)

```typescript
// __tests__/login.test.ts

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthService } from '@/services/api';
import LoginScreen from '@/app/(auth)/login';

// Mock del servicio
jest.mock('@/services/api', () => ({
  AuthService: {
    login: jest.fn(),
    loginWithBiometric: jest.fn(),
  },
}));

describe('LoginScreen', () => {
  it('should login successfully with known device', async () => {
    // Mock respuesta exitosa
    (AuthService.login as jest.Mock).mockResolvedValue({
      success: true,
      token: 'mock-token',
      isNewDevice: false,
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@test.com',
      },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    // Ingresar credenciales
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'password123');

    // Submit
    fireEvent.press(getByText('Entrar'));

    // Verificar que se llamó al servicio
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        deviceId: expect.any(String),
        deviceName: expect.any(String),
      });
    });
  });

  it('should show biometric modal for new device', async () => {
    // Mock respuesta de dispositivo nuevo
    (AuthService.login as jest.Mock).mockResolvedValue({
      isNewDevice: true,
      requiresBiometric: true,
    });

    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'password123');
    fireEvent.press(getByText('Entrar'));

    // Verificar que se abre el modal
    await waitFor(() => {
      expect(queryByText('Verificación Biométrica')).toBeTruthy();
    });
  });

  it('should handle login errors', async () => {
    // Mock error 401
    (AuthService.login as jest.Mock).mockRejectedValue({
      status: 401,
      data: { message: 'Invalid credentials' },
    });

    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'wrong');
    fireEvent.press(getByText('Entrar'));

    // Verificar mensaje de error
    await waitFor(() => {
      expect(queryByText('Email o contraseña incorrectos')).toBeTruthy();
    });
  });
});
```

## Testing Manual - Script de Testing

### Script para Testing Rápido

```typescript
// test-login.ts
// Ejecutar con: npx ts-node test-login.ts

import { AuthService } from './services/api';

async function testLogin() {
  console.log('🧪 Testing Login Flow...\n');

  // Test 1: Login Normal
  console.log('Test 1: Login con dispositivo conocido');
  try {
    const response = await AuthService.login({
      email: 'dierez00@gmail.com',
      password: 'your-password',
      deviceId: 'test-device-123',
      deviceName: 'Test Device',
    });

    console.log('✅ Login exitoso');
    console.log('Token:', response.token?.substring(0, 20) + '...');
    console.log('Usuario:', response.user.name);
    console.log('Es nuevo dispositivo:', response.isNewDevice);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Nuevo Dispositivo
  console.log('Test 2: Login con dispositivo nuevo');
  try {
    const response = await AuthService.login({
      email: 'dierez00@gmail.com',
      password: 'your-password',
      deviceId: 'test-device-NEW-999',
      deviceName: 'New Test Device',
    });

    if (response.isNewDevice) {
      console.log('✅ Dispositivo nuevo detectado');
      console.log('Requiere biométrica:', response.requiresBiometric);
    } else {
      console.log('⚠️ Se esperaba dispositivo nuevo');
    }
  } catch (error: any) {
    if (error.data?.isNewDevice) {
      console.log('✅ Dispositivo nuevo detectado (desde error)');
      console.log('Requiere biométrica:', error.data.requiresBiometric);
    } else {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n---\n');

  // Test 3: Credenciales Incorrectas
  console.log('Test 3: Credenciales incorrectas');
  try {
    await AuthService.login({
      email: 'wrong@email.com',
      password: 'wrong-password',
      deviceId: 'test-device-123',
      deviceName: 'Test Device',
    });
    console.log('⚠️ No debería llegar aquí');
  } catch (error: any) {
    console.log('✅ Error esperado:', error.status, error.statusText);
  }
}

// Ejecutar tests
testLogin();
```

## Testing de Imágenes

### Crear Blobs de Prueba

```typescript
// create-test-images.ts

// Crear imagen de prueba como Blob
async function createTestImage(type: 'selfie' | 'ine'): Promise<Blob> {
  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Dibujar fondo
  ctx.fillStyle = type === 'selfie' ? '#FFE5E5' : '#E5F3FF';
  ctx.fillRect(0, 0, 400, 400);

  // Dibujar texto
  ctx.fillStyle = '#333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(type === 'selfie' ? '📸 Selfie' : '🪪 INE', 200, 200);

  // Convertir a Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.8);
  });
}

// Usar en tests
async function testBiometricVerification() {
  const selfieBlob = await createTestImage('selfie');
  const ineBlob = await createTestImage('ine');

  const response = await AuthService.loginWithBiometric({
    email: 'test@test.com',
    password: 'password',
    deviceId: 'new-device',
    deviceName: 'New Device',
    selfie: selfieBlob,
    ine: ineBlob,
  });

  console.log('Verificación completada:', response);
}
```

## Testing de Estados

### Ciclo Completo de Estados

```typescript
// state-testing.tsx

function LoginStateTester() {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, name: 'Initial', desc: 'Estado inicial del formulario' },
    { id: 2, name: 'Typing', desc: 'Usuario escribiendo credenciales' },
    { id: 3, name: 'Validating', desc: 'Validación de campos' },
    { id: 4, name: 'Loading', desc: 'Enviando petición' },
    { id: 5, name: 'New Device', desc: 'Dispositivo nuevo detectado' },
    { id: 6, name: 'Biometric Modal', desc: 'Modal de verificación abierto' },
    { id: 7, name: 'Capturing Images', desc: 'Capturando selfie e INE' },
    { id: 8, name: 'Verifying', desc: 'Verificando biometría' },
    { id: 9, name: 'Success', desc: 'Login exitoso' },
    { id: 10, name: 'Error', desc: 'Error de verificación' },
  ];

  return (
    <View>
      <Text>Estado actual: {steps[step - 1].name}</Text>
      <Text>{steps[step - 1].desc}</Text>
      
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Button 
          title="Anterior" 
          onPress={() => setStep(Math.max(1, step - 1))}
        />
        <Button 
          title="Siguiente" 
          onPress={() => setStep(Math.min(10, step + 1))}
        />
      </View>
    </View>
  );
}
```

## Debugging Tips

### 1. Network Requests

```javascript
// En DevTools → Network, filtrar por:
// - Method: POST
// - File: login

// Ver request:
{
  email: "...",
  password: "...",
  deviceId: "...",
  deviceName: "..."
}

// Ver response:
{
  message: "...",
  token: "...",
  isNewDevice: true/false,
  user: {...}
}
```

### 2. React State

```javascript
// Agregar console.log en el componente:

useEffect(() => {
  console.log('DeviceId changed:', deviceId);
}, [deviceId]);

useEffect(() => {
  console.log('Loading state:', isLoading);
}, [isLoading]);

useEffect(() => {
  console.log('Modal state:', showBiometricModal);
}, [showBiometricModal]);
```

### 3. API Calls

```javascript
// En auth.service.ts, agregar logs:

static async login(data: LoginRequest): Promise<LoginResponse> {
  console.log('Login attempt:', {
    email: data.email,
    deviceId: data.deviceId,
    deviceName: data.deviceName,
  });

  const response = await HttpClient.post<LoginResponse>(
    `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
    data
  );

  console.log('Login response:', {
    success: response.success,
    isNewDevice: response.isNewDevice,
    hasToken: !!response.token,
  });

  return response;
}
```

## Performance Testing

### Medir Tiempos

```typescript
// En login.tsx

async function submit() {
  const startTime = performance.now();
  console.log('Login started');

  try {
    const response = await AuthService.login({...});
    const endTime = performance.now();
    console.log(`Login completed in ${endTime - startTime}ms`);
  } catch (error) {
    const endTime = performance.now();
    console.log(`Login failed after ${endTime - startTime}ms`);
  }
}
```

### Medir Carga de Imágenes

```typescript
async function handleBiometricSubmit(selfie: any, ine: any) {
  const startTime = performance.now();
  
  // Medir conversión a blob
  const blobStartTime = performance.now();
  const selfieBlob = await createImageBlob(selfie.uri, 'selfie.jpg');
  const ineBlob = await createImageBlob(ine.uri, 'ine.jpg');
  const blobEndTime = performance.now();
  console.log(`Blob conversion: ${blobEndTime - blobStartTime}ms`);

  // Medir upload
  const uploadStartTime = performance.now();
  const response = await AuthService.loginWithBiometric({...});
  const uploadEndTime = performance.now();
  console.log(`Upload: ${uploadEndTime - uploadStartTime}ms`);

  const totalTime = performance.now() - startTime;
  console.log(`Total biometric verification: ${totalTime}ms`);
}
```

---

**Nota**: Estos ejemplos están listos para copiar y pegar. Ajusta las credenciales y URLs según tu entorno.
