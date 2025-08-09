
'use client';
import { useState, useEffect, useRef } from 'react';

interface Exercise {
    id: number;
    name: string;
    sets: string;
    reps: string;
    weight: string;
    time: string;
    notes: string;
}

export default function Home() {
    const [screen, setScreen] = useState('builder'); // 'builder', 'workout', 'rest', 'finished'
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60); // Default rest time

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [splashVisible, setSplashVisible] = useState(true);
    const [showSplashIcon, setShowSplashIcon] = useState(false);


    useEffect(() => {
        const splashTimer = setTimeout(() => setSplashVisible(false), 2500);
        // Render the icon only on the client-side to prevent FOUC
        setShowSplashIcon(true);
        return () => clearTimeout(splashTimer);
    }, []);
    
    useEffect(() => {
        if (screen === 'rest' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft <= 0 && screen === 'rest') {
            finishRest();
        }
        return () => {
            if(timerRef.current) clearTimeout(timerRef.current)
        };
    }, [screen, timeLeft]);

    const addExercise = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newExercise: Exercise = {
            id: Date.now(),
            name: formData.get('exercise-name') as string,
            sets: formData.get('exercise-sets') as string,
            reps: formData.get('exercise-reps') as string,
            weight: formData.get('exercise-weight') as string,
            time: formData.get('exercise-time') as string,
            notes: formData.get('exercise-notes') as string,
        };
        setExercises([...exercises, newExercise]);
        e.currentTarget.reset();
        (document.getElementById('exercise-name') as HTMLInputElement)?.focus();
    };

    const removeExercise = (id: number) => {
        const exerciseElement = document.getElementById(`exercise-${id}`);
        if (exerciseElement) {
            exerciseElement.classList.remove('animate-slide-in');
            exerciseElement.classList.add('animate-slide-out');
            setTimeout(() => {
                setExercises(exercises.filter(ex => ex.id !== id));
            }, 400);
        } else {
             setExercises(exercises.filter(ex => ex.id !== id));
        }
    };

    const startWorkout = () => {
        if (exercises.length > 0) {
            setCurrentExerciseIndex(0);
            setCurrentSet(1);
            setScreen('workout');
        }
    };
    
    const completeSet = () => {
        const currentExercise = exercises[currentExerciseIndex];
        const isLastSet = currentSet >= parseInt(currentExercise.sets);
        const isLastExercise = currentExerciseIndex >= exercises.length - 1;

        if (isLastSet && isLastExercise) {
            setScreen('finished');
        } else {
            setTimeLeft(60); // Reset timer
            setScreen('rest');
        }
    };

    const finishRest = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const currentExercise = exercises[currentExerciseIndex];
        if (currentSet < parseInt(currentExercise.sets)) {
            setCurrentSet(currentSet + 1);
        } else {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setCurrentSet(1);
            } else {
                setScreen('finished');
            }
        }
        setScreen('workout');
    }
    
    const startNewWorkout = () => {
        setExercises([]);
        setScreen('builder');
    }

    const currentExercise = exercises[currentExerciseIndex];

    return (
        <>
            <div className="gym-background"></div>
            <div className="phone-frame">
                {splashVisible && (
                    <div id="splash-screen">
                        {showSplashIcon && (
                            <svg className="splash-icon w-24 h-24 text-cyan-400" viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <g transform="rotate(-30 32 32)">
                                    <rect x="22" y="30" width="20" height="4" rx="2" fill="#9ca3af"/>
                                    <path d="M18 18C12.4772 18 8 22.4772 8 28V36C8 41.5228 12.4772 46 18 46H20V18H18Z"/>
                                    <path d="M46 18H44V46H46C51.5228 46 56 41.5228 56 36V28C56 22.4772 51.5228 18 46 18Z"/>
                                </g>
                            </svg>
                        )}
                    </div>
                )}

                <div className="phone-content custom-scrollbar">
                    {screen === 'builder' && (
                        <div className="flex flex-col min-h-full p-4 pt-10">
                            <header className="text-center mb-6">
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight">Monte seu Treino</h1>
                                <p className="text-gray-400 mt-2 text-sm">Adicione os exercícios para sua rotina.</p>
                            </header>

                            <div className="flex flex-col flex-grow">
                                <div className={`gradient-border ${exercises.length > 0 ? 'flex-shrink' : 'flex-grow flex'}`}>
                                    <div className={`gradient-border-content ${exercises.length === 0 ? 'w-full flex flex-col' : ''}`}>
                                        <h2 className="text-xl font-semibold mb-5 text-white">Adicionar Exercício</h2>
                                        <form id="add-exercise-form" className="space-y-4 flex-grow flex flex-col" onSubmit={addExercise}>
                                            <div className="flex-grow space-y-4">
                                              <div>
                                                  <label htmlFor="exercise-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Exercício</label>
                                                  <div className="relative">
                                                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 2A1.5 1.5 0 002 3.5V16.5A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5V8.168a1.5 1.5 0 00-.44-1.06L14.392 3.94A1.5 1.5 0 0013.332 3.5H10.5A1.5 1.5 0 009 2H3.5zM13 9a1 1 0 112 0 1 1 0 01-2 0z" /></svg>
                                                      </span>
                                                      <input type="text" id="exercise-name" name="exercise-name" placeholder="Ex: Supino Reto" required className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200" />
                                                  </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label htmlFor="exercise-sets" className="block text-sm font-medium text-gray-300 mb-1">Séries</label>
                                                      <div className="relative">
                                                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                                                          </span>
                                                          <input type="number" id="exercise-sets" name="exercise-sets" placeholder="Ex: 4" required className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200" />
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <label htmlFor="exercise-reps" className="block text-sm font-medium text-gray-300 mb-1">Reps</label>
                                                      <div className="relative">
                                                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.18 3.182v-4.992m0 0h-4.992m4.992 0l-3.181-3.182a8.25 8.25 0 00-11.664 0l-3.18 3.185" /></svg>
                                                          </span>
                                                          <input type="text" id="exercise-reps" name="exercise-reps" placeholder="Ex: 8-12" required className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200" />
                                                      </div>
                                                  </div>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                  <div>
                                                      <label htmlFor="exercise-weight" className="block text-sm font-medium text-gray-300 mb-1">Peso (opcional)</label>
                                                      <div className="relative">
                                                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.818-5.62-2.24l-2.62-2.62a5.988 5.988 0 01-1.68-4.243V6.345c0-1.22.67-2.312 1.719-2.816.52-.252 1.07-.432 1.64-.563m13.5 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.818-5.62-2.24l-2.62-2.62a5.988 5.988 0 01-1.68-4.243V6.345c0-1.22.67-2.312 1.719-2.816.52-.252 1.07-.432 1.64-.563" /></svg>
                                                          </span>
                                                          <input type="text" id="exercise-weight" name="exercise-weight" placeholder="Ex: 40kg" className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200" />
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <label htmlFor="exercise-time" className="block text-sm font-medium text-gray-300 mb-1">Tempo (opcional)</label>
                                                      <div className="relative">
                                                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                          </span>
                                                          <input type="text" id="exercise-time" name="exercise-time" placeholder="Ex: 30s" className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200" />
                                                      </div>
                                                  </div>
                                              </div>
                                              <div>
                                                  <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-300 mb-1">Notas (opcional)</label>
                                                  <div className="relative">
                                                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                                                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                      </span>
                                                      <textarea id="exercise-notes" name="exercise-notes" rows={3} placeholder="Ex: Aumentar a carga..." className="w-full bg-gray-700/20 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"></textarea>
                                                  </div>
                                              </div>
                                            </div>
                                            <button type="submit" className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                                Adicionar Exercício
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {exercises.length > 0 && (
                                    <div className="gradient-border animate-fade-in mt-8 flex-grow flex flex-col">
                                        <div className="gradient-border-content flex-grow flex flex-col">
                                            <h2 className="text-xl font-semibold mb-5 text-white">Seu Treino</h2>
                                            <div id="workout-list-container" className="flex-grow">
                                                <ul id="workout-list" className="space-y-3">
                                                    {exercises.map((ex, index) => (
                                                        <li id={`exercise-${ex.id}`} key={ex.id} className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg flex items-start justify-between transition-all duration-300 hover:bg-gray-700/80 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: `${index * 100}ms`}}>
                                                            <div className="flex-grow pr-4">
                                                                <h3 className="font-bold text-md text-cyan-300">{ex.name}</h3>
                                                                <div className="text-sm text-gray-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                                                    <span><strong>Séries:</strong> {ex.sets}</span>
                                                                    <span><strong>Reps:</strong> {ex.reps}</span>
                                                                    {ex.weight && <span><strong>Peso:</strong> {ex.weight}</span>}
                                                                    {ex.time && <span><strong>Tempo:</strong> {ex.time}</span>}
                                                                </div>
                                                                {ex.notes && <p className="text-xs text-gray-400 mt-2 italic"><strong>Nota:</strong> {ex.notes}</p>}
                                                            </div>
                                                            <button onClick={() => removeExercise(ex.id)} className="remove-btn flex-shrink-0 text-gray-500 hover:text-red-500 transition-colors">
                                                                <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <button onClick={startWorkout} id="start-workout-btn" className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50" disabled={exercises.length === 0}>
                                                Iniciar Treino
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {screen === 'workout' && currentExercise && (
                        <div className="min-h-full p-4 flex flex-col justify-between text-center relative">
                             <button onClick={() => setScreen('builder')} className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <div className="mt-12">
                                <p className="text-cyan-400 font-semibold mb-2">Exercício {currentExerciseIndex + 1} de {exercises.length}</p>
                                <h2 className="text-5xl font-bold text-white truncate">{currentExercise.name}</h2>
                                <div className="text-gray-300 text-lg mt-2">
                                    <span>{currentExercise.reps} Reps</span>
                                    {currentExercise.weight && <span> / {currentExercise.weight}</span>}
                                    {currentExercise.time && <span> / {currentExercise.time}</span>}
                                </div>
                            </div>
                            
                            <div className="my-8">
                                <p className="text-gray-400 text-2xl mb-2">SÉRIE ATUAL</p>
                                <p className="text-8xl font-bold text-white">{currentSet}</p>
                            </div>
                            
                            <button onClick={completeSet} className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50">
                                CONCLUIR SÉRIE
                            </button>
                        </div>
                    )}

                    {screen === 'rest' && (
                        <div className="min-h-full p-4 flex flex-col justify-center items-center text-center">
                             <h2 className="text-4xl font-bold text-cyan-400 mb-4">DESCANSO</h2>
                             <p className="text-8xl font-bold text-white mb-8">{timeLeft}</p>
                             <button onClick={finishRest} className="w-full max-w-xs mx-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all transform hover:scale-105">
                                 PULAR
                             </button>
                        </div>
                    )}

                    {screen === 'finished' && (
                        <div className="min-h-full p-4 flex flex-col justify-center items-center text-center">
                            <h2 className="text-5xl font-bold text-emerald-400 mb-4">TREINO FINALIZADO!</h2>
                            <p className="text-gray-300 text-lg mb-8">Parabéns! Você completou seu treino.</p>
                            <button onClick={startNewWorkout} className="w-full max-w-xs mx-auto bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-4 px-4 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                Começar um Novo Treino
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
