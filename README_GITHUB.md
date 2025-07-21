# 🚀 CRM Contactos Pro

<div align="center">
  
![CRM Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-Latest-9feaf9)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Sistema CRM moderno y completo construido con Electron, SQLite y JavaScript**

[📥 Instalación](#instalación) • [🎯 Características](#características) • [📖 Uso](#uso) • [🤝 Contribuir](#contribuir)

</div>

---

## 🌟 **Características Principales**

### 🎨 **Diseño Moderno y Profesional**
- **Interfaz renovada** con branding "CRM Contactos Pro"
- **Dark Mode completo** con toggle persistente y transiciones suaves
- **Sistema de colores** coherente con gradientes profesionales
- **Typography moderna** con fuente Inter de Google Fonts
- **Animaciones fluidas** y efectos visuales de alta calidad

### 👥 **Gestión Completa de Contactos**
- **15+ campos empresariales** por contacto (nombre, empresa, cargo, etc.)
- **Estados de seguimiento**: Lead → Prospect → Cliente → Inactivo
- **Niveles de prioridad**: Alta, Media, Baja con indicadores visuales
- **Sistema de tags** flexible para categorización
- **Notas detalladas** y seguimiento personalizado

### 📊 **Dashboard Inteligente con Analytics**
- **KPIs en tiempo real** con métricas empresariales animadas
- **Gráficos interactivos** (Chart.js) - donut y líneas
- **Widgets responsivos** con estadísticas clave
- **Contadores animados** con transiciones suaves
- **Adaptación automática** al tema oscuro/claro

### 🔍 **Búsqueda y Filtros Avanzados**
- **Búsqueda en tiempo real** por múltiples campos simultáneos
- **Filtros combinables** por estado, prioridad y texto libre
- **Resultados instantáneos** mientras escribes
- **Búsqueda inteligente** sin distinción de mayúsculas
- **Interfaz intuitiva** con indicadores visuales

### 📈 **Reportes y Análisis Empresarial**
- **Exportación CSV** con datos completos y timestamp
- **Reportes de conversión** automáticos con tasas calculadas
- **Métricas de rendimiento** en tiempo real
- **Análisis de distribución** por estados y categorías
- **Estadísticas agregadas** automáticas

### 🔐 **Seguridad Empresarial**
- **Autenticación robusta** con bcrypt y JWT
- **Roles de usuario** granulares (Admin/Usuario)
- **Sesiones persistentes** con localStorage seguro
- **Validación de datos** completa en frontend y backend
- **IPC seguro** con preload script aislado

---

## 🛠️ **Stack Tecnológico**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Electron** | Latest | Framework de aplicación desktop |
| **Node.js** | 18+ | Runtime de JavaScript backend |
| **SQLite3** | Latest | Base de datos local embebida |
| **Chart.js** | 4.4.0 | Visualización de datos interactiva |
| **HTML5 + CSS3** | Latest | Frontend moderno y responsive |
| **JavaScript ES6+** | Latest | Lógica de aplicación |
| **Inter Font** | Google Fonts | Typography profesional |

---

## 📥 **Instalación**

### Prerrequisitos
- **Node.js** 18 o superior
- **npm** 8 o superior
- **Windows, macOS o Linux**

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/sistema-contactos-crm.git
cd sistema-contactos-crm

# 2. Instalar dependencias
npm install

# 3. Ejecutar la aplicación
npm start
```

### Compilación para Distribución

```bash
# Compilar para el sistema operativo actual
npm run build

# Los archivos compilados estarán en la carpeta 'dist/'
```

---

## 🎯 **Uso del Sistema**

### 🔑 **Inicio de Sesión**
- **Usuario por defecto**: `admin@test.com`
- **Contraseña**: `123456`

### 🗂️ **Navegación Principal**
1. **📊 Dashboard** - Vista general con KPIs y gráficos interactivos
2. **👥 Contactos** - Gestión completa de contactos empresariales
3. **👤 Usuarios** - Administración de usuarios del sistema
4. **📈 Reportes** - Análisis, estadísticas y exportación de datos

### 📝 **Gestión de Contactos**
- **➕ Crear**: Botón "Nuevo Contacto" con formulario completo de 15+ campos
- **🔍 Buscar**: Campo de búsqueda en tiempo real por nombre, empresa, email
- **🎛️ Filtrar**: Por estado (Lead/Prospect/Cliente/Inactivo) y prioridad (Alta/Media/Baja)
- **📊 Exportar**: Descarga CSV con todos los datos y timestamp
- **✏️ Editar/🗑️ Eliminar**: Botones de acción en cada fila con confirmación

### 🌙 **Modo Oscuro**
- **Toggle**: Botón 🌙/☀️ en el header superior derecho
- **Persistencia**: Se mantiene entre sesiones automáticamente
- **Adaptación**: Todos los elementos, gráficos y colores se adaptan

---

## 📊 **Capturas de Pantalla**

### Dashboard Principal
> KPIs animados, gráficos interactivos y widgets responsivos

### Gestión de Contactos
> Formulario completo con 15+ campos empresariales y búsqueda avanzada

### Modo Oscuro
> Tema oscuro completo con adaptación de gráficos y elementos

---

## 🏗️ **Arquitectura del Proyecto**

```
sistema-contactos-crm/
├── 📁 src/                          # Código fuente
│   ├── 📁 database/
│   │   └── database.js              # Gestión SQLite y modelos
│   ├── 📁 scripts/
│   │   ├── dashboard.js             # JavaScript principal (400+ líneas)
│   │   └── login.js                 # Lógica de autenticación
│   ├── 📁 services/
│   │   └── authService.js           # Servicios de autenticación
│   ├── 📁 styles/
│   │   ├── dashboard.css            # Estilos principales + dark mode
│   │   └── login.css                # Estilos de login
│   ├── 📁 views/
│   │   ├── dashboard.html           # Vista principal con tabs
│   │   └── login.html               # Vista de autenticación
│   └── preload.js                   # Bridge IPC seguro
├── 📁 data/                         # Base de datos SQLite
│   └── users.db
├── main.js                          # Proceso principal Electron
├── package.json                     # Configuración y dependencias
└── README.md                        # Documentación principal
```

---

## 🚀 **Características Implementadas**

### ✅ **Fase 1: Rediseño Visual Completo**
- Nuevo branding "CRM Contactos Pro"
- Sistema de colores profesional con CSS Variables
- Dark Mode completo con persistencia
- Typography moderna con fuente Inter
- Animaciones y transiciones suaves

### ✅ **Fase 2: Base de Datos Expandida**
- Tabla de contactos con 15+ campos empresariales
- Relaciones foreign key optimizadas
- Datos de muestra con información realista
- Métodos CRUD completos y seguros

### ✅ **Fase 3: Dashboard con Analytics**
- Chart.js integrado con gráficos donut y líneas
- KPIs empresariales en tiempo real
- Contadores animados con lógica matemática segura
- Adaptación automática al tema oscuro/claro

### ✅ **Fase 4: Gestión Avanzada de Contactos**
- Formulario empresarial completo con validaciones
- Estados comerciales: Lead → Prospect → Cliente → Inactivo
- Niveles de prioridad con badges visuales
- Sistema de tags flexible y notas detalladas

### ✅ **Fase 5: Búsqueda y Filtros Inteligentes**
- Búsqueda en tiempo real por múltiples campos
- Filtros combinables por estado y prioridad
- Resultados instantáneos sin recarga de página
- Interface intuitiva con indicadores visuales

### ✅ **Fase 6: Interface por Tabs y UX**
- Navegación fluida entre 4 secciones principales
- Modales grandes optimizados para formularios complejos
- Notificaciones toast para feedback inmediato
- Responsive design adaptable a todas las pantallas

### ✅ **Fase 7: Reportes y Exportación**
- Exportación CSV con todos los campos
- Reportes de conversión con tasas calculadas
- Análisis de distribución automático
- Métricas de rendimiento en tiempo real

---

## 📈 **Métricas del Proyecto**

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | 1,500+ líneas |
| **Archivos principales** | 7 archivos core |
| **Funcionalidades** | 25+ características |
| **Compatibilidad** | Windows/Mac/Linux |
| **Estado** | ✅ Producción Lista |

---

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. **Fork** el proyecto
2. Crea tu **rama de feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### 🐛 **Reportar Bugs**
Si encuentras un bug, por favor:
1. Verifica que no esté ya reportado en [Issues](../../issues)
2. Crea un nuevo issue con detalles del problema
3. Incluye pasos para reproducir el error

---

## 📝 **Licencia**

Distribuido bajo la **Licencia MIT**. Ver `LICENSE` para más información.

---

## 📞 **Contacto y Soporte**

- **Proyecto**: CRM Contactos Pro
- **Versión**: 2.0.0 - Full Featured
- **Estado**: ✅ Producción Lista
- **Soporte**: Crea un [issue](../../issues) para preguntas

---

<div align="center">

**⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**

---

*🎉 Sistema CRM completamente funcional con todas las características empresariales* 🎉

</div>
