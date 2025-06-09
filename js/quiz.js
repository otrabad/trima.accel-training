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
            // En una implementación real, esto cargaría un archivo JSON desde el servidor
            // Por ahora, simulamos la carga con datos de ejemplo
            
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
            }, 1000); // Simular tiempo de carga
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
            input.id = inputId;
            input.value = optionIndex;
            
            // Si hay una respuesta guardada, seleccionarla
            if (quizState.userAnswers[question.id] !== undefined && 
                quizState.userAnswers[question.id] === optionIndex) {
                input.checked = true;
            }
            
            // Evento para guardar la respuesta
            input.addEventListener('change', function() {
                if (this.checked) {
                    quizState.userAnswers[question.id] = optionIndex;
                }
            });
            
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = option;
            
            optionItem.appendChild(input);
            optionItem.appendChild(label);
            optionsList.appendChild(optionItem);
        });
        
        container.appendChild(optionsList);
    }
    
    /**
     * Crea opciones para preguntas de verdadero/falso
     * @param {HTMLElement} container - Contenedor de la pregunta
     * @param {Object} question - Datos de la pregunta
     * @param {number} questionIndex - Índice de la pregunta
     */
    function createTrueFalseOptions(container, question, questionIndex) {
        const optionsList = document.createElement('ul');
        optionsList.className = 'question-options true-false';
        
        const options = ['Verdadero', 'Falso'];
        
        options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'question-option';
            
            const inputId = `q${question.id}_${optionIndex}`;
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q${question.id}`;
            input.id = inputId;
            input.value = optionIndex;
            
            // Si hay una respuesta guardada, seleccionarla
            if (quizState.userAnswers[question.id] !== undefined && 
                quizState.userAnswers[question.id] === optionIndex) {
                input.checked = true;
            }
            
            // Evento para guardar la respuesta
            input.addEventListener('change', function() {
                if (this.checked) {
                    quizState.userAnswers[question.id] = optionIndex;
                }
            });
            
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = option;
            
            optionItem.appendChild(input);
            optionItem.appendChild(label);
            optionsList.appendChild(optionItem);
        });
        
        container.appendChild(optionsList);
    }
    
    /**
     * Crea campo de texto para preguntas de respuesta abierta
     * @param {HTMLElement} container - Contenedor de la pregunta
     * @param {Object} question - Datos de la pregunta
     */
    function createTextInput(container, question) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'text-input-container';
        
        const input = document.createElement('textarea');
        input.className = 'question-text-input';
        input.placeholder = 'Escribe tu respuesta aquí...';
        
        // Si hay una respuesta guardada, mostrarla
        if (quizState.userAnswers[question.id]) {
            input.value = quizState.userAnswers[question.id];
        }
        
        // Evento para guardar la respuesta
        input.addEventListener('input', function() {
            quizState.userAnswers[question.id] = this.value;
        });
        
        inputContainer.appendChild(input);
        container.appendChild(inputContainer);
    }
    
    /**
     * Envía la evaluación para calificación
     */
    function submitQuiz() {
        if (quizState.submitted) return;
        
        // Verificar si se respondieron todas las preguntas
        const unansweredQuestions = quizState.questions.filter(q => 
            quizState.userAnswers[q.id] === undefined);
        
        if (unansweredQuestions.length > 0) {
            // Mostrar alerta
            alert(`Faltan ${unansweredQuestions.length} preguntas por responder. Por favor, completa todas las preguntas antes de enviar.`);
            
            // Resaltar preguntas sin responder
            unansweredQuestions.forEach(q => {
                const questionElement = document.querySelector(`.quiz-question[data-question-id="${q.id}"]`);
                if (questionElement) {
                    questionElement.classList.add('unanswered');
                    
                    // Quitar clase después de un tiempo
                    setTimeout(() => {
                        questionElement.classList.remove('unanswered');
                    }, 3000);
                }
            });
            
            return;
        }
        
        // Marcar como enviado
        quizState.submitted = true;
        
        // Registrar tiempo de finalización
        quizState.timeCompleted = new Date();
        
        // Calcular puntuación
        calculateScore();
        
        // Mostrar resultados
        showResults();
    }
    
    /**
     * Calcula la puntuación de la evaluación
     */
    function calculateScore() {
        let correctCount = 0;
        
        quizState.questions.forEach(question => {
            const userAnswer = quizState.userAnswers[question.id];
            
            // Verificar respuesta según el tipo de pregunta
            switch (question.type) {
                case 'multiple-choice':
                case 'true-false':
                    if (userAnswer === question.correctAnswer) {
                        correctCount++;
                    }
                    break;
                case 'text':
                    // Para preguntas de texto, se necesitaría un sistema más complejo de evaluación
                    // Por ahora, simplemente comprobamos si contiene palabras clave
                    if (question.keywords && userAnswer) {
                        const answerLower = userAnswer.toLowerCase();
                        const containsKeywords = question.keywords.some(keyword => 
                            answerLower.includes(keyword.toLowerCase()));
                        
                        if (containsKeywords) {
                            correctCount++;
                        }
                    }
                    break;
            }
        });
        
        // Calcular porcentaje
        const totalQuestions = quizState.questions.length;
        quizState.score = Math.round((correctCount / totalQuestions) * 100);
        
        // Determinar si aprobó
        const passingScore = quizState.quizData.passingScore || 70;
        quizState.passed = quizState.score >= passingScore;
    }
    
    /**
     * Muestra los resultados de la evaluación
     */
    function showResults() {
        // Ocultar contenedor de preguntas y botón de envío
        if (quizContainer) {
            quizContainer.style.display = 'none';
        }
        
        if (submitQuizBtn) {
            submitQuizBtn.style.display = 'none';
        }
        
        // Mostrar contenedor de resultados
        if (quizResults) {
            quizResults.style.display = 'block';
        }
        
        // Actualizar puntuación
        if (scorePercentage) {
            scorePercentage.textContent = `${quizState.score}%`;
        }
        
        // Actualizar círculo de puntuación
        if (scoreCircle) {
            scoreCircle.style.setProperty('--score-height', `${quizState.score}%`);
            
            // Añadir clase según la puntuación
            scoreCircle.classList.remove('high', 'medium', 'low');
            
            if (quizState.score >= 80) {
                scoreCircle.classList.add('high');
            } else if (quizState.score >= 60) {
                scoreCircle.classList.add('medium');
            } else {
                scoreCircle.classList.add('low');
            }
        }
        
        // Actualizar contadores
        const totalQuestionsCount = quizState.questions.length;
        const correctAnswersCount = Math.round((quizState.score / 100) * totalQuestionsCount);
        
        if (correctAnswers) {
            correctAnswers.textContent = correctAnswersCount;
        }
        
        if (totalQuestions) {
            totalQuestions.textContent = totalQuestionsCount;
        }
        
        // Generar retroalimentación detallada
        if (resultsFeedback) {
            resultsFeedback.innerHTML = '';
            
            quizState.questions.forEach(question => {
                const userAnswer = quizState.userAnswers[question.id];
                const isCorrect = (
                    question.type === 'multiple-choice' || 
                    question.type === 'true-false'
                ) ? userAnswer === question.correctAnswer : false;
                
                const feedbackItem = document.createElement('div');
                feedbackItem.className = `feedback-item ${isCorrect ? 'correct' : 'incorrect'}`;
                
                // Texto de la pregunta
                const questionText = document.createElement('p');
                questionText.className = 'question';
                questionText.textContent = question.text;
                feedbackItem.appendChild(questionText);
                
                // Respuesta del usuario
                const userAnswerText = document.createElement('p');
                userAnswerText.className = 'answer';
                
                if (question.type === 'multiple-choice') {
                    userAnswerText.textContent = `Tu respuesta: ${question.options[userAnswer]}`;
                } else if (question.type === 'true-false') {
                    userAnswerText.textContent = `Tu respuesta: ${userAnswer === 0 ? 'Verdadero' : 'Falso'}`;
                } else if (question.type === 'text') {
                    userAnswerText.textContent = `Tu respuesta: ${userAnswer}`;
                }
                
                feedbackItem.appendChild(userAnswerText);
                
                // Respuesta correcta (si es incorrecta)
                if (!isCorrect) {
                    const correctAnswerText = document.createElement('p');
                    correctAnswerText.className = 'correct-answer';
                    
                    if (question.type === 'multiple-choice') {
                        correctAnswerText.textContent = `Respuesta correcta: ${question.options[question.correctAnswer]}`;
                    } else if (question.type === 'true-false') {
                        correctAnswerText.textContent = `Respuesta correcta: ${question.correctAnswer === 0 ? 'Verdadero' : 'Falso'}`;
                    }
                    
                    feedbackItem.appendChild(correctAnswerText);
                }
                
                // Retroalimentación específica
                if (question.feedback) {
                    const feedback = document.createElement('p');
                    feedback.className = 'feedback';
                    feedback.textContent = question.feedback;
                    feedbackItem.appendChild(feedback);
                }
                
                resultsFeedback.appendChild(feedbackItem);
            });
        }
        
        // Configurar botones según resultado
        if (retryQuizBtn && continueBtn) {
            if (quizState.passed) {
                retryQuizBtn.style.display = 'none';
                continueBtn.style.display = 'block';
            } else {
                retryQuizBtn.style.display = 'block';
                continueBtn.style.display = 'none';
            }
        }
        
        // Guardar resultados
        saveQuizResults();
    }
    
    /**
     * Reinicia la evaluación para un nuevo intento
     */
    function retryQuiz() {
        // Ocultar resultados
        if (quizResults) {
            quizResults.style.display = 'none';
        }
        
        // Reiniciar estado
        resetQuizState();
        
        // Cargar evaluación nuevamente
        loadQuiz(quizState.moduleId);
    }
    
    /**
     * Reinicia el estado de la evaluación
     */
    function resetQuizState() {
        quizState.questions = [];
        quizState.userAnswers = {};
        quizState.submitted = false;
        quizState.score = 0;
        quizState.timeStarted = null;
        quizState.timeCompleted = null;
        quizState.quizData = null;
    }
    
    /**
     * Guarda los resultados de la evaluación
     */
    function saveQuizResults() {
        const results = {
            moduleId: quizState.moduleId,
            score: quizState.score,
            passed: quizState.passed,
            timeStarted: quizState.timeStarted?.toISOString(),
            timeCompleted: quizState.timeCompleted?.toISOString(),
            timeSpent: quizState.timeStarted && quizState.timeCompleted 
                ? Math.floor((quizState.timeCompleted - quizState.timeStarted) / 1000) 
                : 0,
            answers: quizState.userAnswers,
            attempts: quizState.attempts
        };
        
        // Guardar en localStorage
        const savedResults = JSON.parse(localStorage.getItem('trimaAccelQuizResults') || '{}');
        savedResults[quizState.moduleId] = results;
        localStorage.setItem('trimaAccelQuizResults', JSON.stringify(savedResults));
        
        console.log('Resultados guardados:', results);
    }
    
    // Exponer funciones para uso externo
    window.quizSystem = {
        loadQuiz,
        getQuizState: () => ({ ...quizState }),
        resetQuiz: resetQuizState
    };
});
