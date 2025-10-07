# Pagina de Prueba
https://suga96.github.io/tabla-posiciones/

# 🏆 Sistema de Tabla de Posiciones para Vendedores

Una aplicación web moderna y profesional para gestionar el ranking de vendedores con efectos de sonido y diseño empresarial.

## ✨ Características

- **Registro de Vendedores**: Agregar nuevos vendedores al sistema
- **Registro de Ventas**: Registrar ventas con montos específicos
- **Podio Interactivo**: Visualización destacada del top 3 de vendedores
- **Tabla Top 10**: Ranking completo con estadísticas detalladas
- **Efectos de Sonido**:
  - Sonido agradable al registrar una venta
  - Fanfarria de 2 segundos cuando cambia el podio
- **Diseño Empresarial**: Colores corporativos (azul, blanco hueso, naranjo)
- **Almacenamiento Local**: Los datos persisten entre sesiones
- **Responsive**: Adaptado para dispositivos móviles

## 🚀 Cómo Usar

### 1. Abrir la Aplicación
Simplemente abra el archivo `index.html` en su navegador web preferido.

### 2. Registrar Vendedores
1. En el panel "Registro de Vendedor", ingrese el nombre del vendedor
2. Haga clic en "Agregar Vendedor"
3. El vendedor aparecerá en el selector de ventas

### 3. Registrar Ventas
1. Seleccione un vendedor del dropdown
2. Ingrese el monto de la venta
3. Haga clic en "Registrar Venta"
4. Escuchará un sonido de confirmación
5. Si hay cambio en el podio, sonará una fanfarria especial

### 4. Visualizar Resultados
- **Podio**: Los 3 mejores vendedores se muestran en un podio visual
- **Tabla Top 10**: Ranking completo con estadísticas detalladas
- **Estadísticas**: Resumen general en la parte inferior

## 🎵 Efectos de Sonido

- **Venta Registrada**: Sonido musical agradable y corto
- **Cambio de Podio**: Fanfarria de 2 segundos cuando alguien entra o cambia posición en el top 3

*Nota: Los sonidos se generan usando Web Audio API y funcionan en navegadores modernos*

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en el almacenamiento local del navegador:
- Los vendedores y sus ventas se mantienen entre sesiones
- No se requiere base de datos externa
- Los datos se guardan cada vez que se registra una venta o vendedor

## 🎨 Diseño

### Colores Corporativos
- **Azul Principal**: #1e3a8a
- **Azul Claro**: #3b82f6  
- **Naranjo Acento**: #f97316
- **Blanco Hueso**: #faf7f0

### Características de Diseño
- Gradientes suaves y sombras modernas
- Iconos de Font Awesome
- Tipografía Inter profesional
- Animaciones suaves y transiciones
- Diseño responsive para móviles

## 📱 Compatibilidad

- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Dispositivos móviles (iOS/Android)

## 🔧 Funciones Avanzadas

### Para Desarrolladores
Si ejecuta la aplicación en localhost, aparecerá un botón "Limpiar Datos" para resetear toda la información.

### Exportar/Importar Datos
La aplicación incluye funciones para exportar e importar datos (disponibles en la consola del navegador):
- `exportarDatos()`: Descarga un archivo JSON con todos los datos
- `importarDatos(event)`: Importa datos desde un archivo JSON

## 📋 Estructura del Proyecto

```
Tabla_posiciones/
├── index.html          # Estructura principal
├── styles.css          # Estilos y diseño
├── script.js           # Lógica de la aplicación
└── README.md          # Documentación
```

## 🏢 Ideal Para

- Equipos de ventas corporativos
- Concursos de vendedores
- Seguimiento de metas mensuales
- Gamificación de procesos comerciales
- Presentaciones en tiempo real

## 📈 Métricas Incluidas

- Ventas totales por vendedor
- Número de ventas realizadas
- Promedio por venta
- Estadísticas generales del equipo
- Posicionamiento en tiempo real

---

*Desarrollado con tecnologías web estándar para máxima compatibilidad y rendimiento.*
