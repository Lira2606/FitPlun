'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // This is a workaround to make the script tags in the HTML execute.
    // Next.js doesn't execute script tags in dangerouslySetInnerHTML on initial render.
    const script = document.createElement('script');
    const scriptContent = `
        document.addEventListener('DOMContentLoaded', () => {
            const splashScreen = document.getElementById('splash-screen');
            const form = document.getElementById('add-exercise-form');
            const workoutList = document.getElementById('workout-list');
            const emptyState = document.getElementById('empty-state');
            const startWorkoutBtn = document.getElementById('start-workout-btn');

            // --- Lógica da Tela de Splash ---
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.classList.add('hidden');
                }
            }, 2500); // A tela de splash desaparecerá após 2.5 segundos

            let exercises = [];

            function renderWorkoutList() {
                if (!workoutList || !emptyState || !startWorkoutBtn) return;

                workoutList.innerHTML = '';
                
                if (exercises.length === 0) {
                    emptyState.classList.remove('hidden');
                    startWorkoutBtn.disabled = true;
                } else {
                    emptyState.classList.add('hidden');
                    startWorkoutBtn.disabled = false;
                }

                exercises.forEach((exercise, index) => {
                    const li = document.createElement('li');
                    li.className = 'bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg flex items-start justify-between transition-all duration-300 hover:bg-gray-700/80 hover:scale-[1.02]';
                    li.dataset.index = index.toString();
                    
                    if (!exercise.rendered) {
                        li.classList.add('animate-slide-in');
                        exercise.rendered = true;
                    }

                    li.innerHTML = \`
                        <div class="flex-grow pr-4">
                            <h3 class="font-bold text-md text-cyan-300">\${exercise.name}</h3>
                            <div class="text-sm text-gray-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                <span><strong>Séries:</strong> \${exercise.sets}</span>
                                <span><strong>Reps:</strong> \${exercise.reps}</span>
                                \${exercise.weight ? \`<span><strong>Peso:</strong> \${exercise.weight}</span>\` : ''}
                            </div>
                            \${exercise.notes ? \`<p class="text-xs text-gray-400 mt-2 italic"><strong>Nota:</strong> \${exercise.notes}</p>\` : ''}
                        </div>
                        <button class="remove-btn flex-shrink-0 text-gray-500 hover:text-red-500 transition-colors">
                            <svg class="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    \`;
                    workoutList.appendChild(li);
                });
            }

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(form as HTMLFormElement);
                    const newExercise = {
                        name: formData.get('exercise-name'),
                        sets: formData.get('exercise-sets'),
                        reps: formData.get('exercise-reps'),
                        weight: formData.get('exercise-weight'),
                        notes: formData.get('exercise-notes'),
                        rendered: false
                    };
                    exercises.push(newExercise);
                    (form as HTMLFormElement).reset();
                    const exerciseNameInput = document.getElementById('exercise-name');
                    if (exerciseNameInput) {
                       (exerciseNameInput as HTMLInputElement).focus();
                    }
                    renderWorkoutList();
                });
            }

            if (workoutList) {
                workoutList.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const removeButton = target.closest('.remove-btn');
                    if (removeButton) {
                        const liToRemove = removeButton.closest('li');
                        if (liToRemove && liToRemove.dataset.index) {
                            const indexToRemove = parseInt(liToRemove.dataset.index, 10);
                            
                            liToRemove.classList.add('animate-slide-out');
                            
                            setTimeout(() => {
                                exercises.splice(indexToRemove, 1);
                                exercises.forEach(ex => ex.rendered = true); 
                                renderWorkoutList();
                            }, 400);
                        }
                    }
                });
            }

            renderWorkoutList();
        });
    `;
    script.appendChild(document.createTextNode(scriptContent));
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: `
    <div class="gym-background"></div>

    <div class="phone-frame">
        <!-- Tela de Splash movida para dentro da moldura -->
        <div id="splash-screen">
            <!-- Ícone de Halter Melhorado -->
            <svg class="splash-icon w-24 h-24 text-cyan-400" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <g transform="rotate(-30 32 32)">
                    <!-- Handle -->
                    <rect x="22" y="30" width="20" height="4" rx="2" fill="#9ca3af"/>
                    <!-- Left Weight -->
                    <path d="M18 18C12.4772 18 8 22.4772 8 28V36C8 41.5228 12.4772 46 18 46H20V18H18Z"/>
                    <!-- Right Weight -->
                    <path d="M46 18H44V46H46C51.5228 46 56 41.5228 56 36V28C56 22.4772 51.5228 18 46 18Z"/>
                </g>
            </svg>
        </div>

        <div class="phone-content custom-scrollbar">
            <div class="min-h-full p-4">
                
                <header class="text-center mb-6">
                    <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight">Monte seu Treino</h1>
                    <p class="text-gray-400 mt-2 text-sm">Adicione os exercícios para sua rotina.</p>
                </header>

                <div class="space-y-8">

                    <div class="gradient-border">
                        <div class="gradient-border-content">
                            <h2 class="text-xl font-semibold mb-5 text-white">Adicionar Exercício</h2>
                            <form id="add-exercise-form" class="space-y-4">
                                
                                <!-- Nome do Exercício -->
                                <div>
                                    <label for="exercise-name" class="block text-sm font-medium text-gray-300 mb-1">Nome do Exercício</label>
                                    <div class="relative">
                                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 002 3.5V16.5A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5V8.168a1.5 1.5 0 00-.44-1.06L14.392 3.94A1.5 1.5 0 0013.332 3.5H10.5A1.5 1.5 0 009 2H3.5zM13 9a1 1 0 112 0 1 1 0 01-2 0z" /></svg>
                                        </span>
                                        <input type="text" id="exercise-name" name="exercise-name" placeholder="Ex: Supino Reto" required class="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200">
                                    </div>
                                </div>
                                
                                <!-- Séries e Reps -->
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label for="exercise-sets" class="block text-sm font-medium text-gray-300 mb-1">Séries</label>
                                        <div class="relative">
                                            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                            </span>
                                            <input type="number" id="exercise-sets" name="exercise-sets" placeholder="Ex: 4" required class="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200">
                                        </div>
                                    </div>
                                    <div>
                                        <label for="exercise-reps" class="block text-sm font-medium text-gray-300 mb-1">Reps</label>
                                        <div class="relative">
                                            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.18 3.182v-4.992m0 0h-4.992m4.992 0l-3.181-3.182a8.25 8.25 0 00-11.664 0l-3.18 3.185" /></svg>
                                            </span>
                                            <input type="text" id="exercise-reps" name="exercise-reps" placeholder="Ex: 8-12" required class="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Peso -->
                                <div>
                                    <label for="exercise-weight" class="block text-sm font-medium text-gray-300 mb-1">Peso</label>
                                    <div class="relative">
                                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.818-5.62-2.24l-2.62-2.62a5.988 5.988 0 01-1.68-4.243V6.345c0-1.22.67-2.312 1.719-2.816.52-.252 1.07-.432 1.64-.563m13.5 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.818-5.62-2.24l-2.62-2.62a5.988 5.988 0 01-1.68-4.243V6.345c0-1.22.67-2.312 1.719-2.816.52-.252 1.07-.432 1.64-.563" /></svg>
                                        </span>
                                        <input type="text" id="exercise-weight" name="exercise-weight" placeholder="Ex: 40kg" class="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200">
                                    </div>
                                </div>
                                
                                <!-- Notas -->
                                <div>
                                    <label for="exercise-notes" class="block text-sm font-medium text-gray-300 mb-1">Notas (opcional)</label>
                                    <div class="relative">
                                        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                                            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                        </span>
                                        <textarea id="exercise-notes" name="exercise-notes" rows="3" placeholder="Ex: Aumentar a carga..." class="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"></textarea>
                                    </div>
                                </div>
                                
                                <button type="submit" class="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                    Adicionar Exercício
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="gradient-border">
                        <div class="gradient-border-content">
                            <h2 class="text-xl font-semibold mb-5 text-white">Seu Treino</h2>
                            <div id="workout-list-container" class="flex-grow">
                                <div id="empty-state" class="text-center py-8 text-gray-500 transition-opacity duration-300">
                                    <svg class="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <p class="mt-3 text-sm">Nenhum exercício adicionado.</p>
                                </div>
                                <ul id="workout-list" class="space-y-3"></ul>
                            </div>
                             <button id="start-workout-btn" class="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" disabled>
                                Iniciar Treino
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    ` }} />
  );
}
