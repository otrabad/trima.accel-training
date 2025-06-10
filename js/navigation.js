/**
 * navigation.js - Sistema de navegación para Trima Accel Training
 * 
 * Este archivo maneja:
 * - Navegación entre páginas
 * - Carga de contenido de módulos
 * - Navegación entre secciones de un módulo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const backToModulesBtn = document.getElementById('backToModulesBtn');
    const prevSectionBtn = document.getElementById('prevSectionBtn');
    const nextSectionBtn = document.getElementById('nextSectionBtn');
    const moduleContainer = document.getElementById('moduleContainer');
    
    // Estado de la navegación
    const navState = {
        currentPage: 'home',
        currentModule: null,
        moduleLoaded: false
    };
    
    // Inicializar sistema de navegación
    initNavigation();
    
    /**
     * Inicializa el sistema de navegación
     */
    function initNavigation() {
        // Configurar enlaces de navegación
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                navigateTo(targetPage);
            });
        });
        
        // Configurar botón de volver a módulos
        if (backToModulesBtn) {
            backToModulesBtn.addEventListener('click', function() {
                navigateTo('modules');
            });
        }
        
        // Configurar botones de navegación entre secciones
        if (prevSectionBtn) {
            prevSectionBtn.addEventListener('click', navigateToPreviousSection);
        }
        
        if (nextSectionBtn) {
            nextSectionBtn.addEventListener('click', navigateToNextSection);
        }
        
        // Determinar página inicial basada en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        const moduleParam = urlParams.get('module');
        
        if (pageParam) {
            navigateTo(pageParam, moduleParam);
        } else {
            // Mostrar página de inicio por defecto
            navigateTo('home');
        }
        
        // Exponer función de navegación globalmente
        window.navigateTo = navigateTo;
    }
    
    /**
     * Navega a una página específica
     * @param {string} page - Página a mostrar
     * @param {string} [moduleId] - ID del módulo (opcional)
     */
    function navigateTo(page, moduleId) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(p => {
            p.style.display = 'none';
        });
        
        // Actualizar enlaces de navegación
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Mostrar página solicitada
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.style.display = 'block';
        }
        
        // Actualizar estado de navegación
        navState.currentPage = page;
        
        // Acciones específicas según la página
        switch (page) {
            case 'modules':
                loadModules();
                break;
            case 'moduleContent':
                if (moduleId) {
                    loadModuleContent(moduleId);
                    navState.currentModule = moduleId;
                } else if (navState.currentModule) {
                    loadModuleContent(navState.currentModule);
                } else {
                    // Si no hay módulo especificado, volver a la lista de módulos
                    navigateTo('modules');
                }
                break;
        }
        
        // Actualizar URL para reflejar la navegación
        updateURL(page, moduleId);
    }
    
    /**
     * Actualiza la URL para reflejar la navegación actual
     * @param {string} page - Página actual
     * @param {string} [moduleId] - ID del módulo (opcional)
     */
    function updateURL(page, moduleId) {
        let url = `?page=${page}`;
        if (moduleId) {
            url += `&module=${moduleId}`;
        }
        
        window.history.pushState({
            page: page,
            module: moduleId
        }, '', url);
    }
    
    /**
     * Carga la lista de módulos disponibles
     */
    function loadModules() {
        const modulesContainer = document.getElementById('modulesContainer');
        if (!modulesContainer) return;
        
        // Mostrar spinner de carga
        modulesContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando módulos...</p>
            </div>
        `;
        
        // Simular carga de datos (en una implementación real, esto cargaría desde una API o JSON)
        setTimeout(() => {
            // Datos de ejemplo para los módulos
            const modules = [
                {
                    id: 'module1',
                    title: 'Introducción de la información del donante',
                    description: 'Aprende a introducir correctamente los datos del donante en el sistema Trima Accel.',
                    duration: '15 minutos',
                    progress: 0,
                    status: 'not-started' // not-started, in-progress, completed
                },
                {
                    id: 'module2',
                    title: 'Configuración del procedimiento',
                    description: 'Aprende a configurar correctamente los parámetros del procedimiento en el sistema Trima Accel.',
                    duration: '20 minutos',
                    progress: 0,
                    status: 'not-started'
                },
                {
                    id: 'module3',
                    title: 'Manejo de alarmas y alertas',
                    description: 'Aprende a identificar y responder a las diferentes alarmas y alertas del sistema Trima Accel.',
                    duration: '25 minutos',
                    progress: 0,
                    status: 'not-started'
                }
            ];
            
            // Obtener progreso guardado
            const savedProgress = JSON.parse(localStorage.getItem('trimaAccelProgress') || '{}');
            
            // Actualizar progreso de los módulos
            modules.forEach(module => {
                if (savedProgress[module.id]) {
                    module.progress = savedProgress[module.id].progress;
                    module.status = savedProgress[module.id].status;
                }
            });
            
            // Renderizar módulos
            modulesContainer.innerHTML = '';
            
            modules.forEach(module => {
                const moduleCard = createModuleCard(module);
                modulesContainer.appendChild(moduleCard);
            });
        }, 1000);
    }
    
    /**
     * Crea una tarjeta para un módulo
     * @param {Object} module - Datos del módulo
     * @returns {HTMLElement} Elemento de la tarjeta
     */
    function createModuleCard(module) {
        const card = document.createElement('div');
        card.className = `module-card ${module.status}`;
        
        // Determinar texto del botón según el estado
        let buttonText = 'Comenzar';
        if (module.status === 'in-progress') {
            buttonText = 'Continuar';
        } else if (module.status === 'completed') {
            buttonText = 'Repasar';
        }
        
        card.innerHTML = `
            <div class="module-info">
                <h3 class="module-title">${module.title}</h3>
                <p class="module-description">${module.description}</p>
                <div class="module-meta">
                    <span class="module-duration"><i class="far fa-clock"></i> ${module.duration}</span>
                    <span class="module-status">${getStatusText(module.status)}</span>
                </div>
            </div>
            <div class="module-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${module.progress}%"></div>
                </div>
                <span class="progress-text">${module.progress}% completado</span>
            </div>
            <div class="module-actions">
                <button class="btn btn-primary start-module" data-module-id="${module.id}">${buttonText}</button>
            </div>
        `;
        
        // Configurar evento para el botón de inicio
        const startButton = card.querySelector('.start-module');
        startButton.addEventListener('click', function() {
            const moduleId = this.getAttribute('data-module-id');
            navigateTo('moduleContent', moduleId);
        });
        
        return card;
    }
    
    /**
     * Obtiene el texto de estado para un módulo
     * @param {string} status - Estado del módulo
     * @returns {string} Texto del estado
     */
    function getStatusText(status) {
        switch (status) {
            case 'not-started':
                return 'No iniciado';
            case 'in-progress':
                return 'En progreso';
            case 'completed':
                return 'Completado';
            default:
                return '';
        }
    }
    
    /**
     * Carga el contenido de un módulo desde un archivo externo
     * @param {string} moduleId - ID del módulo a cargar
     */
    function loadModuleContent(moduleId) {
        const moduleContainer = document.getElementById('moduleContainer');
        if (!moduleContainer) return;
        
        // Actualizar título del módulo en la navegación
        const currentModuleTitle = document.getElementById('currentModuleTitle');
        if (currentModuleTitle) {
            switch (moduleId) {
                case 'module1':
                    currentModuleTitle.textContent = 'Introducción de la información del donante';
                    break;
                case 'module2':
                    currentModuleTitle.textContent = 'Configuración del procedimiento';
                    break;
                case 'module3':
                    currentModuleTitle.textContent = 'Manejo de alarmas y alertas';
                    break;
                default:
                    currentModuleTitle.textContent = 'Contenido del módulo';
            }
        }
        
        // Mostrar spinner de carga
        moduleContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando contenido...</p>
            </div>
        `;
        
        // Cargar contenido desde archivo Markdown
        fetch(`modules/${moduleId}.md`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el contenido del módulo');
                }
                return response.text();
            })
            .then(markdown => {
                // Convertir Markdown a HTML
                const html = marked.parse(markdown);
                
                // Insertar HTML en el contenedor
                moduleContainer.innerHTML = html;
                
                // Añadir clases a los encabezados h2 para la navegación por secciones
                moduleContainer.querySelectorAll('h2').forEach(h2 => {
                    h2.classList.add('section-title');
                });
                
                // Configurar botón de evaluación
                setupQuizButton(moduleId);
                
                // Inicializar navegación entre secciones
                initSectionNavigation();
                
                // Actualizar estado del módulo a "en progreso"
                updateModuleProgress(moduleId, 'in-progress', 25);
                
                // Marcar módulo como cargado
                navState.moduleLoaded = true;
            })
            .catch(error => {
                console.error('Error:', error);
                moduleContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.</p>
                    </div>
                `;
            });
    }
    
    /**
     * Configura el botón de inicio de evaluación
     * @param {string} moduleId - ID del módulo
     */
    function setupQuizButton(moduleId) {
        // Buscar todos los botones con texto "Iniciar evaluación"
        const quizButtons = Array.from(document.querySelectorAll('button')).filter(
            button => button.textContent.includes('Iniciar evaluación')
        );
        
        quizButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Disparar evento para cargar la evaluación
                const event = new CustomEvent('loadQuiz', {
                    detail: { moduleId: moduleId }
                });
                document.dispatchEvent(event);
                
                // Navegar a la página de evaluación
                navigateTo('quiz', moduleId);
            });
        });
    }
    
    // Variables para la navegación entre secciones
    let currentSectionIndex = 0;
    let moduleSections = [];
    
    /**
     * Inicializa la navegación entre secciones
     */
    function initSectionNavigation() {
        // Obtener todas las secciones del módulo (elementos con encabezados h2)
        moduleSections = Array.from(document.querySelectorAll('.module-content h2.section-title')).map(
            heading => heading.parentElement || heading
        );
        
        // Si no hay secciones, deshabilitar botones
        if (moduleSections.length <= 1) {
            if (prevSectionBtn) prevSectionBtn.disabled = true;
            if (nextSectionBtn) nextSectionBtn.disabled = true;
            return;
        }
        
        // Inicializar en la primera sección
        currentSectionIndex = 0;
        updateNavigationButtonsState();
    }
    
    /**
     * Navega a la sección anterior
     */
    function navigateToPreviousSection() {
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            scrollToCurrentSection();
            updateNavigationButtonsState();
        }
    }
    
    /**
     * Navega a la siguiente sección
     */
    function navigateToNextSection() {
        if (currentSectionIndex < moduleSections.length - 1) {
            currentSectionIndex++;
            scrollToCurrentSection();
            updateNavigationButtonsState();
            
            // Si es la última sección, actualizar progreso
            if (currentSectionIndex === moduleSections.length - 1 && navState.currentModule) {
                updateModuleProgress(navState.currentModule, 'in-progress', 75);
            }
        }
    }
    
    /**
     * Desplaza la vista a la sección actual
     */
    function scrollToCurrentSection() {
        const currentSection = moduleSections[currentSectionIndex];
        if (currentSection) {
            // Usar un pequeño offset para evitar que el encabezado quede bajo la barra de navegación
            const offset = 20;
            const sectionTop = currentSection.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Actualiza el estado de los botones de navegación
     */
    function updateNavigationButtonsState() {
        if (prevSectionBtn) {
            prevSectionBtn.disabled = currentSectionIndex === 0;
        }
        
        if (nextSectionBtn) {
            nextSectionBtn.disabled = currentSectionIndex === moduleSections.length - 1;
        }
    }
    
    /**
     * Actualiza el progreso de un módulo
     * @param {string} moduleId - ID del módulo
     * @param {string} status - Estado del módulo
     * @param {number} progress - Porcentaje de progreso
     */
    function updateModuleProgress(moduleId, status, progress) {
        // Obtener progreso guardado
        const savedProgress = JSON.parse(localStorage.getItem('trimaAccelProgress') || '{}');
        
        // Actualizar progreso
        savedProgress[moduleId] = {
            status: status,
            progress: progress,
            lastUpdated: new Date().toISOString()
        };
        
        // Guardar progreso actualizado
        localStorage.setItem('trimaAccelProgress', JSON.stringify(savedProgress));
        
        // Disparar evento de progreso actualizado
        const event = new CustomEvent('progressUpdated', {
            detail: {
                moduleId: moduleId,
                status: status,
                progress: progress
            }
        });
        document.dispatchEvent(event);
    }
    
    // Manejar eventos de navegación del navegador
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            navigateTo(event.state.page, event.state.module);
        } else {
            navigateTo('home');
        }
    });
    
    // Escuchar evento de módulo completado
    document.addEventListener('moduleCompleted', function(e) {
        const moduleId = e.detail.moduleId;
        updateModuleProgress(moduleId, 'completed', 100);
    });
});
