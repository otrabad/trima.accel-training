/**
 * progress.js - Sistema de seguimiento de progreso para Trima Accel Training
 * 
 * Este archivo maneja:
 * - Seguimiento del progreso del usuario a través de los módulos
 * - Actualización de la barra de progreso
 * - Cálculo de estadísticas de aprendizaje
 * - Persistencia del progreso en localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const progressBar = document.querySelector('.progress-fill');
    const progressPercentage = document.getElementById('progressPercentage');
    const completedModulesCount = document.getElementById('completedModulesCount');
    const totalModulesCount = document.getElementById('totalModulesCount');
    const profileCompletionStatus = document.getElementById('profileCompletionStatus');
    const timeSpentElement = document.getElementById('timeSpent');
    
    // Estado del progreso
    const progressState = {
        modules: {},
        totalModules: 0,
        completedModules: 0,
        startTime: null,
        totalTimeSpent: 0, // en segundos
        lastActiveTimestamp: null,
        sessionActive: false
    };
    
    // Inicializar sistema de progreso
    initProgressSystem();
    
    /**
     * Inicializa el sistema de seguimiento de progreso
     */
    function initProgressSystem() {
        // Contar el número total de módulos
        const moduleCards = document.querySelectorAll('.module-card');
        progressState.totalModules = moduleCards.length;
        
        if (totalModulesCount) {
            totalModulesCount.textContent = progressState.totalModules;
        }
        
        // Cargar progreso guardado
        loadProgress();
        
        // Actualizar UI con el progreso cargado
        updateProgressUI();
        
        // Iniciar seguimiento de tiempo
        startTimeTracking();
        
        // Configurar eventos para actualizar el progreso
        setupProgressEvents();
        
        // Configurar guardado periódico del progreso
        setInterval(saveProgress, 60000); // Guardar cada minuto
    }
    
    /**
     * Configura eventos para actualizar el progreso
     */
    function setupProgressEvents() {
        // Evento para marcar un módulo como completado
        document.addEventListener('moduleCompleted', function(e) {
            const moduleId = e.detail.moduleId;
            const score = e.detail.score || 100;
            
            markModuleAsCompleted(moduleId, score);
        });
        
        // Evento para marcar un módulo como en progreso
        document.addEventListener('moduleStarted', function(e) {
            const moduleId = e.detail.moduleId;
            
            markModuleAsInProgress(moduleId);
        });
        
        // Evento para actualizar el tiempo de una sección
        document.addEventListener('sectionCompleted', function(e) {
            const moduleId = e.detail.moduleId;
            const sectionId = e.detail.sectionId;
            const timeSpent = e.detail.timeSpent || 0;
            
            updateSectionProgress(moduleId, sectionId, timeSpent);
        });
    }
    
    /**
     * Marca un módulo como completado
     * @param {string} moduleId - ID del módulo completado
     * @param {number} score - Puntuación obtenida (0-100)
     */
    function markModuleAsCompleted(moduleId, score) {
        // Si el módulo no existe en el estado, crearlo
        if (!progressState.modules[moduleId]) {
            progressState.modules[moduleId] = {
                status: 'not-started',
                score: 0,
                sections: {},
                timeSpent: 0,
                completedAt: null
            };
        }
        
        // Solo contar como nuevo módulo completado si no estaba ya completado
        if (progressState.modules[moduleId].status !== 'completed') {
            progressState.completedModules++;
        }
        
        // Actualizar estado del módulo
        progressState.modules[moduleId].status = 'completed';
        progressState.modules[moduleId].score = score;
        progressState.modules[moduleId].completedAt = new Date().toISOString();
        
        // Actualizar UI
        updateProgressUI();
        
        // Actualizar tarjeta del módulo
        updateModuleCardStatus(moduleId, 'completed');
        
        // Guardar progreso
        saveProgress();
        
        console.log(`Módulo ${moduleId} completado con puntuación: ${score}`);
    }
    
    /**
     * Marca un módulo como en progreso
     * @param {string} moduleId - ID del módulo iniciado
     */
    function markModuleAsInProgress(moduleId) {
        // Si el módulo no existe en el estado, crearlo
        if (!progressState.modules[moduleId]) {
            progressState.modules[moduleId] = {
                status: 'not-started',
                score: 0,
                sections: {},
                timeSpent: 0,
                startedAt: null
            };
        }
        
        // Solo actualizar si no estaba ya completado
        if (progressState.modules[moduleId].status !== 'completed') {
            progressState.modules[moduleId].status = 'in-progress';
            
            // Registrar tiempo de inicio si es la primera vez
            if (!progressState.modules[moduleId].startedAt) {
                progressState.modules[moduleId].startedAt = new Date().toISOString();
            }
            
            // Actualizar tarjeta del módulo
            updateModuleCardStatus(moduleId, 'in-progress');
            
            // Guardar progreso
            saveProgress();
            
            console.log(`Módulo ${moduleId} iniciado`);
        }
    }
    
    /**
     * Actualiza el progreso de una sección específica
     * @param {string} moduleId - ID del módulo
     * @param {string} sectionId - ID de la sección
     * @param {number} timeSpent - Tiempo dedicado en segundos
     */
    function updateSectionProgress(moduleId, sectionId, timeSpent) {
        // Si el módulo no existe en el estado, crearlo
        if (!progressState.modules[moduleId]) {
            progressState.modules[moduleId] = {
                status: 'in-progress',
                score: 0,
                sections: {},
                timeSpent: 0
            };
        }
        
        // Si la sección no existe, crearla
        if (!progressState.modules[moduleId].sections[sectionId]) {
            progressState.modules[moduleId].sections[sectionId] = {
                completed: false,
                timeSpent: 0
            };
        }
        
        // Marcar sección como completada
        progressState.modules[moduleId].sections[sectionId].completed = true;
        progressState.modules[moduleId].sections[sectionId].timeSpent += timeSpent;
        
        // Actualizar tiempo total del módulo
        progressState.modules[moduleId].timeSpent += timeSpent;
        
        // Guardar progreso
        saveProgress();
        
        console.log(`Sección ${sectionId} del módulo ${moduleId} completada. Tiempo: ${timeSpent}s`);
    }
    
    /**
     * Actualiza la interfaz de usuario con el progreso actual
     */
    function updateProgressUI() {
        // Calcular porcentaje de progreso
        const progressPercentageValue = progressState.totalModules > 0 
            ? Math.round((progressState.completedModules / progressState.totalModules) * 100) 
            : 0;
        
        // Actualizar barra de progreso
        if (progressBar) {
            progressBar.style.width = `${progressPercentageValue}%`;
        }
        
        // Actualizar texto de porcentaje
        if (progressPercentage) {
            progressPercentage.textContent = `${progressPercentageValue}%`;
        }
        
        // Actualizar contador de módulos completados
        if (completedModulesCount) {
            completedModulesCount.textContent = progressState.completedModules;
        }
        
        // Actualizar estado de perfil
        if (profileCompletionStatus) {
            let statusText = 'No iniciado';
            
            if (progressPercentageValue === 100) {
                statusText = 'Completado';
                profileCompletionStatus.className = 'status-completed';
            } else if (progressPercentageValue > 0) {
                statusText = 'En progreso';
                profileCompletionStatus.className = 'status-in-progress';
            } else {
                profileCompletionStatus.className = 'status-not-started';
            }
            
            profileCompletionStatus.textContent = statusText;
        }
        
        // Actualizar tiempo total dedicado
        updateTimeDisplay();
    }
    
    /**
     * Actualiza el estado visual de una tarjeta de módulo
     * @param {string} moduleId - ID del módulo
     * @param {string} status - Estado ('not-started', 'in-progress', 'completed')
     */
    function updateModuleCardStatus(moduleId, status) {
        const moduleCard = document.querySelector(`.module-card[data-module="${moduleId}"]`);
        
        if (moduleCard) {
            // Eliminar clases de estado anteriores
            moduleCard.classList.remove('not-started', 'in-progress', 'completed');
            
            // Añadir nueva clase de estado
            moduleCard.classList.add(status);
            
            // Actualizar atributo de datos
            moduleCard.setAttribute('data-status', status);
            
            // Si el módulo está completado, desbloquear el siguiente
            if (status === 'completed') {
                const nextModuleCard = moduleCard.nextElementSibling;
                
                if (nextModuleCard && nextModuleCard.classList.contains('module-card') && 
                    nextModuleCard.classList.contains('locked')) {
                    nextModuleCard.classList.remove('locked');
                    
                    // Habilitar botón
                    const moduleButton = nextModuleCard.querySelector('.btn-module');
                    if (moduleButton) {
                        moduleButton.disabled = false;
                    }
                }
            }
        }
    }
    
    /**
     * Inicia el seguimiento del tiempo de la sesión
     */
    function startTimeTracking() {
        // Registrar tiempo de inicio
        progressState.startTime = new Date();
        progressState.lastActiveTimestamp = new Date();
        progressState.sessionActive = true;
        
        // Configurar evento para detectar inactividad
        document.addEventListener('mousemove', updateLastActiveTime);
        document.addEventListener('keydown', updateLastActiveTime);
        document.addEventListener('click', updateLastActiveTime);
        document.addEventListener('scroll', updateLastActiveTime);
        
        // Comprobar actividad cada minuto
        setInterval(checkActivity, 60000);
        
        // Actualizar contador de tiempo cada segundo
        setInterval(updateTimeDisplay, 1000);
        
        // Guardar tiempo al cerrar la página
        window.addEventListener('beforeunload', function() {
            saveTimeSpent();
        });
    }
    
    /**
     * Actualiza la marca de tiempo de la última actividad
     */
    function updateLastActiveTime() {
        progressState.lastActiveTimestamp = new Date();
        
        // Si la sesión estaba inactiva, reactivarla
        if (!progressState.sessionActive) {
            progressState.sessionActive = true;
            progressState.startTime = new Date();
        }
    }
    
    /**
     * Comprueba si el usuario está activo
     */
    function checkActivity() {
        const now = new Date();
        const timeSinceLastActivity = (now - progressState.lastActiveTimestamp) / 1000; // en segundos
        
        // Si han pasado más de 5 minutos sin actividad, considerar sesión inactiva
        if (timeSinceLastActivity > 300) { // 5 minutos
            if (progressState.sessionActive) {
                progressState.sessionActive = false;
                saveTimeSpent();
            }
        }
    }
    
    /**
     * Guarda el tiempo dedicado en la sesión actual
     */
    function saveTimeSpent() {
        if (progressState.sessionActive && progressState.startTime) {
            const now = new Date();
            const sessionTime = Math.floor((now - progressState.startTime) / 1000); // en segundos
            
            progressState.totalTimeSpent += sessionTime;
            progressState.startTime = now;
            
            // Guardar en localStorage
            saveProgress();
        }
    }
    
    /**
     * Actualiza la visualización del tiempo total dedicado
     */
    function updateTimeDisplay() {
        if (timeSpentElement) {
            let totalSeconds = progressState.totalTimeSpent;
            
            // Añadir tiempo de la sesión actual si está activa
            if (progressState.sessionActive && progressState.startTime) {
                const now = new Date();
                const sessionTime = Math.floor((now - progressState.startTime) / 1000);
                totalSeconds += sessionTime;
            }
            
            // Convertir a formato horas:minutos:segundos
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timeSpentElement.textContent = timeString;
        }
    }
    
    /**
     * Guarda el progreso en localStorage
     */
    function saveProgress() {
        // Guardar tiempo de la sesión actual antes de almacenar
        saveTimeSpent();
        
        const progressData = {
            modules: progressState.modules,
            completedModules: progressState.completedModules,
            totalModules: progressState.totalModules,
            totalTimeSpent: progressState.totalTimeSpent,
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('trimaAccelTrainingProgress', JSON.stringify(progressData));
        console.log('Progreso guardado:', new Date().toLocaleTimeString());
    }
    
    /**
     * Carga el progreso desde localStorage
     */
    function loadProgress() {
        const savedProgress = localStorage.getItem('trimaAccelTrainingProgress');
        
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                
                // Restaurar datos guardados
                progressState.modules = progressData.modules || {};
                progressState.completedModules = progressData.completedModules || 0;
                progressState.totalTimeSpent = progressData.totalTimeSpent || 0;
                
                // Contar módulos completados (por si acaso)
                let completedCount = 0;
                for (const moduleId in progressState.modules) {
                    if (progressState.modules[moduleId].status === 'completed') {
                        completedCount++;
                        
                        // Actualizar UI de la tarjeta
                        updateModuleCardStatus(moduleId, 'completed');
                    } else if (progressState.modules[moduleId].status === 'in-progress') {
                        // Actualizar UI de la tarjeta
                        updateModuleCardStatus(moduleId, 'in-progress');
                    }
                }
                
                // Verificar que el recuento sea correcto
                progressState.completedModules = completedCount;
                
                console.log('Progreso cargado. Módulos completados:', completedCount);
            } catch (error) {
                console.error('Error al cargar el progreso:', error);
            }
        }
    }
    
    /**
     * Obtiene estadísticas de aprendizaje
     * @returns {Object} Objeto con estadísticas
     */
    function getStatistics() {
        const stats = {
            completedModules: progressState.completedModules,
            totalModules: progressState.totalModules,
            progressPercentage: progressState.totalModules > 0 
                ? Math.round((progressState.completedModules / progressState.totalModules) * 100) 
                : 0,
            totalTimeSpent: progressState.totalTimeSpent,
            averageScore: 0,
            moduleStats: []
        };
        
        // Calcular puntuación media y estadísticas por módulo
        let totalScore = 0;
        let scoredModules = 0;
        
        for (const moduleId in progressState.modules) {
            const module = progressState.modules[moduleId];
            
            if (module.status === 'completed') {
                totalScore += module.score;
                scoredModules++;
                
                stats.moduleStats.push({
                    moduleId,
                    status: module.status,
                    score: module.score,
                    timeSpent: module.timeSpent,
                    completedAt: module.completedAt
                });
            }
        }
        
        if (scoredModules > 0) {
            stats.averageScore = Math.round(totalScore / scoredModules);
        }
        
        return stats;
    }
    
    // Exponer funciones para uso externo
    window.progressTracker = {
        markModuleAsCompleted,
        markModuleAsInProgress,
        updateSectionProgress,
        getStatistics,
        saveProgress,
        loadProgress
    };
});
