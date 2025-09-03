class SistemaVentas {
    constructor() {
        console.log('Inicializando SistemaVentas...');
        this.vendedores = this.cargarDatos() || [];
        console.log('Vendedores cargados:', this.vendedores);
        this.audioContext = null;
        this.periodoActual = 'diario';
        this.intervalosRotacion = null;
        this.contadorRotacion = 60;
        this.rankingAnterior = {}; // Para trackear tendencias
        this.puntajesInicioDia = {}; // Para comparar con inicio del día
        this.inicializarAudio();
        this.inicializarEventos();
        this.inicializarRotacion();
        this.inicializarPuntajesInicioDia();
        this.actualizarInterfaz();
        console.log('SistemaVentas inicializado correctamente');
    }

    // Inicialización del contexto de audio
    inicializarAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio no disponible:', error);
        }
    }

    // Reproducir sonido de venta desde archivo MP3
    async reproducirSonidoVenta() {
        try {
            const audio = new Audio('sell.mp3');
            audio.volume = 0.7; // Volumen al 70%
            await audio.play();
        } catch (error) {
            console.warn('Error reproduciendo sonido de venta:', error);
            // Fallback: intentar con ruta alternativa
            try {
                const audio = new Audio('./sell.mp3');
                audio.volume = 0.7;
                await audio.play();
            } catch (fallbackError) {
                console.warn('Error con fallback de sonido de venta:', fallbackError);
            }
        }
    }

    // Reproducir sonido de campeón desde archivo MP3
    async reproducirSonidoCambioPodio() {
        try {
            const audio = new Audio('champ.mp3');
            audio.volume = 0.8; // Volumen al 80% (más alto para el campeón)
            await audio.play();
        } catch (error) {
            console.warn('Error reproduciendo sonido de campeón:', error);
            // Fallback: intentar con ruta alternativa
            try {
                const audio = new Audio('./champ.mp3');
                audio.volume = 0.8;
                await audio.play();
            } catch (fallbackError) {
                console.warn('Error con fallback de sonido de campeón:', fallbackError);
            }
        }
    }

    // Inicializar eventos del DOM
    inicializarEventos() {
        // Formulario de vendedor
        document.getElementById('vendedorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarVendedor();
        });

        // Formulario de venta
        document.getElementById('ventaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarVenta();
        });

        // Botón de limpiar todo (debug)
        document.getElementById('limpiarTodo').addEventListener('click', () => {
            this.limpiarTodo();
        });

        // Botón de exportar CSV
        document.getElementById('exportarCSV').addEventListener('click', () => {
            this.exportarCSV();
        });

        // Inicializar contexto de audio en primera interacción
        document.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        // Event listeners para los dots de período
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const periodo = e.target.dataset.period;
                this.cambiarPeriodo(periodo);
            });
        });
    }

    // Agregar nuevo vendedor
    agregarVendedor() {
        const nombreInput = document.getElementById('nombreVendedor');
        const nombre = nombreInput.value.trim();

        if (!nombre) {
            alert('Por favor ingrese un nombre válido');
            return;
        }

        // Verificar si el vendedor ya existe
        if (this.vendedores.find(v => v.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert('Este vendedor ya está registrado');
            return;
        }

        const nuevoVendedor = {
            id: Date.now(),
            nombre: nombre,
            ventas: [], // Array de ventas con fechas
            fechaRegistro: new Date().toISOString()
        };

        this.vendedores.push(nuevoVendedor);
        console.log('Vendedor agregado:', nuevoVendedor);
        console.log('Total vendedores:', this.vendedores.length);
        
        this.guardarDatos();
        this.actualizarInterfaz();
        
        // Mostrar toast de vendedor agregado
        this.mostrarToast(`👤 ${nombre} se unió al equipo de ventas`, 'success');
        
        nombreInput.value = '';
        
        // Animación de confirmación
        const form = document.getElementById('vendedorForm');
        form.classList.add('animate-pulse');
        setTimeout(() => form.classList.remove('animate-pulse'), 600);
    }

    // Registrar nueva venta
    async registrarVenta() {
        const vendedorId = parseInt(document.getElementById('vendedorSelect').value);
        const monto = parseFloat(document.getElementById('montoVenta').value);

        if (!vendedorId || !monto || monto <= 0) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }

        // Obtener ranking anterior para detectar cambios en podio
        const rankingAnterior = this.obtenerRankingPorPeriodo(this.periodoActual).slice(0, 3);

        const vendedor = this.vendedores.find(v => v.id === vendedorId);
        if (vendedor) {
            // Si es la primera venta del día, actualizar puntajes inicio
            const ventasHoyAntes = this.calcularVentasDelDia(vendedor);
            if (ventasHoyAntes.numero === 0 && !this.puntajesInicioDia[vendedorId]) {
                this.actualizarPuntajesInicioDia();
            }
            
            // Agregar venta individual con fecha
            const nuevaVenta = {
                id: Date.now(),
                monto: monto,
                fecha: new Date().toISOString()
            };
            
            vendedor.ventas.push(nuevaVenta);
            console.log(`Venta registrada para ${vendedor.nombre}:`, nuevaVenta);
            console.log(`Total ventas del vendedor:`, vendedor.ventas.length);
        } else {
            console.error(`No se encontró vendedor con ID: ${vendedorId}`);
        }

        this.guardarDatos();
        
        // Verificar cambios en el podio (usar ranking del período actual)
        const rankingNuevo = this.obtenerRankingPorPeriodo(this.periodoActual).slice(0, 3);
        if (this.hayCambioPodio(rankingAnterior, rankingNuevo)) {
            // Mostrar toast de cambio de podio
            this.mostrarToast(`🏆 ¡${vendedor.nombre} cambió posición en el podio!`, 'podium');
            
            // Esperar un poco antes del sonido de podio
            setTimeout(() => {
                this.reproducirSonidoCambioPodio();
            }, 800);
        } else {
            // Mostrar toast de venta normal
            this.mostrarToast(`🎉 ${vendedor.nombre} registró ${this.formatearMoneda(monto)}`, 'success');
            await this.reproducirSonidoVenta();
        }

        this.actualizarInterfaz();
        
        // Limpiar formulario
        document.getElementById('vendedorSelect').value = '';
        document.getElementById('montoVenta').value = '';
        
        // Animación de confirmación
        const form = document.getElementById('ventaForm');
        form.classList.add('animate-pulse');
        setTimeout(() => form.classList.remove('animate-pulse'), 600);
    }

    // Verificar si hay cambio en el podio
    hayCambioPodio(anterior, nuevo) {
        if (anterior.length !== nuevo.length) return true;
        
        for (let i = 0; i < anterior.length; i++) {
            if (!anterior[i] || !nuevo[i] || anterior[i].id !== nuevo[i].id) {
                return true;
            }
        }
        return false;
    }

    // Obtener ranking ordenado
    obtenerRanking() {
        return [...this.vendedores]
            .filter(v => v.ventasTotal > 0)
            .sort((a, b) => b.ventasTotal - a.ventasTotal);
    }

    // Inicializar sistema de rotación
    inicializarRotacion() {
        this.iniciarRotacionAutomatica();
        this.actualizarIndicadorPeriodo();
    }

    // Inicializar puntajes del inicio del día
    inicializarPuntajesInicioDia() {
        const fechaHoy = new Date().toDateString();
        const clavePuntajes = `puntajesInicioDia_${fechaHoy}`;
        
        // Cargar puntajes guardados del día o crearlos
        const puntajesGuardados = localStorage.getItem(clavePuntajes);
        
        if (puntajesGuardados) {
            this.puntajesInicioDia = JSON.parse(puntajesGuardados);
            console.log('📊 Puntajes inicio del día cargados:', this.puntajesInicioDia);
        } else {
            // Guardar puntajes actuales como inicio del día
            this.actualizarPuntajesInicioDia();
        }
    }

    // Actualizar puntajes del inicio del día
    actualizarPuntajesInicioDia() {
        const fechaHoy = new Date().toDateString();
        const clavePuntajes = `puntajesInicioDia_${fechaHoy}`;
        
        this.puntajesInicioDia = {};
        this.vendedores.forEach(vendedor => {
            const ventasHoy = this.calcularVentasDelDia(vendedor);
            this.puntajesInicioDia[vendedor.id] = {
                ventasTotal: ventasHoy.total,
                numeroVentas: ventasHoy.numero
            };
        });
        
        localStorage.setItem(clavePuntajes, JSON.stringify(this.puntajesInicioDia));
        console.log('📊 Puntajes inicio del día actualizados:', this.puntajesInicioDia);
    }

    // Calcular ventas del día actual
    calcularVentasDelDia(vendedor) {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        
        const ventasHoy = vendedor.ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            return fechaVenta >= inicioDia;
        });
        
        return {
            total: ventasHoy.reduce((sum, venta) => sum + venta.monto, 0),
            numero: ventasHoy.length
        };
    }

    // Iniciar rotación automática cada 10 segundos
    iniciarRotacionAutomatica() {
        // Limpiar intervalos existentes
        if (this.intervalosRotacion) {
            clearInterval(this.intervalosRotacion);
        }

        // Contador visual
        this.contadorRotacion = 60;
        const contadorInterval = setInterval(() => {
            this.contadorRotacion--;
            document.getElementById('rotationCounter').textContent = this.contadorRotacion;
            
            if (this.contadorRotacion <= 0) {
                this.siguientePeriodo();
                this.contadorRotacion = 60;
            }
        }, 1000);

        this.intervalosRotacion = contadorInterval;
    }

    // Cambiar al siguiente período
    siguientePeriodo() {
        const periodos = ['diario', 'semanal', 'mensual'];
        const indexActual = periodos.indexOf(this.periodoActual);
        const siguienteIndex = (indexActual + 1) % periodos.length;
        this.cambiarPeriodo(periodos[siguienteIndex]);
    }

    // Cambiar período manualmente
    cambiarPeriodo(nuevoPeriodo) {
        if (this.periodoActual === nuevoPeriodo) return;

        const periodoAnterior = this.periodoActual;
        this.periodoActual = nuevoPeriodo;

        // Actualizar dots
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.period === nuevoPeriodo);
        });

        // Animar cambio de tabla
        this.animarCambioTabla(periodoAnterior, nuevoPeriodo);
        this.actualizarIndicadorPeriodo();
        this.actualizarTablaRanking();

        // Reiniciar contador
        this.contadorRotacion = 60;
    }

    // Animar cambio de tabla
    animarCambioTabla(periodoAnterior, nuevoPeriodo) {
        const tablaAnterior = document.getElementById(`tabla-${periodoAnterior}`);
        const tablaNueva = document.getElementById(`tabla-${nuevoPeriodo}`);

        // Salir tabla anterior
        tablaAnterior.classList.add('slide-out-left');
        tablaAnterior.classList.remove('active');

        // Entrar tabla nueva
        setTimeout(() => {
            tablaNueva.classList.add('active');
            tablaNueva.classList.remove('slide-in-right');
            
            // Limpiar clases de animación
            setTimeout(() => {
                tablaAnterior.classList.remove('slide-out-left');
                tablaNueva.classList.remove('slide-in-right');
            }, 500);
        }, 100);
    }

    // Actualizar indicador de período
    actualizarIndicadorPeriodo() {
        const titulos = {
            'diario': '📊 Ranking Diario',
            'semanal': '📈 Ranking Semanal', 
            'mensual': '🏆 Ranking Mensual'
        };

        const fechas = {
            'diario': 'Hoy',
            'semanal': 'Esta Semana',
            'mensual': 'Este Mes'
        };

        document.getElementById('currentPeriodTitle').textContent = titulos[this.periodoActual];
        document.getElementById('periodDate').textContent = fechas[this.periodoActual];
        
        // Actualizar estadísticas cuando cambie el período
        this.actualizarEstadisticas();
    }

    // Actualizar toda la interfaz
    actualizarInterfaz() {
        this.actualizarSelectVendedores();
        this.actualizarTablaRanking();
        this.actualizarEstadisticas();
    }

    // Actualizar select de vendedores
    actualizarSelectVendedores() {
        const select = document.getElementById('vendedorSelect');
        select.innerHTML = '<option value="">Seleccionar vendedor</option>';
        
        this.vendedores.forEach(vendedor => {
            const option = document.createElement('option');
            option.value = vendedor.id;
            option.textContent = vendedor.nombre;
            select.appendChild(option);
        });
    }

    // Método del podio eliminado - ya no se usa

    // Actualizar tabla de ranking según período activo
    actualizarTablaRanking() {
        console.log('Actualizando tabla de ranking para período:', this.periodoActual);
        
        // Actualizar todas las tablas
        this.actualizarTablaPeriodo('diario');
        this.actualizarTablaPeriodo('semanal');
        this.actualizarTablaPeriodo('mensual');
    }

    // Actualizar tabla específica por período
    actualizarTablaPeriodo(periodo) {
        const tbody = document.getElementById(`rankingBody-${periodo}`);
        if (!tbody) {
            console.error(`No se encontró el elemento rankingBody-${periodo}`);
            return;
        }
        
        const ranking = this.obtenerRankingPorPeriodo(periodo).slice(0, 10);
        console.log(`Ranking ${periodo}:`, ranking);
        
        tbody.innerHTML = '';
        
        if (ranking.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <p>No hay ventas registradas aún</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Guardar ranking actual para próxima comparación
        const rankingActual = {};
        
        ranking.forEach((vendedor, index) => {
            const fila = document.createElement('tr');
            const posicion = index + 1;
            const promedio = vendedor.numeroVentas > 0 ? vendedor.ventasTotal / vendedor.numeroVentas : 0;
            
            // Calcular tendencia
            const tendencia = this.calcularTendencia(vendedor.id, posicion, periodo);
            rankingActual[vendedor.id] = posicion;
            
            fila.innerHTML = `
                <td>
                    <span class="position-badge position-${posicion <= 3 ? posicion : 'other'}">
                        ${posicion}°
                    </span>
                </td>
                <td>
                    <strong>${vendedor.nombre}</strong>
                    ${tendencia}
                </td>
                <td><strong>${this.formatearMoneda(vendedor.ventasTotal)}</strong></td>
                <td>${vendedor.numeroVentas}</td>
                <td>${this.formatearMoneda(promedio)}</td>
            `;
            
            tbody.appendChild(fila);
        });
        
        // Actualizar ranking anterior solo si hay cambios significativos
        const hayChangios = this.hayChangiosEnRanking(this.rankingAnterior[periodo], rankingActual);
        if (hayChangios || !this.rankingAnterior[periodo]) {
            this.rankingAnterior[periodo] = rankingActual;
            console.log(`📊 Ranking ${periodo} actualizado con nuevas tendencias`);
        }
    }

    // Calcular tendencia (flechas de subida/bajada)
    calcularTendencia(vendedorId, posicionActual, periodo) {
        // Para tabla diaria: mostrar monto de la última venta
        if (periodo === 'diario') {
            const vendedor = this.vendedores.find(v => v.id === vendedorId);
            if (!vendedor || !vendedor.ventas || vendedor.ventas.length === 0) return '';
            
            // Obtener la última venta
            const ultimaVenta = vendedor.ventas[vendedor.ventas.length - 1];
            
            return `<span class="last-sale">+${this.formatearMoneda(ultimaVenta.monto)}</span>`;
        }
        
        // Para tablas semanal/mensual: comparar cambio de posición
        else {
            const posicionAnterior = this.rankingAnterior[periodo]?.[vendedorId];
            
            if (!posicionAnterior) {
                return '<span class="trend-new">🆕</span>'; // Nuevo en ranking
            }
            
            if (posicionActual < posicionAnterior) {
                const diferencia = posicionAnterior - posicionActual;
                return `<span class="trend-up">↗️ +${diferencia}</span>`;
            } else if (posicionActual > posicionAnterior) {
                const diferencia = posicionActual - posicionAnterior;
                return `<span class="trend-down">↘️ -${diferencia}</span>`;
            } else {
                return ''; // Sin indicador si no hay movimiento
            }
        }
    }

    // Verificar si hay cambios en el ranking
    hayChangiosEnRanking(rankingAnterior, rankingActual) {
        if (!rankingAnterior) return true;
        
        // Comparar posiciones
        for (const vendedorId in rankingActual) {
            if (rankingAnterior[vendedorId] !== rankingActual[vendedorId]) {
                return true;
            }
        }
        
        // Verificar vendedores nuevos o eliminados
        const vendedoresAnteriores = Object.keys(rankingAnterior);
        const vendedoresActuales = Object.keys(rankingActual);
        
        return vendedoresAnteriores.length !== vendedoresActuales.length;
    }

    // Obtener ranking filtrado por período
    obtenerRankingPorPeriodo(periodo) {
        console.log(`Obteniendo ranking para período: ${periodo}`);
        
        const ahora = new Date();
        let fechaInicio;
        
        // Calcular fecha de inicio según el período
        switch (periodo) {
            case 'diario':
                fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
                break;
            case 'semanal':
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - ahora.getDay()); // Domingo de esta semana
                fechaInicio.setHours(0, 0, 0, 0);
                break;
            case 'mensual':
                fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
                break;
            default:
                // Fallback: mostrar todo
                fechaInicio = new Date(0);
        }
        
        console.log(`Fecha inicio para ${periodo}:`, fechaInicio);
        
        // Filtrar y calcular ventas por período
        const rankingPeriodo = this.vendedores.map(vendedor => {
            // Filtrar ventas del período
            const ventasPeriodo = vendedor.ventas.filter(venta => {
                const fechaVenta = new Date(venta.fecha);
                return fechaVenta >= fechaInicio;
            });
            
            // Calcular totales del período
            const ventasTotal = ventasPeriodo.reduce((sum, venta) => sum + venta.monto, 0);
            const numeroVentas = ventasPeriodo.length;
            
            return {
                id: vendedor.id,
                nombre: vendedor.nombre,
                ventasTotal: ventasTotal,
                numeroVentas: numeroVentas,
                ventasPeriodo: ventasPeriodo
            };
        })
        .filter(v => v.ventasTotal > 0) // Solo vendedores con ventas en el período
        .sort((a, b) => b.ventasTotal - a.ventasTotal);
        
        console.log(`Ranking ${periodo} obtenido:`, rankingPeriodo);
        return rankingPeriodo;
    }

    // Actualizar estadísticas según período actual
    actualizarEstadisticas() {
        const rankingPeriodo = this.obtenerRankingPorPeriodo(this.periodoActual);
        
        // Contar vendedores activos en el período
        const vendedoresActivos = rankingPeriodo.length;
        
        // Sumar todas las ventas del período
        const totalVentas = rankingPeriodo.reduce((sum, v) => sum + v.numeroVentas, 0);
        const montoTotal = rankingPeriodo.reduce((sum, v) => sum + v.ventasTotal, 0);
        
        document.getElementById('totalVendedores').textContent = vendedoresActivos;
        document.getElementById('totalVentas').textContent = totalVentas;
        document.getElementById('montoTotal').textContent = this.formatearMoneda(montoTotal);
    }

    // Formatear moneda
    formatearMoneda(monto) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto);
    }

    // Mostrar toast notification elegante
    mostrarToast(mensaje, tipo = 'success') {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${mensaje}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Agregar al DOM
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
        
        console.log(`📢 Toast mostrado: ${mensaje}`);
    }

    // Guardar datos en localStorage
    guardarDatos() {
        try {
            localStorage.setItem('sistemaVentas', JSON.stringify(this.vendedores));
        } catch (error) {
            console.error('Error guardando datos:', error);
        }
    }

    // Cargar datos desde localStorage
    cargarDatos() {
        try {
            const datos = localStorage.getItem('sistemaVentas');
            if (!datos) return null;
            
            const vendedores = JSON.parse(datos);
            
            // Migrar datos antiguos al nuevo formato
            return this.migrarDatosAntiguos(vendedores);
        } catch (error) {
            console.error('Error cargando datos:', error);
            return null;
        }
    }

    // Migrar datos del formato antiguo al nuevo
    migrarDatosAntiguos(vendedores) {
        console.log('Iniciando migración de datos:', vendedores);
        
        return vendedores.map(vendedor => {
            // Si ya tiene el nuevo formato, no hacer nada
            if (vendedor.ventas && Array.isArray(vendedor.ventas)) {
                console.log(`Vendedor ${vendedor.nombre} ya tiene formato nuevo`);
                return vendedor;
            }
            
            // Migrar formato antiguo
            const vendedorMigrado = {
                id: vendedor.id,
                nombre: vendedor.nombre,
                ventas: [],
                fechaRegistro: vendedor.fechaRegistro || new Date().toISOString()
            };
            
            // Si tenía ventas en formato antiguo, crear ventas individuales
            if (vendedor.ventasTotal && vendedor.numeroVentas) {
                const montoPromedio = vendedor.ventasTotal / vendedor.numeroVentas;
                const fechaBase = new Date(vendedor.ultimaVenta || vendedor.fechaRegistro || Date.now());
                
                // Crear ventas individuales distribuidas en el tiempo
                for (let i = 0; i < vendedor.numeroVentas; i++) {
                    const fechaVenta = new Date(fechaBase);
                    fechaVenta.setHours(fechaVenta.getHours() - (i * 2)); // Distribuir cada 2 horas hacia atrás
                    
                    vendedorMigrado.ventas.push({
                        id: Date.now() + i,
                        monto: montoPromedio,
                        fecha: fechaVenta.toISOString()
                    });
                }
            }
            
            console.log(`Migrado vendedor ${vendedor.nombre}:`, vendedorMigrado);
            return vendedorMigrado;
        });
    }

    // Método para limpiar todos los datos (debug)
    limpiarTodo() {
        if (confirm('🗑️ ¿Eliminar TODOS los datos?\n\nEsto borrará:\n• Todos los vendedores\n• Todas las ventas\n• Todas las estadísticas\n\n⚠️ Esta acción NO se puede deshacer.')) {
            this.vendedores = [];
            this.guardarDatos();
            this.actualizarInterfaz();
            
            // Mostrar confirmación visual
            const btn = document.getElementById('limpiarTodo');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Limpiado!';
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    // Exportar datos a CSV
    exportarCSV() {
        try {
            // Crear datos para el CSV
            const csvData = [];
            
            // Header del CSV
            csvData.push([
                'ID_Vendedor',
                'Nombre_Vendedor',
                'Fecha_Registro',
                'ID_Venta',
                'Monto_Venta',
                'Fecha_Venta',
                'Año',
                'Mes',
                'Dia',
                'Hora'
            ]);
            
            // Procesar cada vendedor y sus ventas
            this.vendedores.forEach(vendedor => {
                if (vendedor.ventas && vendedor.ventas.length > 0) {
                    // Si tiene ventas, agregar cada una
                    vendedor.ventas.forEach(venta => {
                        const fechaVenta = new Date(venta.fecha);
                        csvData.push([
                            vendedor.id,
                            vendedor.nombre,
                            vendedor.fechaRegistro,
                            venta.id,
                            venta.monto,
                            venta.fecha,
                            fechaVenta.getFullYear(),
                            fechaVenta.getMonth() + 1, // +1 porque getMonth() devuelve 0-11
                            fechaVenta.getDate(),
                            fechaVenta.getHours()
                        ]);
                    });
                } else {
                    // Si no tiene ventas, agregar solo info del vendedor
                    csvData.push([
                        vendedor.id,
                        vendedor.nombre,
                        vendedor.fechaRegistro,
                        '',
                        0,
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]);
                }
            });
            
            // Convertir array a string CSV
            const csvContent = csvData.map(row => 
                row.map(field => {
                    // Escapar comillas y envolver en comillas si es necesario
                    const stringField = String(field);
                    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                        return '"' + stringField.replace(/"/g, '""') + '"';
                    }
                    return stringField;
                }).join(',')
            ).join('\n');
            
            // Crear archivo y descargar
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                
                // Generar nombre de archivo con fecha
                const fechaHoy = new Date();
                const nombreArchivo = `ventas_${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}.csv`;
                
                link.setAttribute('download', nombreArchivo);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Feedback visual
                const btn = document.getElementById('exportarCSV');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> ¡Exportado!';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
                
                console.log(`CSV exportado: ${nombreArchivo} con ${csvData.length - 1} registros`);
            }
        } catch (error) {
            console.error('Error exportando CSV:', error);
            alert('Error al exportar el archivo CSV. Ver consola para detalles.');
        }
    }

    // Método para limpiar todos los datos (útil para testing)
    limpiarDatos() {
        if (confirm('¿Está seguro que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
            this.vendedores = [];
            this.guardarDatos();
            this.actualizarInterfaz();
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaVentas = new SistemaVentas();
   
});

// Funciones de utilidad global
window.exportarDatos = function() {
    const datos = {
        vendedores: window.sistemaVentas.vendedores,
        fechaExportacion: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.importarDatos = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (datos.vendedores && Array.isArray(datos.vendedores)) {
                window.sistemaVentas.vendedores = datos.vendedores;
                window.sistemaVentas.guardarDatos();
                window.sistemaVentas.actualizarInterfaz();
                alert('Datos importados correctamente');
            } else {
                alert('Formato de archivo inválido');
            }
        } catch (error) {
            alert('Error al importar el archivo');
        }
    };
    reader.readAsText(file);
};
