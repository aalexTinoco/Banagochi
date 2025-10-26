# 🔐 Flujo de Verificación Biométrica - Paso a Paso

## Cambios Implementados

### ✅ Mejoras de Seguridad

1. **INE solo desde cámara**: Por seguridad, la foto del INE solo puede tomarse en vivo con la cámara. No se permite seleccionar de la galería.

2. **Proceso secuencial**: El flujo es paso por paso, sin opciones de modal:
   - Paso 1: Captura selfie → Continuar
   - Paso 2: Captura INE → Envío automático
   - Paso 3: Verificación en proceso

3. **Envío automático**: Una vez que ambas imágenes están capturadas, se envían automáticamente para verificación.

## 🔄 Flujo Actualizado

### Paso 1: Captura de Selfie

```
Modal se abre
    ↓
Pantalla muestra: "Paso 1: Captura tu rostro"
    ↓
Usuario toca botón "Tomar selfie"
    ↓
Se abre cámara frontal
    ↓
Usuario toma selfie
    ↓
Preview de la selfie
    ↓
Opciones: "Tomar de nuevo" o "Continuar →"
    ↓
Usuario toca "Continuar"
```

### Paso 2: Captura de INE

```
Pantalla muestra: "Paso 2: Captura tu INE"
    ↓
Muestra thumbnail de selfie capturada (✓)
    ↓
Usuario toca botón "Tomar foto de INE"
    ↓
Se abre cámara trasera (SOLO CÁMARA, sin galería)
    ↓
Usuario toma foto del INE
    ↓
Preview del INE
    ↓
Opción: "Tomar de nuevo"
```

### Paso 3: Verificación Automática

```
Ambas imágenes capturadas
    ↓
Envío automático inmediato
    ↓
Pantalla de "Verificando tu identidad..."
    ↓
Muestra ambas imágenes
    ↓
Loading spinner
    ↓
Espera respuesta del servidor
    ↓
✅ Verificación exitosa → Cierra modal → Redirección
    ❌ Error → Alert → Permite reintentar
```

## 🎨 UI del Proceso

### Indicador de Pasos
```
[1]━━━━━━[2]
Selfie    INE

Estado inicial:    [1]──────[2]
Selfie tomada:     [✓]━━━━━[2]
INE tomada:        [✓]━━━━━[✓]
```

### Pantalla de Selfie
```
┌─────────────────────────┐
│  🔒 Dispositivo nuevo   │
│  Por tu seguridad...    │
└─────────────────────────┘

    [1]━━━━━━[2]
    Selfie    INE

Paso 1: Captura tu rostro
Toma una selfie clara...

┌─────────────────────────┐
│                         │
│         📸              │
│    Tomar selfie         │
│                         │
└─────────────────────────┘
```

### Pantalla de INE
```
┌─────────────────────────┐
│  🔒 Dispositivo nuevo   │
│  Por tu seguridad...    │
└─────────────────────────┘

    [✓]━━━━━━[2]
    Selfie    INE

Paso 2: Captura tu INE
Toma una foto de tu INE...

┌────────────────────────┐
│ ✓ Selfie capturada  [▢]│
└────────────────────────┘

┌─────────────────────────┐
│                         │
│         🪪              │
│  Tomar foto de INE      │
│                         │
└─────────────────────────┘
```

### Pantalla de Verificación
```
┌─────────────────────────┐
│  🔒 Dispositivo nuevo   │
│  Por tu seguridad...    │
└─────────────────────────┘

    [✓]━━━━━━[✓]
    Selfie    INE

      [Loading...]

Verificando tu identidad...
Estamos comparando tu selfie
con tu INE...

┌──────────┐  ┌──────────┐
│ Selfie   │  │   INE    │
│   [▢]    │  │   [▢]    │
└──────────┘  └──────────┘
```

## 💻 Código de Implementación

### Estados del Modal

```typescript
type VerificationStep = 'selfie' | 'ine' | 'verifying';

const [currentStep, setCurrentStep] = useState<VerificationStep>('selfie');
const [selfie, setSelfie] = useState<any>(null);
const [ine, setIne] = useState<any>(null);
```

### Captura con Cámara (Solo)

```typescript
const handleTakePhoto = async (type: 'selfie' | 'ine') => {
  // Solicitar permisos
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  // Abrir cámara
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: type === 'selfie' ? [1, 1] : [16, 9],
    quality: 0.8,
    cameraType: type === 'selfie' 
      ? ImagePicker.CameraType.front   // Cámara frontal para selfie
      : ImagePicker.CameraType.back,   // Cámara trasera para INE
  });

  if (!result.canceled && result.assets[0]) {
    if (type === 'selfie') {
      setSelfie(result.assets[0]);
      setCurrentStep('ine'); // Avanzar automáticamente
    } else {
      setIne(result.assets[0]);
      setCurrentStep('verifying'); // Ir a verificación
    }
  }
};
```

### Envío Automático

```typescript
// Auto-submit cuando ambas imágenes están listas
useEffect(() => {
  if (selfie && ine && !isLoading) {
    handleAutoSubmit();
  }
}, [selfie, ine]);

const handleAutoSubmit = async () => {
  if (!selfie || !ine) return;
  await onSubmit(selfie, ine);
};
```

### Retomar Foto

```typescript
const handleRetake = (type: 'selfie' | 'ine') => {
  if (type === 'selfie') {
    setSelfie(null);
    setCurrentStep('selfie');
  } else {
    setIne(null);
    setCurrentStep('ine');
  }
};
```

## 🎯 Ventajas del Nuevo Flujo

### Seguridad
- ✅ **INE en vivo**: Evita fotos de fotos o documentos falsificados
- ✅ **Proceso guiado**: Reduce errores del usuario
- ✅ **Sin interrupciones**: Flujo continuo y rápido

### Experiencia de Usuario
- ✅ **Paso a paso**: Fácil de seguir
- ✅ **Indicador visual**: Usuario sabe en qué paso está
- ✅ **Automático**: No necesita pensar cuándo enviar
- ✅ **Feedback claro**: Siempre sabe qué hacer

### Técnico
- ✅ **Menos estados**: Lógica más simple
- ✅ **Menos errores**: Validación automática
- ✅ **Mejor rendimiento**: Envío inmediato

## 🧪 Testing

### Probar Flujo Completo

```typescript
1. Login con dispositivo nuevo
2. Modal se abre en paso "selfie"
3. Tomar selfie con cámara frontal
4. Ver preview y tocar "Continuar"
5. Modal cambia a paso "ine"
6. Ver thumbnail de selfie capturada
7. Tomar foto de INE con cámara trasera
8. Ver preview del INE
9. Automáticamente pasa a "verifying"
10. Esperar verificación
11. ✅ Éxito o ❌ Error
```

### Probar Retomar Foto

```typescript
1. En paso de selfie, tomar foto
2. Ver preview
3. Tocar "🔄 Tomar de nuevo"
4. Vuelve a abrir cámara
5. Capturar nueva selfie

// Lo mismo para INE
```

### Probar Cancelación

```typescript
1. En cualquier paso, tocar "Cancelar"
2. Si está verificando, muestra confirmación
3. Si confirma, cierra modal y limpia estado
```

## ⚠️ Consideraciones

### Permisos de Cámara
```typescript
// Solicitar permisos antes de abrir modal (opcional)
await ImagePicker.requestCameraPermissionsAsync();
```

### Manejo de Errores
```typescript
// Si la cámara falla
catch (error) {
  Alert.alert('Error', 'No se pudo acceder a la cámara');
  // Permitir reintentar
}
```

### Estados de Carga
```typescript
// Deshabilitar botones durante captura
disabled={capturingImage || isLoading}
```

### Limpieza de Estado
```typescript
// Al abrir modal, resetear todo
useEffect(() => {
  if (visible) {
    setCurrentStep('selfie');
    setSelfie(null);
    setIne(null);
  }
}, [visible]);
```

## 📱 Diferencias con Versión Anterior

| Característica | Anterior | Nuevo |
|---|---|---|
| Selfie | Cámara o Galería | Solo Cámara |
| INE | Cámara o Galería | **Solo Cámara** |
| Flujo | Todo en un modal | Paso por paso |
| Envío | Botón manual | **Automático** |
| Navegación | Scroll | Cambio de pantalla |
| Reintentar | Cambiar foto | Tomar de nuevo |

---

**Versión**: 2.0  
**Fecha**: Octubre 26, 2025  
**Estado**: ✅ Implementado y probado
