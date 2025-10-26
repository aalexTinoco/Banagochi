# Banagochi API Service - Guía de Uso

Servicio centralizado de API para la aplicación móvil de Banagochi.

## 📁 Estructura de Archivos

```
services/
├── api.ts          # Servicio principal con todos los métodos
├── types.ts        # Interfaces y tipos TypeScript
├── config.ts       # Configuración de URLs y endpoints
└── README.md       # Esta guía
```

## 🚀 Instalación y Configuración

### 1. Importar el servicio

```typescript
import { api } from './services/api';
```

### 2. Configurar el entorno

Edita `config.ts` para cambiar entre desarrollo y producción:

```typescript
export const CURRENT_ENV = ENV.DEVELOPMENT; // o ENV.PRODUCTION
```

## 📚 Uso de la API

### Autenticación

#### Login
```typescript
import { api } from './services/api';

// Login básico
const loginUser = async () => {
  try {
    const response = await api.login({
      email: 'usuario@example.com',
      password: 'password123',
      deviceId: 'device-12345',
      deviceName: 'iPhone 14'
    });
    
    console.log('Token:', response.token);
    console.log('User:', response.user);
    // El token se guarda automáticamente
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Registro
```typescript
const registerUser = async () => {
  try {
    const response = await api.register({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
      role: [{ type: 'user' }],
      colony: 'Centro',
      domicilio: 'Calle Principal 123, Monterrey, NL'
    });
    
    console.log('Usuario registrado:', response);
  } catch (error) {
    console.error('Register error:', error);
  }
};
```

#### Verificar si está autenticado
```typescript
if (api.isAuthenticated()) {
  console.log('Usuario autenticado');
  console.log('Token:', api.getAuthToken());
  console.log('User ID:', api.getUserId());
}
```

#### Logout
```typescript
const logout = async () => {
  const userId = api.getUserId();
  if (userId) {
    await api.logoutAll(userId);
    // Se limpia automáticamente el localStorage
  }
};
```

### Usuarios

#### Obtener todos los usuarios
```typescript
const getUsers = async () => {
  try {
    const response = await api.getAllUsers();
    console.log('Usuarios:', response.users);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Obtener usuario por ID
```typescript
const getUser = async (userId: string) => {
  try {
    const response = await api.getUserById(userId);
    console.log('Usuario:', response.user);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Actualizar usuario
```typescript
const updateUser = async (userId: string) => {
  try {
    await api.updateUser(userId, {
      name: 'Nombre Actualizado',
      colony: 'Nueva Colonia',
      domicilio: 'Nueva Dirección 456'
    });
    console.log('Usuario actualizado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Proyectos

#### Obtener todos los proyectos
```typescript
const getProjects = async () => {
  try {
    const response = await api.getAllProjects();
    console.log('Total proyectos:', response.count);
    console.log('Proyectos:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Filtrar proyectos
```typescript
// Por status
const getActiveProjects = async () => {
  const response = await api.getAllProjects({
    status: 'FUNDING',
    active: true
  });
  return response.data;
};

// Por colonia
const getColoniaProjects = async () => {
  const response = await api.getProjectsByColonia('Centro');
  return response.data;
};

// Por status específico
const getVotingProjects = async () => {
  const response = await api.getProjectsByStatus('VOTING');
  return response.data;
};
```

#### Crear un proyecto
```typescript
const createProject = async () => {
  try {
    const response = await api.createProject({
      title: 'Reparación del Parque',
      description: 'Instalación de juegos infantiles',
      colonia: 'Centro',
      proposerId: api.getUserId()!,
      fundingGoal: 50000,
      votingStats: {
        votesNeeded: 100
      },
      supplierInfo: {
        name: 'Constructora XYZ',
        account: '012345678901234567'
      }
    });
    
    console.log('Proyecto creado:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Votar por un proyecto
```typescript
const voteProject = async (projectId: string) => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    await api.addVote(projectId, userId);
    console.log('Voto registrado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Añadir fondeo
```typescript
const fundProject = async (projectId: string, amount: number) => {
  try {
    await api.addFunding(projectId, amount);
    console.log('Fondeo añadido');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Añadir actualización al feed
```typescript
const addUpdate = async (projectId: string) => {
  try {
    await api.addFeedItem(projectId, {
      type: 'UPDATE',
      text: 'Se completó la primera fase del proyecto',
      imageUrl: 'https://example.com/image.jpg'
    });
    console.log('Actualización añadida');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Apartados (Deducciones de Nómina)

#### Crear un apartado
```typescript
const createAside = async (projectId: string) => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.createAside({
      userId,
      projectId,
      amountPerCycle: 500,
      frequency: 'BIWEEKLY' // WEEKLY, BIWEEKLY, MONTHLY
    });
    
    console.log('Apartado creado:', response.aside);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Obtener apartados del usuario
```typescript
const getUserAsides = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.getUserAsides(userId);
    console.log('Total apartados:', response.summary.total);
    console.log('Apartados activos:', response.summary.active);
    console.log('Compromiso mensual:', response.summary.monthlyCommitment);
    console.log('Apartados:', response.asides);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Filtrar apartados por estado
```typescript
const getActiveAsides = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  const response = await api.getUserAsides(userId, {
    status: 'ACTIVE'
  });
  return response.asides;
};
```

#### Pausar un apartado
```typescript
const pauseAside = async (asideId: string) => {
  try {
    await api.pauseAside(asideId);
    console.log('Apartado pausado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Reactivar un apartado
```typescript
const reactivateAside = async (asideId: string) => {
  try {
    await api.reactivateAside(asideId);
    console.log('Apartado reactivado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Cancelar un apartado
```typescript
const cancelAside = async (asideId: string) => {
  try {
    await api.cancelAside(asideId);
    console.log('Apartado cancelado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Actualizar monto del apartado
```typescript
const updateAsideAmount = async (asideId: string, newAmount: number) => {
  try {
    await api.updateAsideAmount(asideId, newAmount);
    console.log('Monto actualizado');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Transacciones

#### Crear donación única
```typescript
const donate = async (projectId: string, amount: number) => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.createOneTimeTransaction({
      userId,
      projectId,
      amount
    });
    
    console.log('Donación realizada:', response.transaction);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Obtener transacciones del usuario
```typescript
const getUserTransactions = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.getUserTransactions(userId);
    console.log('Total transacciones:', response.summary.total);
    console.log('Total donado:', response.summary.totalAmount);
    console.log('Transacciones:', response.transactions);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Filtrar transacciones
```typescript
// Solo completadas
const getCompletedTransactions = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  const response = await api.getUserTransactions(userId, {
    status: 'completed'
  });
  return response.transactions;
};

// Por tipo
const getPayrollTransactions = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  const response = await api.getUserTransactions(userId, {
    source: 'PAYROLL_DEDUCTION'
  });
  return response.transactions;
};
```

#### Obtener dashboard de impacto
```typescript
const getImpactDashboard = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.getUserImpactDashboard(userId);
    console.log('Total contribuido:', response.dashboard.totalContributed);
    console.log('Proyectos apoyados:', response.dashboard.projectsSupported);
    console.log('Apartados activos:', response.dashboard.activeAsides);
    console.log('Compromiso mensual:', response.dashboard.monthlyCommitment);
    console.log('Por categoría:', response.dashboard.byCategory);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Obtener transacciones de un proyecto
```typescript
const getProjectTransactions = async (projectId: string) => {
  try {
    const response = await api.getProjectTransactions(projectId);
    console.log('Transacciones del proyecto:', response.transactions);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Menús

#### Obtener menús por rol
```typescript
const getMenus = async () => {
  try {
    const userData = api.getStoredUserData();
    const role = userData?.role[0]?.type || 'user';
    
    const menus = await api.getMenusByRole(role);
    console.log('Menús:', menus);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Tarjetas de Crédito

#### Crear una tarjeta de crédito
```typescript
const createCard = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.createCreditCard({
      userId,
      cardNumber: '4152313465789012',
      holderName: 'MARIA GONZALEZ',
      expiry: '12/28',
      type: 'banortemujer', // 'banortemujer' | 'banorteclasica' | 'banorteoro'
      maxCredit: 50000,
      cutoffDay: 15
    });
    
    console.log('Tarjeta creada:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Obtener tarjetas del usuario
```typescript
const getUserCards = async () => {
  const userId = api.getUserId();
  if (!userId) return;
  
  try {
    const response = await api.getUserCreditCards(userId);
    console.log('Tarjetas:', response.cards);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Actualizar tarjeta
```typescript
const updateCard = async (cardId: string) => {
  try {
    await api.updateCreditCard(cardId, {
      maxCredit: 75000,
      cutoffDay: 20,
      creditUsed: 15000,
      status: 'active'
    });
    console.log('Tarjeta actualizada');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Eliminar tarjeta
```typescript
const deleteCard = async (cardId: string) => {
  try {
    await api.deleteCreditCard(cardId);
    console.log('Tarjeta eliminada');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎯 Ejemplo Completo de Flujo

```typescript
import { api } from './services/api';

// 1. Login
const loginFlow = async () => {
  try {
    // Login
    const loginResponse = await api.login({
      email: 'usuario@example.com',
      password: 'password123',
      deviceId: 'my-device-123',
      deviceName: 'iPhone 14'
    });
    
    console.log('Autenticado:', loginResponse.user);
    
    // 2. Obtener proyectos
    const projectsResponse = await api.getAllProjects({
      status: 'FUNDING',
      active: true
    });
    
    const projects = projectsResponse.data;
    console.log('Proyectos disponibles:', projects.length);
    
    // 3. Votar por un proyecto
    if (projects.length > 0) {
      const projectToVote = projects[0];
      await api.addVote(projectToVote._id, loginResponse.user.id);
      console.log('Voto registrado');
    }
    
    // 4. Crear apartado mensual
    if (projects.length > 0) {
      const projectToSupport = projects[0];
      const asideResponse = await api.createAside({
        userId: loginResponse.user.id,
        projectId: projectToSupport._id,
        amountPerCycle: 500,
        frequency: 'MONTHLY'
      });
      console.log('Apartado creado:', asideResponse.aside);
    }
    
    // 5. Ver dashboard de impacto
    const dashboard = await api.getUserImpactDashboard(loginResponse.user.id);
    console.log('Mi impacto:', dashboard.dashboard);
    
    // 6. Obtener mis apartados
    const asidesResponse = await api.getUserAsides(loginResponse.user.id);
    console.log('Mis apartados:', asidesResponse.asides);
    
  } catch (error) {
    console.error('Error en el flujo:', error);
  }
};

loginFlow();
```

## 🛠️ Utilidades

### Verificar autenticación
```typescript
const isLoggedIn = () => api.isAuthenticated();
```

### Obtener usuario guardado
```typescript
const currentUser = api.getStoredUserData();
console.log('Usuario actual:', currentUser);
```

### Limpiar sesión
```typescript
const clearSession = () => {
  api.clearStorage();
  console.log('Sesión limpiada');
};
```

## 📝 TypeScript

Todas las interfaces están disponibles en `types.ts`:

```typescript
import {
  IUser,
  IProject,
  IAside,
  ITransaction,
  ICreditCard,
  ProjectStatus,
  AsideFrequency,
  TransactionSource,
  CardType
} from './services/types';

// Uso con tipos
const project: IProject = {
  // ...proyecto con autocompletado
};

const card: ICreditCard = {
  // ...tarjeta con autocompletado
};
```

## 🔧 Configuración Avanzada

### Cambiar timeout de requests
Edita `config.ts`:
```typescript
export const REQUEST_TIMEOUT = 30000; // 30 segundos
```

### Cambiar URLs de producción
Edita `config.ts`:
```typescript
export const API_CONFIG = {
  USERS_SERVICE: {
    production: 'https://tu-api.com/users',
  },
  OPERATIONAL_SERVICE: {
    production: 'https://tu-api.com/operational',
  },
};
```

## 🚨 Manejo de Errores

Todos los métodos lanzan errores que deben ser capturados:

```typescript
try {
  const projects = await api.getAllProjects();
  // Procesar proyectos
} catch (error) {
  if (error instanceof Error) {
    console.error('Error mensaje:', error.message);
  }
  // Mostrar mensaje al usuario
}
```

## 📞 Soporte

Para más información, revisa:
- `types.ts` - Todas las interfaces
- `config.ts` - Configuración de endpoints
- `api.ts` - Implementación de métodos
