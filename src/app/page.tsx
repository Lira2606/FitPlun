'use client';
import { useState, useEffect, useRef } from 'react';
import { BicepCurlAnimation } from '@/components/BicepCurlAnimation';
import { Dumbbell, Footprints, Pause, Play, Route, Square, Weight, Heart, Zap, Mountain, Wind } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ExerciseType = 'musculacao' | 'corrida' | 'caminhada';

interface Exercise {
    id: number;
    name: string;
    type: ExerciseType;
    sets?: string;
    reps?: string;
    weight?: string;
    restTime?: string;
    time?: string;
    distance?: string;
    notes?: string;
}

const motivationalQuotes = [
    "O corpo alcança o que a mente acredita. Acredite no seu potencial.",
    "A dor que você sente hoje é a força que você sentirá amanhã. Não desista!",
    "Feito é melhor que perfeito. Mesmo um treino curto é melhor que nenhum treino.",
    "Você não precisa estar motivado para treinar, você precisa ser disciplinado.",
    "Daqui a uma hora, você terá desejado ter começado agora.",
    "O suor de hoje é o sorriso de amanhã.",
    "Vá por você e para você. Sua saúde não é negociável.",
    "Lembre-se do sentimento de dever cumprido e da energia que você sente depois de cada treino.",
    "A disciplina é a ponte entre suas metas e suas realizações.",
    "Não é sobre ter tempo, é sobre fazer tempo.",
    "O segredo do sucesso é a constância no objetivo.",
    "Um pequeno progresso a cada dia resulta em grandes conquistas.",
    "O hábito de treinar é construído, não encontrado. Continue construindo o seu.",
    "Não pare quando estiver cansado, pare quando terminar.",
    "A força de vontade deve ser mais forte que a habilidade.",
    "O que não te desafia, não te transforma.",
    "Seus únicos limites são aqueles que você impõe a si mesmo.",
    "Acredite na sua força. Você é mais capaz do que imagina.",
    "Cada repetição, cada série, cada gota de suor te deixa mais perto da sua melhor versão.",
    "As dificuldades preparam pessoas comuns para destinos extraordinários.",
    "Seja mais forte que a sua melhor desculpa.",
    "A jornada de mil quilômetros começa com um único passo. Continue caminhando.",
    "Apaixone-se pelo processo e os resultados aparecerão.",
    "Não compare o seu capítulo 1 com o capítulo 20 de outra pessoa.",
    "Olhe para trás e veja o quanto você já progrediu. Use isso como combustível.",
    "Cada treino é uma vitória contra a preguiça e a procrastinação. Comemore!",
    "Seu corpo é seu maior projeto. Divirta-se construindo-o.",
    "Não é sobre o peso que você perde, mas sobre a vida que você ganha."
];

const restQuotes = [
    "O descanso não é preguiça, é estratégia. É no descanso que o músculo cresce e se fortalece.",
    "Treinar é o estímulo. Comer é a matéria-prima. Descansar é a construção.",
    "Não confunda descanso com desistência. Seu corpo precisa de uma pausa para entregar o resultado que você busca.",
    "Um guerreiro inteligente sabe a hora de recuar para afiar sua espada. Seu descanso é o seu afiar.",
    "O arco só pode lançar a flecha com força total se antes for tensionado para trás. Permita-se recuar para avançar com mais potência.",
    "Respeitar seu descanso é respeitar sua meta.",
    "Seu corpo sussurra antes de gritar. Ouça os sinais de cansaço e dê a ele a pausa que merece.",
    "Hoje, a sua única meta é a recuperação. Relaxe a mente, descanse o corpo e recarregue a alma.",
    "O silêncio do descanso permite que você ouça as necessidades do seu corpo com mais clareza.",
    "Forte não é aquele que nunca para, mas aquele que sabe a hora de parar para voltar ainda mais forte.",
    "Honre seus limites de hoje para poder superá-los amanhã.",
    "Recarregue hoje para se superar amanhã. A energia que você economiza no descanso será seu combustível no próximo treino.",
    "Aproveite a calmaria. A tempestade de um treino intenso virá, e você estará preparado.",
    "Feche os olhos e visualize seus músculos se recuperando, sua mente se acalmando e sua determinação se fortalecendo.",
    "O descanso é o botão de 'reset' que seu corpo e mente precisam para continuar evoluindo.",
    "Permita-se uma pausa. O mundo não vai parar, mas você voltará a ele com muito mais vigor e foco."
];


export default function Home() {
    const [screen, setScreen] = useState('builder'); // 'builder', 'workout', 'rest', 'finished'
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60); // Default rest time
    const [motivationalQuote, setMotivationalQuote] = useState('');
    const [restQuote, setRestQuote] = useState('');
    const [exerciseType, setExerciseType] = useState<ExerciseType>('musculacao');
    const [cardioState, setCardioState] = useState<'idle' | 'running' | 'paused'>('idle');
    const [cardioTime, setCardioTime] = useState(0);
    const cardioTimerRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [splashVisible, setSplashVisible] = useState(true);
    const [showSplashIcon, setShowSplashIcon] = useState(false);
    
    // GPS Tracking State
    const [distance, setDistance] = useState(0); // in kilometers
    const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);
    
    // Secondary Metrics State
    const [calories, setCalories] = useState(0);
    const [heartRate, setHeartRate] = useState(0);
    const [elevationGain, setElevationGain] = useState(0);
    const [cadence, setCadence] = useState(0);


    // Haversine formula to calculate distance between two points
    const calculateDistance = (pos1: GeolocationPosition, pos2: GeolocationPosition) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Earth radius in km
        const dLat = toRad(pos2.coords.latitude - pos1.coords.latitude);
        const dLon = toRad(pos2.coords.longitude - pos1.coords.longitude);
        const lat1 = toRad(pos1.coords.latitude);
        const lat2 = toRad(pos2.coords.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };
    
    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocalização não é suportada pelo seu navegador.");
            return;
        }

        setLocationError(null);
        
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                if (lastPosition) {
                    setDistance((prevDistance) => prevDistance + calculateDistance(lastPosition, position));
                    
                    // Calculate elevation gain
                    const altitudeChange = (position.coords.altitude || 0) - (lastPosition.coords.altitude || 0);
                    if (altitudeChange > 0) {
                        setElevationGain(prevGain => prevGain + altitudeChange);
                    }
                }
                setLastPosition(position);
                setLocationError(null);
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                     setLocationError("Acesso à localização negado. Habilite a permissão para rastrear sua atividade.");
                } else {
                     setLocationError("Não foi possível obter a localização.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const stopLocationTracking = () => {
        if (watchIdRef.current && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setLastPosition(null);
    };

    useEffect(() => {
        if (cardioState === 'running') {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
        return stopLocationTracking;
    }, [cardioState]);

    const resetCardioState = () => {
        setCardioState('idle');
        setCardioTime(0);
        setDistance(0);
        setLastPosition(null);
        setLocationError(null);
        setElevationGain(0);
        setCalories(0);
        setHeartRate(0);
        setCadence(0);
        stopLocationTracking();
    }
    
    const calculatePace = () => {
        if (distance === 0 || cardioTime === 0) return "0:00";
        const pace = cardioTime / 60 / distance; // minutes per km
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        const splashTimer = setTimeout(() => setSplashVisible(false), 2500);
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

    useEffect(() => {
        if (cardioState === 'running') {
            cardioTimerRef.current = setInterval(() => {
                setCardioTime(prev => prev + 1);
            }, 1000);
        } else {
            if (cardioTimerRef.current) clearInterval(cardioTimerRef.current);
        }
        return () => {
            if (cardioTimerRef.current) clearInterval(cardioTimerRef.current);
        };
    }, [cardioState]);
    
    useEffect(() => {
        if (screen === 'workout') {
            const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
            setMotivationalQuote(motivationalQuotes[randomIndex]);
        }
        if (screen === 'rest') {
            const randomIndex = Math.floor(Math.random() * restQuotes.length);
            setRestQuote(restQuotes[randomIndex]);
        }
    }, [screen, currentExerciseIndex, currentSet]);

    const formatCardioTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const addExercise = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        let newExercise: Exercise;

        if (exerciseType === 'musculacao') {
             newExercise = {
                id: Date.now(),
                name: formData.get('exercise-name') as string,
                type: 'musculacao',
                sets: formData.get('exercise-sets') as string,
                reps: formData.get('exercise-reps') as string,
                weight: formData.get('exercise-weight') as string,
                restTime: formData.get('exercise-rest-time') as string,
                notes: formData.get('exercise-notes') as string,
            };
        } else {
             newExercise = {
                id: Date.now(),
                name: exerciseType === 'corrida' ? 'Corrida' : 'Caminhada',
                type: exerciseType,
                time: formData.get('exercise-time') as string,
                distance: formData.get('exercise-distance') as string,
                notes: formData.get('exercise-notes') as string,
            };
        }

        setExercises([...exercises, newExercise]);
        e.currentTarget.reset();
        if (exerciseType === 'musculacao') {
            (document.getElementById('exercise-name') as HTMLInputElement)?.focus();
        }
    };

    const removeExercise = (id: number) => {
        setExercises(exercises.filter(ex => ex.id !== id));
    };

    const startWorkout = () => {
        if (exercises.length > 0) {
            setCurrentExerciseIndex(0);
            setCurrentSet(1);
            setScreen('workout');
            resetCardioState();
        }
    };
    
    const moveToNextSetOrExercise = () => {
        const currentExercise = exercises[currentExerciseIndex];
        const totalSets = currentExercise.sets ? parseInt(currentExercise.sets) : 1;

        if (currentSet < totalSets) {
            setCurrentSet(currentSet + 1);
        } else {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setCurrentSet(1);
                 // Check if the next exercise is cardio and reset state
                if (exercises[currentExerciseIndex + 1].type !== 'musculacao') {
                   resetCardioState();
                }
            } else {
                setScreen('finished');
                return;
            }
        }
        setScreen('workout');
    };

    const completeSet = () => {
        const currentExercise = exercises[currentExerciseIndex];
        const isLastExercise = currentExerciseIndex >= exercises.length - 1;

        if (currentExercise.type !== 'musculacao') {
            // This is now the "Stop" button for cardio
            setCardioState('idle');
            stopLocationTracking(); // Stop GPS
            
            if (isLastExercise) {
                setScreen('finished');
            } else {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setScreen('workout');
                resetCardioState();
            }
            return;
        }

        const totalSets = currentExercise.sets ? parseInt(currentExercise.sets) : 1;
        const isLastSet = currentSet >= totalSets;

        if (isLastSet && isLastExercise) {
            setScreen('finished');
        } else if (currentExercise.restTime && parseInt(currentExercise.restTime) > 0) {
            setTimeLeft(parseInt(currentExercise.restTime));
            setScreen('rest');
        } else {
            moveToNextSetOrExercise();
        }
    };

    const finishRest = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        moveToNextSetOrExercise();
    }
    
    const startNewWorkout = () => {
        setExercises([]);
        setScreen('builder');
    }

    const currentExercise = exercises[currentExerciseIndex];
    const filteredExercises = exercises.filter(ex => ex.type === exerciseType);

    return (
        <>
        <style>{`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
                -webkit-text-fill-color: #ffffff !important;
                -webkit-box-shadow: 0 0 0 1000px rgba(55, 65, 81, 0.5) inset !important;
                transition: background-color 5000s ease-in-out 0s;
                caret-color: #fff !important;
            }
        `}</style>
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
                                <div className={`gradient-border ${filteredExercises.length > 0 ? 'flex-shrink' : 'flex-grow flex'}`}>
                                    <div className={`gradient-border-content ${filteredExercises.length === 0 ? 'w-full flex flex-col' : ''}`}>
                                        <h2 className="text-xl font-semibold mb-5 text-white">Adicionar Exercício</h2>
                                        <form id="add-exercise-form" className="space-y-4 flex-grow flex flex-col" onSubmit={addExercise}>
                                            <div className="flex-grow space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Exercício</label>
                                                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-700/50 p-1">
                                                        {(['musculacao', 'corrida', 'caminhada'] as ExerciseType[]).map(type => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => setExerciseType(type)}
                                                                className={`px-2 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none ${exerciseType === type ? 'bg-cyan-500 text-gray-900' : 'text-gray-300 hover:bg-gray-600'}`}
                                                            >
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {exerciseType === 'musculacao' && (
                                                    <>
                                                        <div>
                                                            <label htmlFor="exercise-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Exercício</label>
                                                            <div className="relative">
                                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                                     <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M2 14h20" />
                                                                        <path d="M4 14v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                                                                        <path d="M4 18h16" />
                                                                        <path d="M9 18v-2" />
                                                                        <path d="M15 18v-2" />
                                                                    </svg>
                                                                </span>
                                                                <input type="text" id="exercise-name" name="exercise-name" placeholder="Ex: Supino Reto" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor="exercise-sets" className="block text-sm font-medium text-gray-300 mb-1">Séries</label>
                                                                <input type="number" id="exercise-sets" name="exercise-sets" placeholder="Ex: 4" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="exercise-reps" className="block text-sm font-medium text-gray-300 mb-1">Reps</label>
                                                                <input type="text" id="exercise-reps" name="exercise-reps" placeholder="Ex: 8-12" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor="exercise-weight" className="block text-sm font-medium text-gray-300 mb-1">Peso (opcional)</label>
                                                                <div className="relative">
                                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Dumbbell className="h-5 w-5 text-gray-400" /></span>
                                                                    <input type="text" id="exercise-weight" name="exercise-weight" placeholder="Ex: 40kg" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="exercise-rest-time" className="block text-sm font-medium text-gray-300 mb-1">Descanso (s)</label>
                                                                <input type="number" id="exercise-rest-time" name="exercise-rest-time" placeholder="Ex: 60" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                { (exerciseType === 'corrida' || exerciseType === 'caminhada') && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor="exercise-time" className="block text-sm font-medium text-gray-300 mb-1">Tempo (meta)</label>
                                                                 <input type="text" id="exercise-time" name="exercise-time" placeholder="Ex: 30min" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                            <div>
                                                                <label htmlFor="exercise-distance" className="block text-sm font-medium text-gray-300 mb-1">Distância (meta)</label>
                                                                <input type="text" id="exercise-distance" name="exercise-distance" placeholder="Ex: 5km" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <div>
                                                    <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-300 mb-1">Notas (opcional)</label>
                                                    <textarea id="exercise-notes" name="exercise-notes" rows={2} placeholder="Ex: Manter ritmo, observar postura..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                                                </div>
                                            </div>
                                            <button type="submit" className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                                Adicionar Exercício
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {filteredExercises.length > 0 && (
                                    <div className="gradient-border animate-fade-in mt-8 flex-grow flex flex-col">
                                        <div className="gradient-border-content flex-grow flex flex-col">
                                            <h2 className="text-xl font-semibold mb-5 text-white">Seu Treino de {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}</h2>
                                            <div id="workout-list-container" className="flex-grow">
                                                <ul id="workout-list" className="space-y-3">
                                                    {filteredExercises.map((ex, index) => (
                                                        <li id={`exercise-${ex.id}`} key={ex.id} className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg flex items-start justify-between transition-all duration-300 hover:bg-gray-700/80 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: `${index * 100}ms`}}>
                                                            <div className="flex items-center flex-grow pr-4">
                                                                <div className="mr-4 text-cyan-400">
                                                                    {ex.type === 'musculacao' && <Weight className="w-6 h-6" />}
                                                                    {ex.type === 'corrida' && <Route className="w-6 h-6" />}
                                                                    {ex.type === 'caminhada' && <Footprints className="w-6 h-6" />}
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h3 className="font-bold text-md text-cyan-300">{ex.name}</h3>
                                                                    <div className="text-sm text-gray-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                                                        {ex.sets && <span><strong>Séries:</strong> {ex.sets}</span>}
                                                                        {ex.reps && <span><strong>Reps:</strong> {ex.reps}</span>}
                                                                        {ex.weight && <span><strong>Peso:</strong> {ex.weight}</span>}
                                                                        {ex.restTime && <span><strong>Descanso:</strong> {ex.restTime}s</span>}
                                                                        {ex.time && <span><strong>Tempo:</strong> {ex.time}</span>}
                                                                        {ex.distance && <span><strong>Distância:</strong> {ex.distance}</span>}
                                                                    </div>
                                                                    {ex.notes && <p className="text-xs text-gray-400 mt-2 italic"><strong>Nota:</strong> {ex.notes}</p>}
                                                                </div>
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
                        currentExercise.type === 'musculacao' ? (
                            // Musculação UI
                            <div className="min-h-full p-4 flex flex-col justify-between text-center relative">
                                <button onClick={() => setScreen('builder')} className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 transition-colors z-10 p-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <div className="mt-12">
                                    <p className="text-cyan-400 font-semibold mb-2">Exercício {currentExerciseIndex + 1} de {exercises.length}</p>
                                    <h2 className="text-5xl font-bold text-white truncate">{currentExercise.name}</h2>
                                    <div className="text-gray-300 text-lg mt-2">
                                        {currentExercise.reps && <span>{currentExercise.reps} Reps</span>}
                                        {currentExercise.weight && <span> / {currentExercise.weight}</span>}
                                    </div>
                                </div>
                                
                                <div className="my-8 w-full max-w-[200px] mx-auto">
                                    <BicepCurlAnimation />
                                </div>
                                
                                <div className="flex-grow flex flex-col items-center justify-center">
                                    <p className="text-gray-400 text-2xl mb-2">SÉRIE ATUAL</p>
                                    <p className="text-8xl font-bold text-white">{currentSet}</p>
                                </div>
                                
                                <div className="mb-4 h-10 flex items-center justify-center">
                                    <p className="text-gray-400 italic text-center animate-fade-in">{motivationalQuote}</p>
                                </div>

                                <button onClick={completeSet} className="w-full max-w-xs mx-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50">
                                    CONCLUIR SÉRIE
                                </button>
                            </div>
                        ) : (
                            // Cardio UI
                            <div className="min-h-full p-4 flex flex-col justify-start text-center relative">
                                <button onClick={() => setScreen('builder')} className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 transition-colors z-10 p-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <div className="mt-8">
                                    <p className="text-cyan-400 font-semibold mb-1">{currentExercise.name}</p>
                                    <h2 className="text-6xl font-bold text-white">{formatCardioTime(cardioTime)}</h2>
                                    <p className="text-gray-400 mt-1 text-sm">Duração</p>
                                </div>

                                 {locationError && (
                                    <Alert variant="destructive" className="my-2 text-xs">
                                        <AlertTitle>Erro de Localização</AlertTitle>
                                        <AlertDescription>{locationError}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-2 gap-4 my-4 text-white">
                                    <div>
                                        <p className="text-3xl font-bold">{distance.toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">Distância (km)</p>
                                    </div>
                                     <div>
                                        <p className="text-3xl font-bold">{calculatePace()}</p>
                                        <p className="text-gray-400 text-sm">Ritmo (min/km)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 my-4 text-white text-center">
                                    <div>
                                        <Zap className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                                        <p className="text-lg font-bold">{calories}</p>
                                        <p className="text-gray-500 text-xs">Calorias</p>
                                    </div>
                                    <div>
                                        <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                                        <p className="text-lg font-bold">{heartRate || '--'}</p>
                                        <p className="text-gray-500 text-xs">BPM</p>
                                    </div>
                                    <div>
                                        <Mountain className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                                        <p className="text-lg font-bold">{elevationGain.toFixed(0)}</p>
                                        <p className="text-gray-500 text-xs">Elevação (m)</p>
                                    </div>
                                    <div>
                                        <Wind className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                        <p className="text-lg font-bold">{cadence || '--'}</p>
                                        <p className="text-gray-500 text-xs">Cadência</p>
                                    </div>
                                </div>
                                <div className="mt-auto flex items-center justify-center gap-4 mb-4">
                                {cardioState === 'idle' || cardioState === 'paused' ? (
                                    <button onClick={() => setCardioState('running')} className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-110">
                                        <Play className="w-12 h-12" />
                                    </button>
                                ) : (
                                    <button onClick={() => setCardioState('paused')} className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-110">
                                        <Pause className="w-12 h-12" />
                                    </button>
                                )}
                                <button onClick={completeSet} className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transform transition hover:scale-110 disabled:opacity-50" disabled={cardioState === 'idle'}>
                                    <Square className="w-10 h-10" />
                                </button>
                                </div>
                            </div>
                        )
                    )}


                    {screen === 'rest' && (
                        <div className="min-h-full p-4 flex flex-col justify-center items-center text-center">
                             <h2 className="text-4xl font-bold text-cyan-400 mb-4">DESCANSO</h2>
                             <p className="text-8xl font-bold text-white mb-8">{timeLeft}</p>
                             <div className="mb-8 h-10 flex items-center justify-center">
                                <p className="text-gray-400 italic text-center animate-fade-in">{restQuote}</p>
                            </div>
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
