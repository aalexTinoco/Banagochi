# Integración de Home con API

## Cambios Realizados

### 1. Creación del User Store (`app/state/user-store.ts`)
- ✅ Store global para gestionar el usuario autenticado
- ✅ Persistencia del usuario y token en AsyncStorage
- ✅ Hooks `useUser()` y `useToken()` para React components
- ✅ Integración automática del token con HttpClient para todas las peticiones API
- ✅ Funciones de login/logout para gestionar la sesión

**Funciones principales:**
- `setUser(user, token)` - Guarda usuario y configura token en HttpClient
- `clearUser()` - Cierra sesión y limpia datos
- `loadUserFromStorage()` - Carga sesión al iniciar app
- `useUser()` - Hook para acceder al usuario en componentes

### 2. Actualización del Login (`app/(auth)/login.tsx`)
- ✅ Ahora guarda el usuario y token en el store al hacer login exitoso
- ✅ Funciona tanto para login normal como con verificación biométrica
- ✅ El token se configura automáticamente en todas las peticiones API

### 3. Actualización del Layout Principal (`app/_layout.tsx`)
- ✅ Carga el usuario desde AsyncStorage al iniciar la app
- ✅ Muestra loading mientras carga la sesión
- ✅ Restaura automáticamente la sesión del usuario

### 4. Actualización del Home Screen (`app/(tabs)/home.tsx`)

#### Datos Conectados con la API:

**Tarjetas de Crédito:**
```typescript
const cardsResponse = await API.cards.getUserCards(user.id);
```
- Carga las tarjetas reales del usuario
- Muestra balance disponible (maxCredit - creditUsed)
- Mapea tipos de tarjeta a imágenes correctas

**Proyectos Activos:**
```typescript
const userProjectsResponse = await API.projects.getByProposer(user.id);
```
- Carga proyectos donde el usuario es organizador
- Carga proyectos donde el usuario ha colaborado (via transacciones)
- Muestra progreso en tiempo real (currentAmount / fundingGoal)
- Distingue entre rol "Organizador" y "Colaborador"

**Actividad Reciente:**
```typescript
const transactionsResponse = await API.transactions.getUserTransactions(user.id);
```
- Muestra las últimas 3 transacciones del usuario
- Calcula el tiempo transcurrido (ej: "2h", "1d")
- Muestra el monto donado por transacción

**Proyectos Completados:**
```typescript
const allProjects = await API.projects.getAll();
// Filtrados por status === 'COMPLETED'
```
- Muestra proyectos completados donde el usuario participó
- Incluye fecha de finalización
- Permite ver detalles del proyecto

#### Características Adicionales:

- ✅ **Pull-to-refresh:** Desliza hacia abajo para recargar datos
- ✅ **Loading states:** Muestra indicador mientras carga
- ✅ **Empty states:** Mensajes cuando no hay datos
- ✅ **Logout funcional:** Cierra sesión y limpia datos del store
- ✅ **Protección de ruta:** Redirige si no hay usuario autenticado

## Flujo de Autenticación

1. **App inicia** → `_layout.tsx` carga usuario desde AsyncStorage
2. **Usuario hace login** → `login.tsx` guarda usuario y token
3. **Token se configura** → HttpClient usa el token en todas las peticiones
4. **Home carga datos** → Hace peticiones autenticadas a la API
5. **Sesión persiste** → Usuario sigue autenticado al reabrir la app
6. **Logout** → Limpia datos y redirige a inicio

## Endpoints Utilizados

### Users Service (user-microservice)
- `GET /api/cards/user/:userId` - Obtener tarjetas del usuario

### Operational Service (banagochi-back)
- `GET /api/projects` - Obtener todos los proyectos
- `GET /api/projects/:id` - Obtener proyecto por ID
- `GET /api/projects/proposer/:userId` - Proyectos del usuario
- `GET /api/transactions/user/:userId` - Transacciones del usuario

## Configuración

Las URLs de las APIs están configuradas en `services/config/api.config.ts`:

```typescript
const USE_LOCALHOST = false; // Cambiar a true para desarrollo local

export const API_CONFIG = {
  USERS_BASE_URL: USE_LOCALHOST 
    ? 'http://localhost:4000' 
    : 'https://user-microservice-production-8438.up.railway.app',
  OPERATIONAL_BASE_URL: USE_LOCALHOST 
    ? 'http://localhost:4001' 
    : 'https://banagochi-back-production.up.railway.app',
};
```

## Dependencias Instaladas

```bash
npm install @react-native-async-storage/async-storage
```

## Testing

Para probar la integración:

1. Inicia sesión con un usuario existente
2. El home debe cargar:
   - Tarjetas del usuario
   - Proyectos activos
   - Transacciones recientes
   - Proyectos completados
3. Desliza hacia abajo para refrescar datos
4. Cierra sesión y vuelve a entrar (debería restaurar la sesión)

## Datos de Prueba

Puedes usar los usuarios de ejemplo de la API:
- Email: `maria.gonzalez@banagochi.com`
- Password: `SecurePass123`

O cualquier usuario que hayas creado en el sistema.

## Próximos Pasos

- [ ] Conectar pantalla de proyectos con API
- [ ] Conectar pantalla de búsqueda con API
- [ ] Implementar notificaciones push
- [ ] Agregar caché de datos para offline
- [ ] Implementar paginación en listas largas
