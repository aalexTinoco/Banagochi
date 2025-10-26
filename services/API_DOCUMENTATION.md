# API Service Documentation

## Estructura Modular

La API está organizada de manera modular y escalable:

```
services/
├── api.ts                  # Punto de entrada principal
├── config/
│   └── api.config.ts      # Configuración y endpoints
├── types/                  # Definiciones de tipos TypeScript
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── card.types.ts
│   ├── project.types.ts
│   ├── aside.types.ts
│   ├── transaction.types.ts
│   ├── menu.types.ts
│   └── index.ts
├── modules/                # Servicios individuales
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── card.service.ts
│   ├── menu.service.ts
│   ├── project.service.ts
│   ├── aside.service.ts
│   ├── transaction.service.ts
│   └── index.ts
└── utils/
    └── http-client.ts     # Cliente HTTP con retry y timeout
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura las URLs de tus APIs:
```env
EXPO_PUBLIC_USERS_API_URL=http://localhost:4000
EXPO_PUBLIC_OPERATIONAL_API_URL=http://localhost:4001
```

## Uso Básico

### Importación

```typescript
import { API, AuthService, ProjectService } from '@/services/api';
// o importa servicios individuales
import { AuthService } from '@/services/api';
```

### Autenticación

```typescript
// Login con dispositivo existente
const response = await AuthService.login({
  email: 'maria.gonzalez@banagochi.com',
  password: 'SecurePass123',
  deviceId: 'device-12345',
  deviceName: 'iPhone 14 Pro'
});

// El token se guarda automáticamente
console.log(response.token);
console.log(response.user);

// Login con nuevo dispositivo (requiere biometría)
const formResponse = await AuthService.loginWithBiometric({
  email: 'maria.gonzalez@banagochi.com',
  password: 'SecurePass123',
  deviceId: 'device-NEW-67890',
  deviceName: 'Samsung Galaxy S24',
  selfie: selfieFile,  // File o Blob
  ine: ineFile         // File o Blob
});

// Logout
AuthService.logout();
```

### Usuarios

```typescript
// Registrar usuario
const newUser = await UserService.register({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'SecurePass123',
  role: [{ type: 'user' }],
  colony: 'Centro',
  domicilio: 'Calle Principal 123',
  selfie: selfieFile,
  ine: ineFile
});

// Obtener usuario actual
const user = await UserService.getUserById(userId);

// Actualizar perfil
await UserService.updateUser(userId, {
  name: 'Juan Pérez Actualizado',
  colony: 'San Pedro'
});

// Obtener dispositivos del usuario
const devices = await UserService.getUserDevices(userId);

// Cerrar sesión en un dispositivo
await UserService.logoutDevice(userId, {
  deviceId: 'device-12345'
});
```

### Proyectos

```typescript
// Obtener todos los proyectos
const allProjects = await ProjectService.getAllProjects();

// Filtrar proyectos
const votingProjects = await ProjectService.getAllProjects({
  status: 'VOTING',
  colonia: 'Centro',
  active: true
});

// Obtener proyecto por ID
const project = await ProjectService.getProjectById(projectId);

// Crear proyecto
const newProject = await ProjectService.createProject({
  title: 'Reparación del parque central',
  description: 'Instalación de juegos infantiles',
  proposerId: userId,
  colonia: 'La Primavera',
  fundingGoal: 50000,
  currentAmount: 0,
  status: 'VOTING',
  supplierInfo: {
    account: '123456789012345678',
    name: 'BANORTE'
  },
  votingStats: {
    votesNeeded: 50
  }
});

// Votar por proyecto
await ProjectService.addVote(projectId, {
  voterId: userId
});

// Añadir fondeo
await ProjectService.addFunding(projectId, {
  amount: 5000
});

// Añadir actualización al feed
await ProjectService.addFeedItem(projectId, {
  type: 'UPDATE',
  text: 'Se han instalado las primeras 10 luminarias',
  imageUrl: 'https://example.com/update-image.jpg'
});

// Obtener proyectos por colonia
const coloniaProjects = await ProjectService.getProjectsByColonia('Centro');

// Obtener proyectos del usuario
const myProjects = await ProjectService.getProjectsByProposer(userId);
```

### Apartados (Asides)

```typescript
// Crear apartado de nómina
const aside = await AsideService.createAside({
  userId: userId,
  projectId: projectId,
  amountPerCycle: 500,
  frequency: 'BIWEEKLY' // WEEKLY, BIWEEKLY, MONTHLY
});

// Obtener apartados del usuario
const userAsides = await AsideService.getUserAsides(userId);

// Obtener solo apartados activos
const activeAsides = await AsideService.getUserAsides(userId, 'ACTIVE');

// Pausar apartado
await AsideService.pauseAside(asideId);

// Reactivar apartado
await AsideService.reactivateAside(asideId);

// Cancelar apartado
await AsideService.cancelAside(asideId);

// Actualizar monto
await AsideService.updateAsideAmount(asideId, {
  amountPerCycle: 750
});

// Obtener apartados de un proyecto
const projectAsides = await AsideService.getProjectAsides(projectId);
```

### Transacciones

```typescript
// Crear transacción única (aportación directa)
const transaction = await TransactionService.createOneTimeTransaction({
  userId: userId,
  projectId: projectId,
  amount: 1000
});

// Obtener transacciones del usuario
const transactions = await TransactionService.getUserTransactions(userId);

// Filtrar transacciones
const completedTransactions = await TransactionService.getUserTransactions(userId, {
  status: 'completed',
  source: 'ONE_TIME'
});

// Obtener transacciones de un proyecto
const projectTransactions = await TransactionService.getProjectTransactions(projectId);

// Obtener dashboard de impacto del usuario
const dashboard = await TransactionService.getUserDashboard(userId);
console.log(dashboard.totalContributed);
console.log(dashboard.activeProjects);
console.log(dashboard.completedProjects);
console.log(dashboard.projectBreakdown);
```

### Tarjetas de Crédito

```typescript
// Crear tarjeta
const card = await CardService.createCard({
  userId: userId,
  cardNumber: '4152313465789012',
  holderName: 'MARIA GONZALEZ',
  expiry: '12/28',
  type: 'banortemujer', // banortemujer, banorteclasica, banorteoro
  maxCredit: 50000,
  cutoffDay: 15
});

// Obtener tarjetas del usuario
const cards = await CardService.getUserCards(userId);

// Actualizar tarjeta
await CardService.updateCard(cardId, {
  maxCredit: 75000,
  creditUsed: 15000
});

// Eliminar tarjeta
await CardService.deleteCard(cardId);
```

### Menús

```typescript
// Obtener menús por rol
const userMenus = await MenuService.getMenusByRole('user');
const adminMenus = await MenuService.getMenusByRole('admin');

// Crear menú (admin)
const menu = await MenuService.createMenu({
  title: 'Dashboard',
  description: 'Panel principal',
  path: '/dashboard',
  icon: 'dashboard',
  roles: [{ type: 'user' }],
  status: true
});
```

## Uso del Objeto API Unificado

```typescript
import { API } from '@/services/api';

// Todas las funciones están disponibles bajo API
const user = await API.auth.login({...});
const projects = await API.projects.getAllProjects();
const asides = await API.asides.getUserAsides(userId);
const transactions = await API.transactions.getUserTransactions(userId);
```

## Manejo de Errores

```typescript
import { HttpError } from '@/services/api';

try {
  const projects = await ProjectService.getAllProjects();
} catch (error) {
  if (error instanceof HttpError) {
    console.error('HTTP Error:', error.status, error.statusText);
    console.error('Error data:', error.data);
    
    // Manejo específico por código de error
    if (error.status === 401) {
      // No autenticado - redirigir a login
      AuthService.logout();
      // navigate to login
    } else if (error.status === 404) {
      // Recurso no encontrado
    } else if (error.status >= 500) {
      // Error del servidor
    }
  } else {
    console.error('Network error:', error);
  }
}
```

## Características del HTTP Client

- ✅ **Timeout automático**: 30 segundos por defecto
- ✅ **Retry automático**: 3 intentos en caso de error
- ✅ **Manejo de tokens**: Inyección automática del token de autenticación
- ✅ **TypeScript**: Totalmente tipado
- ✅ **FormData**: Soporte para uploads de archivos
- ✅ **Manejo de errores**: Errores tipados con información detallada

## TypeScript Types

Todos los tipos están disponibles para importación:

```typescript
import type {
  // Auth
  LoginRequest,
  LoginResponse,
  User,
  
  // Projects
  Project,
  ProjectStatus,
  CreateProjectRequest,
  
  // Asides
  Aside,
  AsideFrequency,
  AsideStatus,
  
  // Transactions
  Transaction,
  UserDashboard,
  
  // Cards
  CreditCard,
  CardType,
  
  // ... y más
} from '@/services/api';
```

## Configuración Avanzada

### Cambiar URLs de API en tiempo de ejecución

```typescript
import { API_CONFIG } from '@/services/api';

API_CONFIG.USERS_BASE_URL = 'https://api.banagochi.com/users';
API_CONFIG.OPERATIONAL_BASE_URL = 'https://api.banagochi.com/operational';
```

### Configurar timeout y retries

```typescript
import { API_CONFIG } from '@/services/api';

API_CONFIG.TIMEOUT = 60000; // 60 segundos
API_CONFIG.RETRY_ATTEMPTS = 5;
API_CONFIG.RETRY_DELAY = 2000; // 2 segundos
```

### Requests personalizados

```typescript
import { HttpClient } from '@/services/api';

// GET request personalizado
const data = await HttpClient.get('https://api.example.com/custom');

// POST con configuración personalizada
const result = await HttpClient.post(
  'https://api.example.com/custom',
  { data: 'value' },
  {
    timeout: 10000,
    retry: 2
  }
);
```

## Ejemplo Completo: Flujo de Usuario

```typescript
import { API } from '@/services/api';

async function userFlow() {
  try {
    // 1. Login
    const loginResponse = await API.auth.login({
      email: 'maria@example.com',
      password: 'password',
      deviceId: 'device-123',
      deviceName: 'iPhone 14'
    });
    
    const userId = loginResponse.user.id;
    
    // 2. Obtener proyectos disponibles
    const projects = await API.projects.getAllProjects({
      status: 'VOTING',
      colonia: 'Centro'
    });
    
    // 3. Votar por un proyecto
    await API.projects.addVote(projects.projects![0]._id, {
      voterId: userId
    });
    
    // 4. Crear apartado de nómina para otro proyecto
    const aside = await API.asides.createAside({
      userId,
      projectId: projects.projects![1]._id,
      amountPerCycle: 500,
      frequency: 'BIWEEKLY'
    });
    
    // 5. Ver dashboard de impacto
    const dashboard = await API.transactions.getUserDashboard(userId);
    console.log('Total contribuido:', dashboard.dashboard.totalContributed);
    
    // 6. Logout
    API.auth.logout();
    
  } catch (error) {
    console.error('Error en el flujo:', error);
  }
}
```

## Testing

Para testing, puedes mockear los servicios:

```typescript
import { AuthService } from '@/services/api';

// Mock con Jest
jest.mock('@/services/api', () => ({
  AuthService: {
    login: jest.fn().mockResolvedValue({
      success: true,
      token: 'mock-token',
      user: { id: '123', name: 'Test User' }
    })
  }
}));
```

## Soporte

Para más información, revisa la colección de Postman incluida en `colecciones-hack/Banagochi-Complete-API.postman_collection.json`.
