/**
 * quiz.js - Sistema de evaluaciones para Trima Accel Training
 * 
 * Este archivo maneja:
 * - Carga de preguntas desde archivos JSON
 * - Presentación de evaluaciones interactivas
 * - Validación de respuestas
 * - Cálculo de puntuaciones
 * - Retroalimentación personalizada
 * - Registro de resultados
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const quizContainer = document.getElementById('quizContainer');
    const quizTitle = document.getElementById('quizTitle');
    const questionCounter = document.getElementById('questionCounter');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizFeedback = document.getElementById('quizFeedback');
    const quizResults = document.getElementById('quizResults');
    const scorePercentage = document.getElementById('scorePercentage');
    const scoreCircle = document.getElementById('scoreCircle');
    const correctAnswers = document.getElementById('correctAnswers');
    const totalQuestions = document.getElementById('totalQuestions');
    const resultsFeedback = document.getElementById('resultsFeedback');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    const continueBtn = document.getElementById('continueBtn');
    
    // Estado de la evaluación
    const quizState = {
        currentQuiz: null,
        questions: [],
        userAnswers: {},
        submitted: false,
        score: 0,
        moduleId: null,
        timeStarted: null,
        timeCompleted: null,
        attempts: 0,
        quizData: null
    };
    
    // Inicializar sistema de evaluaciones
    initQuizSystem();
    
    /**
     * Inicializa el sistema de evaluaciones
     */
    function initQuizSystem() {
        // Escuchar evento para cargar una evaluación
        document.addEventListener('loadQuiz', function(e) {
            const moduleId = e.detail.moduleId;
            loadQuiz(moduleId);
        });
        
        // Configurar evento para el botón de envío
        if (submitQuizBtn) {
            submitQuizBtn.addEventListener('click', submitQuiz);
        }
        
        // Configurar evento para el botón de reintentar
        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', retryQuiz);
        }
        
        // Configurar evento para el botón de continuar
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                // Disparar evento de módulo completado
                const event = new CustomEvent('moduleCompleted', {
                    detail: {
                        moduleId: quizState.moduleId,
                        score: quizState.score
                    }
                });
                document.dispatchEvent(event);
                
                // Navegar a la página de módulos (usando el sistema de navegación)
                if (window.navigateTo) {
                    window.navigateTo('modules');
                }
            });
        }
    }
    
    /**
     * Carga una evaluación para el módulo especificado
     * @param {string} moduleId - ID del módulo
     */
    function loadQuiz(moduleId) {
        // Reiniciar estado
        resetQuizState();
        
        // Guardar ID del módulo
        quizState.moduleId = moduleId;
        
        // Registrar tiempo de inicio
        quizState.timeStarted = new Date();
        
        // Incrementar contador de intentos
        quizState.attempts++;
        
        // Actualizar título
        if (quizTitle) {
            quizTitle.textContent = `Evaluación del Módulo ${moduleId.replace('module', '')}`;
        }
        
        // Mostrar spinner de carga
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando evaluación...</p>
                </div>
            `;
        }
        
        // Cargar preguntas desde archivo JSON
        fetchQuizData(moduleId)
            .then(data => {
                quizState.quizData = data;
                quizState.questions = data.questions;
                
                // Actualizar contador de preguntas
                if (totalQuestions) {
                    totalQuestions.textContent = quizState.questions.length;
                }
                
                // Renderizar preguntas
                renderQuiz();
            })
            .catch(error => {
                console.error('Error al cargar la evaluación:', error);
                
                // Mostrar mensaje de error
                if (quizContainer) {
                    quizContainer.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Error al cargar la evaluación. Por favor, inténtalo de nuevo más tarde.</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            });
    }
    
    /**
     * Obtiene los datos de la evaluación desde un archivo JSON
     * @param {string} moduleId - ID del módulo
     * @returns {Promise<Object>} Promesa con los datos de la evaluación
     */
    function fetchQuizData(moduleId) {
        return new Promise((resolve, reject) => {
            // Intentar cargar desde archivo JSON
            fetch(`quizzes/quiz${moduleId.replace('module', '')}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se pudo cargar el archivo de evaluación');
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.warn('Error al cargar archivo JSON:', error);
                    console.log('Usando datos de ejemplo...');
                    
                    // Si falla, usar datos de ejemplo
                    setTimeout(() => {
                        // Datos de ejemplo para la evaluación
                        const quizData = {
                            moduleId: moduleId,
                            title: `Evaluación del Módulo ${moduleId.replace('module', '')}`,
                            description: "Comprueba tu comprensión sobre el sistema Trima Accel",
                            passingScore: 70,
                            questions: [
                                {
                                    id: 1,
                                    text: "¿Cuál es la función principal del sistema Trima Accel?",
                                    type: "multiple-choice",
                                    options: [
                                        "Análisis de muestras sanguíneas",
                                        "Recolección de componentes sanguíneos",
                                        "Almacenamiento de sangre",
                                        "Administración de transfusiones"
                                    ],
                                    correctAnswer: 1,
                                    feedback: "El sistema Trima Accel está diseñado principalmente para la recolección automatizada de componentes sanguíneos como plaquetas, plasma y glóbulos rojos."
                                },
                                {
                                    id: 2,
                                    text: "¿Qué información del donante es esencial antes de iniciar un procedimiento?",
                                    type: "multiple-choice",
                                    options: [
                                        "Solo el nombre",
                                        "Peso y altura",
                                        "Peso, altura, género y hematocrito",
                                        "Solo el tipo de sangre"
                                    ],
                                    correctAnswer: 2,
                                    feedback: "El peso, altura, género y hematocrito son esenciales para que el sistema calcule los parámetros óptimos del procedimiento y garantice la seguridad del donante."
                                },
                                {
                                    id: 3,
                                    text: "¿Cuál de las siguientes NO es una alarma común en el sistema Trima Accel?",
                                    type: "multiple-choice",
                                    options: [
                                        "Presión del acceso",
                                        "Fuga de temperatura",
                                        "Detector de aire",
                                        "Presión de retorno"
                                    ],
                                    correctAnswer: 1,
                                    feedback: "\"Fuga de temperatura\" no es una alarma del sistema Trima Accel. Las alarmas comunes incluyen presión del acceso, detector de aire y presión de retorno."
                                },
                                {
                                    id: 4,
                                    text: "¿Cuál es el procedimiento correcto cuando suena una alarma de presión de acceso?",
                                    type: "multiple-choice",
                                    options: [
                                        "Ignorar la alarma y continuar",
                                        "Detener inmediatamente el procedimiento",
                                        "Verificar la posición de la aguja y ajustar si es necesario",
                                        "Aumentar la velocidad de flujo"
                                    ],
                                    correctAnswer: 2,
                                    feedback: "Cuando suena una alarma de presión de acceso, se debe verificar la posición de la aguja y realizar ajustes si es necesario para garantizar un flujo adecuado."
                                },
                                {
                                    id: 5,
                                    text: "¿Cuál es el tiempo máximo recomendado para un procedimiento de donación de plaquetas?",
                                    type: "multiple-choice",
                                    options: [
                                        "30 minutos",
                                        "1 hora",
                                        "2 horas",
                                        "3 horas"
                                    ],
                                    correctAnswer: 2,
                                    feedback: "El tiempo máximo recomendado para un procedimiento de donación de plaquetas es de aproximadamente 2 horas, aunque puede variar según las características del donante y los componentes a recolectar."
                                }
                            ]
                        };
                        
                        resolve(quizData);
                    }, 1000);
                });
        });
    }
    
    /**
     * Renderiza la evaluación en el contenedor
     */
    function renderQuiz() {
        if (!quizContainer || !quizState.questions) return;
        
        // Limpiar contenedor
        quizContainer.innerHTML = '';
        
        // Renderizar cada pregunta
        quizState.questions.forEach((question, index) => {
            const questionElement = createQuestionElement(question, index);
            quizContainer.appendChild(questionElement);
        });
        
        // Mostrar botón de envío
        if (submitQuizBtn) {
            submitQuizBtn.style.display = 'block';
        }
    }
    
    /**
     * Crea el elemento DOM para una pregunta
     * @param {Object} question - Datos de la pregunta
     * @param {number} index - Índice de la pregunta
     * @returns {HTMLElement} Elemento de la pregunta
     */
    function createQuestionElement(question, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.dataset.questionId = question.id;
        
        // Crear título de la pregunta
        const questionTitle = document.createElement('p');
        questionTitle.className = 'question-text';
        questionTitle.textContent = `${index + 1}. ${question.text}`;
        questionDiv.appendChild(questionTitle);
        
        // Crear opciones según el tipo de pregunta
        switch (question.type) {
            case 'multiple-choice':
                createMultipleChoiceOptions(questionDiv, question, index);
                break;
            case 'true-false':
                createTrueFalseOptions(questionDiv, question, index);
                break;
            case 'text':
                createTextInput(questionDiv, question);
                break;
            default:
                console.error('Tipo de pregunta no soportado:', question.type);
        }
        
        return questionDiv;
    }
    
    /**
     * Crea opciones para preguntas de opción múltiple
     * @param {HTMLElement} container - Contenedor de la pregunta
     * @param {Object} question - Datos de la pregunta
     * @param {number} questionIndex - Índice de la pregunta
     */
    function createMultipleChoiceOptions(container, question, questionIndex) {
        const optionsList = document.createElement('ul');
        optionsList.className = 'question-options';
        
        question.options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'question-option';
            
            const inputId = `q${question.id}_${optionIndex}`;
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q${question.id}`;
            input.id =
