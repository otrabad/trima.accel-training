/**
 * navigation.js - Sistema de navegación para Trima Accel Training
 * 
 * Este archivo maneja:
 * - Navegación entre páginas principales (Inicio, Módulos, Recursos, etc.)
 * - Navegación dentro de los módulos (secciones, evaluaciones)
 * - Menú responsivo para dispositivos móviles
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const mainNav = document.getElementById('mainNav');
    const navList = document.getElementById('navList');
    const menuToggle = document.getElementById('menuToggle');
    const mainContainer = document.getElementById('mainContainer');
    const backToModulesBtn = document.getElementById('backToModulesBtn');
    const startLearningBtn = document.getElementById('startLearningBtn');
    const resumeLearningBtn = document.getElementById('resumeLearningBtn');
    const prevSectionBtn = document.getElementById('prevSectionBtn');
    const nextSectionBtn = document.getElementById('nextSectionBtn');
    
    // Estado de la aplicación
    const appState = {
        currentPage: 'home',
        currentModule: null,
        currentSection: 0,
        moduleProgress: {},
        lastVisitedModule: null
    };
    
    // Inicializar navegación
    initNavigation();
    
    /**
     * Inicializa los eventos de navegación
     */
    function initNavigation() {
        // Navegación principal
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                navigateToPage(targetPage);
            });
        });
        
        // Menú móvil
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                navList.classList.toggle('show');
            });
        }
        
        // Botones de inicio
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', function() {
                navigateToPage('modules');
            });
        }
        
        if (resumeLearningBtn) {
            resumeLearningBtn.addEventListener('click', function() {
                if (appState.lastVisitedModule) {
                    loadModule(appState.lastVisitedModule);
                } else {
                    navigateToPage('modules');
                }
            });
        }
        
        // Navegación de módulos
        const moduleButtons = document.querySelectorAll('.btn-module');
        moduleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const moduleId = this.getAttribute('data-module');
                const action = this.getAttribute('data-action');
                
                if (action === 'start') {
                    loadModule(moduleId);
                }
            });
        });
        
        // Botón volver a módulos
        if (backToModulesBtn) {
            backToModulesBtn.addEventListener('click', function() {
                navigateToPage('modules');
            });
        }
        
        // Botones de navegación de secciones
        if (prevSectionBtn) {
            prevSectionBtn.addEventListener('click', function() {
                navigateToSection(appState.currentSection - 1);
            });
        }
        
        if (nextSectionBtn) {
            nextSectionBtn.addEventListener('click', function() {
                navigateToSection(appState.currentSection + 1);
            });
        }
        
        // Cargar estado guardado
        loadSavedState();
    }
    
    /**
     * Navega a la página especificada
     * @param {string} pageId - ID de la página destino
     */
    function navigateToPage(pageId) {
        // Ocultar todas las páginas
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Mostrar la página seleccionada
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Actualizar navegación
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
        
        // Cerrar menú móvil si está abierto
        navList.classList.remove('show');
        
        // Actualizar estado
        appState.currentPage = pageId;
        saveState();
        
        // Scroll al inicio
        window.scrollTo(0, 0);
    }
    
    /**
     * Carga un módulo específico
     * @param {string} moduleId - ID del módulo a cargar
     */
    function loadModule(moduleId) {
        // Actualizar estado
        appState.currentModule = moduleId;
        appState.currentSection = 0;
        appState.lastVisitedModule = moduleId;
        
        // Actualizar título del módulo
        const moduleCard = document.querySelector(`.module-card[data-module="${moduleId}"]`);
        if (moduleCard) {
            const moduleTitle = moduleCard.querySelector('h3').textContent;
            document.getElementById('currentModuleTitle').textContent = moduleTitle;
        }
        
        // Navegar a la página de contenido del módulo
        navigateToPage('moduleContent');
        
        // Cargar contenido del módulo
        loadModuleContent(moduleId);
        
        saveState();
    }
    
    /**
     * Carga el contenido de un módulo desde un archivo externo
     * @param {string} moduleId - ID del módulo a cargar
     */
    function loadModuleContent(moduleId) {
        const moduleContainer = document.getElementById('moduleContainer');
        
        // Mostrar spinner de carga
        moduleContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando contenido...</p>
            </div>
        `;
        
        // Simular carga de contenido (en una aplicación real, aquí cargarías el contenido desde un archivo)
        setTimeout(() => {
            // Esta es una simulación. En una implementación real, cargarías el contenido desde un archivo Markdown
            moduleContainer.innerHTML = `
                <div class="module-section">
                    <h2>Introducción</h2>
                    <p>Este es el contenido de ejemplo para el módulo ${moduleId}.</p>
                    <p>En una implementación completa, este contenido se cargaría desde un archivo Markdown externo y se convertiría a HTML.</p>
                </div>
                <div class="module-section">
                    <h2>Contenido principal</h2>
                    <p>Aquí iría el contenido principal del módulo, con explicaciones detalladas, imágenes y ejemplos interactivos.</p>
                </div>
                <div class="module-section">
                    <h2>Evaluación</h2>
                    <p>Al final de cada módulo, se presenta una evaluación para comprobar el aprendizaje.</p>
                    <button id="startQuizBtn" class="btn btn-primary">Iniciar evaluación</button>
                </div>
            `;
            
            // Añadir evento al botón de evaluación
            const startQuizBtn = document.getElementById('startQuizBtn');
            if (startQuizBtn) {
                startQuizBtn.addEventListener('click', function() {
                    loadQuiz(moduleId);
                });
            }
            
            updateSectionNavigation();
        }, 1000);
    }
    
    /**
     * Navega a una sección específica dentro del módulo actual
     * @param {number} sectionIndex - Índice de la sección
     */
    function navigateToSection(sectionIndex) {
        const sections = document.querySelectorAll('.module-section');
        
        if (sectionIndex >= 0 && sectionIndex < sections.length) {
            appState.currentSection = sectionIndex;
            
            // Scroll a la sección
            sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
            
            updateSectionNavigation();
            saveState();
        }
    }
    
    /**
     * Actualiza los botones de navegación de secciones
     */
    function updateSectionNavigation() {
        const sections = document.querySelectorAll('.module-section');
        
        if (sections.length > 0) {
            // Habilitar/deshabilitar botón anterior
            prevSectionBtn.disabled = (appState.currentSection === 0);
            
            // Habilitar/deshabilitar botón siguiente
            nextSectionBtn.disabled = (appState.currentSection === sections.length - 1);
        }
    }
    
    /**
     * Carga una evaluación para el módulo especificado
     * @param {string} moduleId - ID del módulo
     */
    function loadQuiz(moduleId) {
        // Navegar a la página de evaluación
        navigateToPage('quiz');
        
        // Actualizar título de la evaluación
        document.getElementById('quizTitle').textContent = `Evaluación del Módulo ${moduleId.replace('module', '')}`;
        
        // Simular carga de preguntas (en una aplicación real, cargarías desde un archivo JSON)
        const quizContainer = document.getElementById('quizContainer');
        quizContainer.innerHTML = `
            <div class="quiz-question">
                <p class="question-text">1. ¿Cuál es la función principal del sistema Trima Accel?</p>
                <ul class="question-options">
                    <li class="question-option">
                        <input type="radio" name="q1" id="q1_a" value="a">
                        <label for="q1_a">Análisis de muestras sanguíneas</label>
                    </li>
                    <li class="question-option">
                        <input type="radio" name="q1" id="q1_b" value="b">
                        <label for="q1_b">Recolección de componentes sanguíneos</label>
                    </li>
                    <li class="question-option">
                        <input type="radio" name="q1" id="q1_c" value="c">
                        <label for="q1_c">Almacenamiento de sangre</label>
                    </li>
                </ul>
            </div>
            <div class="quiz-question">
                <p class="question-text">2. ¿Qué información del donante es esencial antes de iniciar un procedimiento?</p>
                <ul class="question-options">
                    <li class="question-option">
                        <input type="radio" name="q2" id="q2_a" value="a">
                        <label for="q2_a">Solo el nombre</label>
                    </li>
                    <li class="question-option">
                        <input type="radio" name="q2" id="q2_b" value="b">
                        <label for="q2_b">Peso y altura</label>
                    </li>
                    <li class="question-option">
                        <input type="radio" name="q2" id="q2_c" value="c">
                        <label for="q2_c">Peso, altura, género y hematocrito</label>
                    </li>
                </ul>
            </div>
        `;
        
        // Configurar botón de envío
        const submitQuizBtn = document.getElementById('submitQuizBtn');
        if (submitQuizBtn) {
            submitQuizBtn.addEventListener('click', function() {
                showQuizResults();
            });
        }
    }
    
    /**
     * Muestra los resultados de la evaluación
     */
    function showQuizResults() {
        // Navegar a la página de resultados
        navigateToPage('quizResults');
        
        // Simular resultados
        document.getElementById('scorePercentage').textContent = '75%';
        document.getElementById('correctAnswers').textContent = '3';
        document.getElementById('totalQuestions').textContent = '4';
        
        // Configurar círculo de puntuación
        const scoreCircle = document.getElementById('scoreCircle');
        scoreCircle.style.setProperty('--score-height', '75%');
        
        // Mostrar retroalimentación
        const resultsFeedback = document.getElementById('resultsFeedback');
        resultsFeedback.innerHTML = `
            <div class="feedback-item correct">
                <p class="question">1. ¿Cuál es la función principal del sistema Trima Accel?</p>
                <p class="answer">Tu respuesta: Recolección de componentes sanguíneos</p>
                <p class="correct-answer">¡Correcto!</p>
            </div>
            <div class="feedback-item incorrect">
                <p class="question">2. ¿Qué información del donante es esencial antes de iniciar un procedimiento?</p>
                <p class="answer">Tu respuesta: Peso y altura</p>
                <p class="correct-answer">Respuesta correcta: Peso, altura, género y hematocrito</p>
            </div>
        `;
        
        // Configurar botones
        const retryQuizBtn = document.getElementById('retryQuizBtn');
        const continueBtn = document.getElementById('continueBtn');
        
        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', function() {
                loadQuiz(appState.currentModule);
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                // Marcar módulo como completado si la puntuación es suficiente
                if (!appState.moduleProgress[appState.currentModule]) {
                    appState.moduleProgress[appState.currentModule] = {
                        status: 'completed',
                        score: 75
                    };
                    
                    // Actualizar UI del módulo
                    updateModuleStatus();
                    
                    // Guardar estado
                    saveState();
                }
                
                // Volver a la lista de módulos
                navigateToPage('modules');
            });
        }
    }
    
    /**
     * Actualiza el estado visual de los módulos en la interfaz
     */
    function updateModuleStatus() {
        const moduleCards = document.querySelectorAll('.module-card');
        
        moduleCards.forEach((card, index) => {
            const moduleId = card.getAttribute('data-module');
            const progress = appState.moduleProgress[moduleId];
            
            if (progress) {
                card.setAttribute('data-status', progress.status);
                
                // Desbloquear el siguiente módulo si este está completado
                if (progress.status === 'completed' && index < moduleCards.length - 1) {
                    const nextCard = moduleCards[index + 1];
                    nextCard.classList.remove('locked');
                    const nextButton = nextCard.querySelector('.btn-module');
                    if (nextButton) {
                        nextButton.disabled = false;
                    }
                }
            }
        });
    }
    
    /**
     * Guarda el estado actual de la aplicación en localStorage
     */
    function saveState() {
        const state = {
            currentPage: appState.currentPage,
            currentModule: appState.currentModule,
            currentSection: appState.currentSection,
            moduleProgress: appState.moduleProgress,
            lastVisitedModule: appState.lastVisitedModule
        };
        
        localStorage.setItem('trimaAccelTrainingState', JSON.stringify(state));
    }
    
    /**
     * Carga el estado guardado desde localStorage
     */
    function loadSavedState() {
        const savedState = localStorage.getItem('trimaAccelTrainingState');
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Restaurar estado
            appState.currentModule = state.currentModule;
            appState.currentSection = state.currentSection;
            appState.moduleProgress = state.moduleProgress || {};
            appState.lastVisitedModule = state.lastVisitedModule;
            
            // Actualizar UI
            updateModuleStatus();
            
            // Mostrar botón de continuar si hay un módulo visitado anteriormente
            if (appState.lastVisitedModule && startLearningBtn && resumeLearningBtn) {
                startLearningBtn.style.display = 'none';
                resumeLearningBtn.style.display = 'inline-block';
            }
        }
    }
});
