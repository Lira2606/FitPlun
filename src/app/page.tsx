'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Dumbbell, Pause, Play, Route, Square, Weight, Heart, Zap, Mountain, Wind, User, PlusCircle, Trophy, GaugeCircle, HeartPulse, Share2, Calendar, History, Save, Edit, Trash2, Footprints, Layers, Repeat, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { calculateCalories, CalorieCalculationMethod } from '@/lib/calorie-calculator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BicepCurlAnimation } from '@/components/BicepCurlAnimation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// --- Constantes de Configuração da Splash ---
const SPLASH_BACKGROUND_COLOR = '#040414';
const ICON_OUTLINE_COLOR = '#475569';
const ICON_FILL_COLOR = '#04a4c4';
const SPLASH_DURATION = 2500;
const FADE_OUT_DURATION = 500;

// --- Componente de Estilos e Animações da Splash ---
const CustomSplashStyles = () => (
    <style>{`
        .bg-custom-dark-splash {
            background-color: ${SPLASH_BACKGROUND_COLOR};
        }
        @keyframes logo-fade-in-scale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes fill-icon {
            from { clip-path: inset(100% 0 0 0); }
            to { clip-path: inset(0% 0 0 0); }
        }
        @keyframes splash-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes splash-fade-out {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .animate-logo {
            animation: logo-fade-in-scale 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .icon-fill-animation {
            animation: fill-icon ${SPLASH_DURATION / 1000}s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .fade-in-main {
            animation: splash-fade-in ${FADE_OUT_DURATION / 1000}s ease-in-out;
        }
        .splash-exit {
            animation: splash-fade-out ${FADE_OUT_DURATION / 1000}s ease-out forwards;
        }
    `}</style>
);

// --- Componente da Tela de Splash ---
const SplashScreen = ({ isExiting }: { isExiting: boolean }) => {
    return (
        <div className={`absolute inset-0 z-50 h-full w-full flex flex-col justify-center items-center text-white p-4 text-center transition-opacity duration-500 bg-custom-dark-splash ${isExiting ? 'splash-exit' : ''}`}>
            <CustomSplashStyles />
            <div className="relative flex justify-center items-center animate-logo" style={{ width: '80px', height: '80px' }}>
                <div className="relative w-full h-full">
                    <Dumbbell
                        className="absolute top-0 left-0"
                        color={ICON_OUTLINE_COLOR}
                        size={80}
                        strokeWidth={2}
                    />
                    <div className="absolute top-0 left-0 w-full h-full icon-fill-animation">
                       <Dumbbell
                            color={ICON_FILL_COLOR}
                            size={80}
                            strokeWidth={2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


type ExerciseType = 'musculacao' | 'corrida' | 'caminhada';
type ActiveTab = 'workout' | 'profile';
type Gender = 'male' | 'female' | 'other';

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

interface UserProfile {
    name: string;
    joinDate: string;
    weight: number;
    age: number;
    height: number;
    gender: Gender;
    profilePicture?: string;
}

interface WorkoutSummary {
    id: number;
    date: string;
    type: ExerciseType;
    name: string;
    exercises: Exercise[];
    cardioTime?: number;
    distance?: number;
    calories?: number;
    avgPace?: string;
    avgSpeed?: string;
    avgHeartRate?: number;
}


const motivationalQuotes = [
    "O corpo alcança o que a mente acredita. Acredite no seu potencial.",
    "A dor que você sente hoje é a força que você sentirá amanhã. Não desista!",
    "Feito é melhor que perfeito. Mesmo um treino curto é melhor que nenhum treino.",
];

const restQuotes = [
    "O descanso não é preguiça, é estratégia. É no descanso que o músculo cresce e se fortalece.",
    "Treinar é o estímulo. Comer é a matéria-prima. Descansar é a construção.",
    "Não confunda descanso com desistência.",
];

export default function Home() {
    const [isLoadingSplash, setIsLoadingSplash] = useState(true);
    const [isExitingSplash, setIsExitingSplash] = useState(false);

    const [screen, setScreen] = useState('builder'); // 'builder', 'workout', 'rest', 'finished'
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60); // Default rest time
    const [motivationalQuote, setMotivationalQuote] = useState('');
    const [restQuote, setRestQuote] = useState('');
    const [exerciseType, setExerciseType] = useState<ExerciseType>('musculacao');
    const [activeTab, setActiveTab] = useState<ExerciseType | 'profile'>('musculacao');
    const [cardioState, setCardioState] = useState<'idle' | 'running' | 'paused'>('idle');
    const [cardioTime, setCardioTime] = useState(0);
    const cardioTimerRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    // GPS Tracking State
    const [distance, setDistance] = useState(0); // in kilometers
    const [currentSpeed, setCurrentSpeed] = useState(0); // in km/h
    const [lastPosition, setLastPosition] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);
    
    // Secondary Metrics State
    const [calories, setCalories] = useState(0);
    const [heartRate, setHeartRate] = useState(0); 
    const [avgHeartRate, setAvgHeartRate] = useState(0);
    const [heartRateValues, setHeartRateValues] = useState<number[]>([]);
    const [elevationGain, setElevationGain] = useState(0);
    const [currentIncline, setCurrentIncline] = useState(0);
    const [cadence, setCadence] = useState(0);
    
    // Workout History State
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutSummary[]>([]);
    const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);


    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Usuário Fitness',
        joinDate: new Date().toISOString(),
        weight: 70,
        age: 30,
        height: 175,
        gender: 'male',
        profilePicture: undefined,
    });
    const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Calorie Calculation
    const calorieTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Splash Screen Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExitingSplash(true);
            const exitTimer = setTimeout(() => {
                setIsLoadingSplash(false);
            }, FADE_OUT_DURATION);
            return () => clearTimeout(exitTimer);
        }, SPLASH_DURATION);

        return () => clearTimeout(timer);
    }, []);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('workoutHistory');
            if (savedHistory) setWorkoutHistory(JSON.parse(savedHistory));

            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                setUserProfile(parsedProfile);
                setTempProfile(parsedProfile);
                setShowProfileForm(false);
            } else {
                setTempProfile(userProfile);
                setShowProfileForm(true);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setShowProfileForm(true);
        }
    }, []);

    const saveProfile = () => {
        setUserProfile(tempProfile);
        try {
            localStorage.setItem('userProfile', JSON.stringify(tempProfile));
            setShowProfileForm(false);
             alert('Perfil salvo com sucesso!');
        } catch (error) {
            console.error("Failed to save profile to localStorage", error);
            alert('Erro ao salvar perfil.');
        }
    };
    
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericValue = ['weight', 'age', 'height'].includes(name) ? parseFloat(value) : value;
        setTempProfile(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result;
                if (typeof result === 'string') {
                    setTempProfile(prev => ({ ...prev, profilePicture: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const saveWorkoutToHistory = () => {
        const currentWorkoutExercises = exercises.filter(ex => ex.type === (currentExercise?.type || exerciseType));
        if (currentWorkoutExercises.length === 0) return;
    
        const isCardio = currentWorkoutExercises[0].type === 'corrida' || currentWorkoutExercises[0].type === 'caminhada';
    
        const summary: WorkoutSummary = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: currentWorkoutExercises[0].type,
            name: isCardio ? currentWorkoutExercises[0].name : 'Musculação',
            exercises: [...currentWorkoutExercises],
            ...(isCardio && {
                cardioTime: cardioTime,
                distance: distance,
                calories: Math.round(calories),
                avgPace: calculatePace(),
                avgSpeed: calculateAvgSpeed(),
                avgHeartRate: avgHeartRate,
            })
        };
    
        const updatedHistory = [summary, ...workoutHistory];
        setWorkoutHistory(updatedHistory);
        try {
            localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save workout history to localStorage", error);
        }
    };
    
    const handleDeleteWorkout = () => {
        if (workoutToDelete === null) return;
        const updatedHistory = workoutHistory.filter(workout => workout.id !== workoutToDelete);
        setWorkoutHistory(updatedHistory);
        try {
            localStorage.setItem('workoutHistory', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Failed to save updated workout history to localStorage", error);
        }
        setWorkoutToDelete(null); // Close the dialog
    };


    const calculateDistanceHaversine = (pos1: GeolocationPosition, pos2: GeolocationPosition) => {
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
                setCurrentSpeed(position.coords.speed ? position.coords.speed * 3.6 : 0); // m/s to km/h
                if (lastPosition) {
                    const segmentDistance = calculateDistanceHaversine(lastPosition, position);
                    setDistance((prevDistance) => prevDistance + segmentDistance);
                    
                    const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000; // seconds
                    const altitudeChange = (position.coords.altitude || 0) - (lastPosition.coords.altitude || 0);

                    if (altitudeChange > 0) {
                        setElevationGain(prevGain => prevGain + altitudeChange);
                    }
                    
                    if(timeDiff > 0){
                        const segmentIncline = (altitudeChange / (segmentDistance * 1000)) * 100;
                        setCurrentIncline(segmentIncline || 0);
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
        setCurrentSpeed(0);
        setCurrentIncline(0);
    };

    const startCalorieCalculation = useCallback(() => {
        calorieTimerRef.current = setInterval(() => {
            setCalories(prevCalories => {
                const caloriesPerInterval = calculateCalories({
                    method: CalorieCalculationMethod.MET, // Default or dynamic method
                    weight: userProfile.weight,
                    age: userProfile.age,
                    gender: userProfile.gender,
                    duration: 5 / 3600, // 5 seconds in hours
                    speed: currentSpeed,
                    incline: currentIncline,
                    heartRate: heartRate,
                });
                return prevCalories + caloriesPerInterval;
            });
        }, 5000); // Calculate every 5 seconds
    }, [userProfile, currentSpeed, currentIncline, heartRate]);

    const stopCalorieCalculation = () => {
        if (calorieTimerRef.current) {
            clearInterval(calorieTimerRef.current);
            calorieTimerRef.current = null;
        }
    };
    
    useEffect(() => {
        if (cardioState === 'running') {
            startLocationTracking();
            startCalorieCalculation();
        } else {
            stopLocationTracking();
            stopCalorieCalculation();
        }
        return () => {
            stopLocationTracking();
            stopCalorieCalculation();
        };
    }, [cardioState, startCalorieCalculation]);


    const resetCardioState = useCallback(() => {
        setCardioState('idle');
        setCardioTime(0);
        setDistance(0);
        setLastPosition(null);
        setLocationError(null);
        setElevationGain(0);
        setCalories(0);
        setCadence(0);
        setHeartRate(0);
        setAvgHeartRate(0);
        setHeartRateValues([]);
        setCurrentSpeed(0);
        setCurrentIncline(0);
        stopLocationTracking();
        stopCalorieCalculation();
    },[stopCalorieCalculation]);
    
    const calculatePace = () => {
        if (distance === 0 || cardioTime === 0) return "0'00\"";
        const pace = cardioTime / 60 / distance;
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
    };

    const calculateAvgSpeed = () => {
        if (distance === 0 || cardioTime === 0) return "0.0";
        const avgSpeed = (distance / (cardioTime / 3600));
        return avgSpeed.toFixed(1);
    }
    
    useEffect(() => {
        if (screen === 'rest' && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft <= 0 && screen === 'rest') {
            finishRest();
        }
        return () => {
            if(timerRef.current) clearTimeout(timerRef.current)
        };
    }, [screen, timeLeft]);

    useEffect(() => {
        if (cardioState === 'running') {
            cardioTimerRef.current = setInterval(() => setCardioTime(prev => prev + 1), 1000);
        } else {
            if (cardioTimerRef.current) clearInterval(cardioTimerRef.current);
        }
        return () => {
            if (cardioTimerRef.current) clearInterval(cardioTimerRef.current);
        };
    }, [cardioState]);
    
    useEffect(() => {
        if (screen === 'workout') {
            setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
        }
        if (screen === 'rest') {
            setRestQuote(restQuotes[Math.floor(Math.random() * restQuotes.length)]);
        }
    }, [screen, currentExerciseIndex, currentSet]);

    const formatCardioTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');

        if (hours > 0) return `${hours.toString().padStart(2, '0')}:${paddedMinutes}:${paddedSeconds}`;
        return `${paddedMinutes}:${paddedSeconds}`;
    };

    const addExercise = (e: React.MouseEvent<HTMLButtonElement>) => {
        const form = (e.target as HTMLElement).closest('form');
        if (!form) return;
    
        const formData = new FormData(form);
        
        const newExercise: Exercise = {
            id: Date.now(),
            name: formData.get('exercise-name') as string,
            type: 'musculacao',
            sets: formData.get('exercise-sets') as string,
            reps: formData.get('exercise-reps') as string,
            weight: formData.get('exercise-weight') as string,
            restTime: formData.get('exercise-rest-time') as string,
            notes: formData.get('exercise-notes') as string,
        };

        if (newExercise.name) {
            setExercises([...exercises, newExercise]);
            form.reset();
            (document.getElementById('exercise-name') as HTMLInputElement)?.focus();
        }
    };

    const removeExercise = (id: number) => setExercises(exercises.filter(ex => ex.id !== id));

    const startWorkout = () => {
        const currentWorkoutExercises = exercises.filter(ex => ex.type === exerciseType);

        if (exerciseType !== 'musculacao') {
           const form = document.getElementById('add-exercise-form') as HTMLFormElement;
           if (!form) return;
           const formData = new FormData(form);
           const newExercise: Exercise = {
               id: Date.now(),
               name: exerciseType === 'corrida' ? 'Corrida' : 'Caminhada',
               type: exerciseType,
               time: formData.get('exercise-time') as string,
               distance: formData.get('exercise-distance') as string,
               notes: formData.get('exercise-notes') as string,
           };
            // Replace only cardio exercises, keep musculacao
            const nonCardioExercises = exercises.filter(ex => ex.type === 'musculacao');
            setExercises([...nonCardioExercises, newExercise]);
            setCurrentExerciseIndex(0);
            setCurrentSet(1);
            setScreen('workout');
            resetCardioState();
        } else if (currentWorkoutExercises.length > 0) {
            const firstExerciseOfTypeIndex = exercises.findIndex(ex => ex.type === exerciseType);
            setCurrentExerciseIndex(firstExerciseOfTypeIndex >= 0 ? firstExerciseOfTypeIndex : 0);
            setCurrentSet(1);
            setScreen('workout');
            resetCardioState();
        }
    };
    
    const moveToNextSetOrExercise = () => {
        const currentWorkoutExercises = exercises.filter(ex => ex.type === currentExercise.type);
        const currentWorkoutIndex = currentWorkoutExercises.findIndex(ex => ex.id === currentExercise.id);

        const totalSets = currentExercise.sets ? parseInt(currentExercise.sets) : 1;

        if (currentSet < totalSets) {
            setCurrentSet(currentSet + 1);
        } else {
            if (currentWorkoutIndex < currentWorkoutExercises.length - 1) {
                const nextExerciseInWorkout = currentWorkoutExercises[currentWorkoutIndex + 1];
                const nextGeneralIndex = exercises.findIndex(ex => ex.id === nextExerciseInWorkout.id);
                setCurrentExerciseIndex(nextGeneralIndex);
                setCurrentSet(1);
            } else {
                saveWorkoutToHistory();
                setScreen('finished');
                return;
            }
        }
        setScreen('workout');
    };

    const completeSet = () => {
        const currentWorkoutExercises = exercises.filter(ex => ex.type === currentExercise.type);
        const currentWorkoutIndex = currentWorkoutExercises.findIndex(ex => ex.id === currentExercise.id);
        const isLastExerciseInWorkout = currentWorkoutIndex >= currentWorkoutExercises.length - 1;

        if (currentExercise.type !== 'musculacao') {
            setCardioState('idle');
            stopLocationTracking();
            const finalHeartRateValues = heartRateValues.filter(hr => hr > 0);
            if (finalHeartRateValues.length > 0) {
                const sum = finalHeartRateValues.reduce((a, b) => a + b, 0);
                setAvgHeartRate(Math.round(sum / finalHeartRateValues.length));
            }
            saveWorkoutToHistory();
            setScreen('finished');
            return;
        }

        const totalSets = currentExercise.sets ? parseInt(currentExercise.sets) : 1;
        const isLastSet = currentSet >= totalSets;

        if (isLastSet && isLastExerciseInWorkout) {
            saveWorkoutToHistory();
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
        setExercises(exercises.filter(ex => ex.type !== activeTab));
        setScreen('builder');
        resetCardioState();
    }

    const handleNavClick = (type: ExerciseType | 'profile') => {
        if(type === 'profile') {
            setActiveTab('profile');
        } else {
            setActiveTab(type);
            setExerciseType(type);
        }
    };
    
    const handleShareWorkout = async () => {
        const lastWorkout = workoutHistory[0];
        if (!lastWorkout) return;

        const isCardio = lastWorkout.type === 'corrida' || lastWorkout.type === 'caminhada';
        let shareText = `Confira meu treino de hoje! 💪\n\n`;
        shareText += `Tipo: ${lastWorkout.name}\n`;
        shareText += `Data: ${new Date(lastWorkout.date).toLocaleDateString('pt-BR')}\n\n`;

        if (isCardio) {
            shareText += `⏱️ Tempo: ${formatCardioTime(lastWorkout.cardioTime || 0)}\n`;
            shareText += `📍 Distância: ${(lastWorkout.distance || 0).toFixed(2)} km\n`;
            shareText += `🔥 Calorias: ${lastWorkout.calories || 0} kcal\n`;
            shareText += `🏃 Pace Médio: ${lastWorkout.avgPace}\n`;
            shareText += `💨 Veloc. Média: ${lastWorkout.avgSpeed} km/h\n`;
            if (lastWorkout.avgHeartRate && lastWorkout.avgHeartRate > 0) {
                shareText += `❤️ BPM Médio: ${lastWorkout.avgHeartRate} bpm\n`;
            }
        } else {
            shareText += "Exercícios:\n";
            lastWorkout.exercises.forEach(ex => {
                shareText += `- ${ex.name}: ${ex.sets}x${ex.reps} com ${ex.weight || 'peso corporal'}\n`;
            });
        }

        shareText += `\n#TreinoPro #Fitness`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Treino Concluído!',
                    text: shareText,
                });
            } catch (error) {
                console.error('Erro ao compartilhar:', error);
            }
        } else {
            alert('A função de compartilhar não é suportada neste navegador.');
        }
    };

    const currentExercise = exercises[currentExerciseIndex];
    const filteredExercises = exercises.filter(ex => ex.type === exerciseType);

    const renderMainContent = () => {
        if (screen === 'workout' || screen === 'rest' || screen === 'finished') {
            const workoutType = (screen === 'finished' ? workoutHistory[0]?.type : currentExercise?.type);
            if(activeTab === workoutType) {
                 if (screen === 'workout') return renderWorkoutScreen();
                 if (screen === 'rest') return renderRestScreen();
                 if (screen === 'finished') return renderFinishedScreen();
            }
        }
        return renderBuilder();
    };


    const renderBuilder = () => {
        return (
            <div className="flex flex-col min-h-full p-4 pt-10">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight">
                        {exerciseType === 'musculacao' && 'Monte seu Treino'}
                        {exerciseType === 'corrida' && 'Defina sua Corrida'}
                        {exerciseType === 'caminhada' && 'Defina sua Caminhada'}
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Adicione os exercícios para sua rotina.</p>
                </header>

                <div className="flex flex-col flex-grow">
                     <form id="add-exercise-form" className="flex flex-col flex-grow" onSubmit={(e) => e.preventDefault()}>
                        <div className={`gradient-border ${filteredExercises.length > 0 ? 'flex-shrink' : 'flex-grow flex'}`}>
                            <div className={`gradient-border-content ${filteredExercises.length === 0 && exerciseType === 'musculacao' ? 'w-full flex flex-col' : ''}`}>
                                <h2 className="text-xl font-semibold mb-5 text-white">Adicionar Exercício</h2>
                                <div className="flex-grow space-y-4">
                                    {exerciseType === 'musculacao' && (
                                        <>
                                            <div>
                                                <label htmlFor="exercise-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Exercício</label>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <Dumbbell className="w-5 h-5 text-gray-400" />
                                                    </span>
                                                    <Input type="text" id="exercise-name" name="exercise-name" placeholder="Ex: Supino Reto" required className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 text-white focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="exercise-sets" className="block text-sm font-medium text-gray-300 mb-1">Séries</label>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Layers className="h-5 w-5 text-gray-400" /></span>
                                                        <Input type="number" id="exercise-sets" name="exercise-sets" placeholder="Ex: 4" required className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="exercise-reps" className="block text-sm font-medium text-gray-300 mb-1">Repetições</label>
                                                     <div className="relative">
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Repeat className="h-5 w-5 text-gray-400" /></span>
                                                        <Input type="text" id="exercise-reps" name="exercise-reps" placeholder="Ex: 8-12" required className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="exercise-weight" className="block text-sm font-medium text-gray-300 mb-1">Peso (opcional)</label>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Weight className="h-5 w-5 text-gray-400" /></span>
                                                        <Input type="text" id="exercise-weight" name="exercise-weight" placeholder="Ex: 40kg" className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="exercise-rest-time" className="block text-sm font-medium text-gray-300 mb-1">Descanso (s)</label>
                                                    <div className="relative">
                                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Clock className="h-5 w-5 text-gray-400" /></span>
                                                        <Input type="number" id="exercise-rest-time" name="exercise-rest-time" placeholder="Ex: 60" className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    { (exerciseType === 'corrida' || exerciseType === 'caminhada') && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="exercise-time" className="block text-sm font-medium text-gray-300 mb-1">Tempo (meta)</label>
                                                     <Input type="text" id="exercise-time" name="exercise-time" placeholder="Ex: 30min" required className="w-full bg-gray-700/50 border-gray-600 rounded-lg px-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center" />
                                                </div>
                                                <div>
                                                    <label htmlFor="exercise-distance" className="block text-sm font-medium text-gray-300 mb-1">Distância (meta)</label>
                                                    <Input type="text" id="exercise-distance" name="exercise-distance" placeholder="Ex: 5km" className="w-full bg-gray-700/50 border-gray-600 rounded-lg px-4 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-center" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label htmlFor="exercise-notes" className="block text-sm font-medium text-gray-300 mb-1">Notas (opcional)</label>
                                        <Textarea id="exercise-notes" name="exercise-notes" rows={2} placeholder="Ex: Manter ritmo, observar postura..." className="w-full bg-gray-700/50 border-gray-600 rounded-lg px-4 py-2 text-white focus:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
                                    </div>
                                </div>
                               {exerciseType === 'musculacao' && (
                                <button type="button" onClick={addExercise} className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50">
                                    Adicionar à Rotina
                                </button>
                               )}
                            </div>
                        </div>

                        {exerciseType === 'musculacao' && (
                            <>
                                {filteredExercises.length > 0 && (
                                    <div className="gradient-border animate-fade-in mt-8 flex-grow flex flex-col">
                                        <div className="gradient-border-content flex-grow flex flex-col overflow-y-auto">
                                            <h2 className="text-xl font-semibold mb-5 text-white">Sua Rotina de Musculação</h2>
                                            <div id="workout-list-container" className="flex-grow">
                                                <ul id="workout-list" className="space-y-3">
                                                    {filteredExercises.map((ex, index) => (
                                                        <li id={`exercise-${ex.id}`} key={ex.id} className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg flex items-start justify-between transition-all duration-300 hover:bg-gray-700/80 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: `${index * 100}ms`}}>
                                                            <div className="flex items-center flex-grow pr-4">
                                                                <div className="mr-4 text-cyan-400">
                                                                    <Dumbbell className="w-6 h-6" />
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <h3 className="font-bold text-md text-cyan-300">{ex.name}</h3>
                                                                    <div className="text-sm text-gray-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                                                        {ex.sets && <span><strong>Séries:</strong> {ex.sets}</span>}
                                                                        {ex.reps && <span><strong>Repetições:</strong> {ex.reps}</span>}
                                                                        {ex.weight && <span><strong>Peso:</strong> {ex.weight}</span>}
                                                                        {ex.restTime && <span><strong>Descanso:</strong> {ex.restTime}s</span>}
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
                                        </div>
                                    </div>
                                )}
                                <div className="mt-auto pt-6 w-full">
                                    {filteredExercises.length > 0 && (
                                        <button type="button" onClick={startWorkout} id="start-workout-btn" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50">
                                            Iniciar Treino
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {(exerciseType === 'corrida' || exerciseType === 'caminhada') && (
                            <div className="mt-auto pt-6 w-full">
                                <button type="button" onClick={startWorkout} id="start-workout-btn" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50">
                                    Iniciar Treino
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        )
    }

    const renderWorkoutScreen = () => {
        if (!currentExercise) return null;
        const currentWorkoutExercises = exercises.filter(ex => ex.type === currentExercise.type);
        const currentWorkoutIndex = currentWorkoutExercises.findIndex(ex => ex.id === currentExercise.id);
        return (
            currentExercise.type === 'musculacao' ? (
                // Musculação UI
                <div className="min-h-full p-4 flex flex-col justify-between text-center relative">
                    <button onClick={() => setScreen('builder')} className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 transition-colors z-10 p-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="mt-12">
                        <p className="text-cyan-400 font-semibold mb-2">Exercício {currentWorkoutIndex + 1} de {currentWorkoutExercises.length}</p>
                        <h2 className="text-4xl font-bold text-white truncate px-12">{currentExercise.name}</h2>
                        <div className="text-gray-300 text-lg mt-2">
                            {currentExercise.reps && <span>{currentExercise.reps} Repetições</span>}
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
                    <button onClick={() => { setScreen('builder'); resetCardioState(); }} className="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 transition-colors z-10 p-2">
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
                            <p className="text-lg font-bold">{Math.round(calories)}</p>
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
        )
    }
    
    const renderRestScreen = () => {
        return (
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
        );
    }
    
    const renderFinishedScreen = () => {
        const lastWorkout = workoutHistory[0] || {};
        const isCardio = lastWorkout.type === 'corrida' || lastWorkout.type === 'caminhada';

        return (
           <div className="p-8 text-white space-y-6 overflow-y-auto custom-scrollbar h-full">
                <div className="text-center">
                    <Trophy className="text-5xl text-yellow-400 mb-3 animate-pop-in mx-auto" />
                    <h1 className="text-4xl font-black tracking-tighter uppercase animate-fade-in-up delay-100 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">Treino Finalizado!</h1>
                    <p className="text-gray-400 mt-1 animate-fade-in-up delay-200">Parabéns! Você mandou muito bem.</p>
                </div>

                 <div className="bg-gray-800/50 rounded-2xl p-6 space-y-5 animate-fade-in-up delay-300 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-baseline pb-4 border-b border-gray-700">
                         <h2 className="text-lg font-bold">{lastWorkout.name}</h2>
                        <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                            {new Date(lastWorkout.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} de {new Date(lastWorkout.date).getFullYear()}
                        </span>
                    </div>

                    {isCardio ? (
                         <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-gray-400 text-sm">Tempo</p>
                                <p className="text-2xl font-bold">{formatCardioTime(lastWorkout.cardioTime || 0)}</p>
                                <p className="text-xs text-gray-500">min</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Distância</p>
                                <p className="text-2xl font-bold">{(lastWorkout.distance || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">km</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Calorias</p>
                                <p className="text-2xl font-bold">{lastWorkout.calories || 0}</p>
                                <p className="text-xs text-gray-500">kcal (estimativa)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up delay-400 pt-4">
                             <h3 className="font-bold text-lg mb-3 text-cyan-300">Resumo dos Exercícios</h3>
                              <ul className="space-y-3">
                                  {lastWorkout.exercises.map((ex: Exercise, index: number) => (
                                      <li key={ex.id} className="text-sm border-b border-gray-700/50 pb-2 animate-fade-in-up" style={{ animationDelay: `${500 + index * 100}ms`}}>
                                          <p className="font-bold">{ex.name}</p>
                                          <p className="text-gray-400">{ex.sets} séries x {ex.reps} reps - {ex.weight}</p>
                                      </li>
                                  ))}
                              </ul>
                        </div>
                    )}
                </div>

                {isCardio && (
                     <>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in-up delay-400 transition-transform duration-300 hover:-translate-y-1">
                            <div className="bg-blue-500/20 p-2 rounded-full">
                                <Footprints className="text-blue-400 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Ritmo Médio</p>
                                <p className="font-bold animate-number-pop delay-500">{lastWorkout.avgPace} <span className="text-sm font-normal text-gray-500">/km</span></p>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in-up delay-500 transition-transform duration-300 hover:-translate-y-1">
                            <div className="bg-green-500/20 p-2 rounded-full">
                                 <GaugeCircle className="text-green-400 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Veloc. Média</p>
                                <p className="font-bold animate-number-pop delay-600">{lastWorkout.avgSpeed} <span className="text-sm font-normal text-gray-500">km/h</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-2xl p-4 animate-fade-in-up delay-600 transition-transform duration-300 hover:-translate-y-1">
                         {(lastWorkout.avgHeartRate || 0) > 0 ? (
                            <>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="bg-red-500/20 p-2 rounded-full">
                                        <HeartPulse className="text-red-400 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">Frequência Cardíaca</p>
                                        <p className="font-bold animate-number-pop delay-700">{lastWorkout.avgHeartRate || '--'} <span className="text-sm font-normal text-gray-500">bpm (média)</span></p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 h-2.5 rounded-full animate-fill-width" style={{ width: `${( (lastWorkout.avgHeartRate || 0) / 200) * 100}%`}}></div>
                                </div>
                                <div className="text-xs text-gray-500 flex justify-between mt-1">
                                    <span>Zona 2</span>
                                    <span>Zona 3</span>
                                    <span>Zona 4</span>
                                    <span>Zona 5</span>
                                </div>
                            </>
                        ) : null}
                    </div>
                    </>
                )}


                <div className="space-y-3 pt-4">
                    <button onClick={handleShareWorkout} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 animate-fade-in-up delay-800 hover:-translate-y-1 hover:shadow-lg">
                        <Share2 className="w-4 h-4"/>
                        <span>Compartilhar Treino</span>
                    </button>
                    <button onClick={startNewWorkout} className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 animate-fade-in-up delay-900 hover:-translate-y-1 hover:shadow-xl">
                        Começar um Novo Treino
                    </button>
                </div>

            </div>
        )
    }
    
    const renderProfileContent = () => {
        const totalWorkouts = workoutHistory.length;
        const totalCalories = workoutHistory.reduce((acc, workout) => acc + (workout.calories || 0), 0);
        const joinDate = new Date(userProfile.joinDate);
        const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return (
            <div className="p-4 pt-10 text-white custom-scrollbar h-full overflow-y-auto">
                <header className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-tight">
                        Meu Perfil
                    </h1>
                </header>

                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <Avatar className="w-24 h-24 border-4 border-cyan-400">
                           <AvatarImage src={tempProfile.profilePicture} alt={tempProfile.name} />
                            <AvatarFallback className="bg-gray-700 text-cyan-400 text-3xl font-bold">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button 
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1 border-2 border-gray-900"
                        >
                           <PlusCircle className="w-5 h-5 text-cyan-400" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                    <p className="text-gray-400 text-sm">Juntou-se em {joinDate.toLocaleDateString('pt-BR', { month: 'long' })} de {joinDate.getFullYear()}</p>
                </div>
                
                 {showProfileForm ? (
                    <div className="gradient-border mt-6">
                        <div className="gradient-border-content space-y-4">
                            <h3 className="text-lg font-semibold text-white text-center">Meus Dados</h3>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                                <input type="text" id="name" name="name" value={tempProfile.name} onChange={handleProfileChange} className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="weight" className="block text-sm font-medium text-gray-400 mb-1">Peso (kg)</label>
                                    <input type="number" id="weight" name="weight" value={tempProfile.weight || ''} onChange={handleProfileChange} className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-gray-400 mb-1">Altura (cm)</label>
                                    <input type="number" id="height" name="height" value={tempProfile.height || ''} onChange={handleProfileChange} className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-400 mb-1">Idade</label>
                                    <input type="number" id="age" name="age" value={tempProfile.age || ''} onChange={handleProfileChange} className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                </div>
                                <div>
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-400 mb-1">Sexo</label>
                                    <select id="gender" name="gender" value={tempProfile.gender} onChange={handleProfileChange} className="w-full bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-[42px]">
                                        <option value="male">Masculino</option>
                                        <option value="female">Feminino</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={saveProfile} className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
                                <Save className="w-4 h-4"/>
                                Salvar Dados
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 text-center">
                        <div className="bg-gray-800/50 rounded-2xl p-4 grid grid-cols-3 gap-4">
                            <div>
                               <p className="font-bold text-lg text-gray-400">{userProfile.weight}<span className="text-sm"> kg</span></p>
                               <p className="text-xs text-gray-500">Peso</p>
                            </div>
                             <div>
                               <p className="font-bold text-lg text-gray-400">{userProfile.height}<span className="text-sm"> cm</span></p>
                               <p className="text-xs text-gray-500">Altura</p>
                            </div>
                             <div>
                               <p className="font-bold text-lg text-gray-400">{userProfile.age}<span className="text-sm"> anos</span></p>
                               <p className="text-xs text-gray-500">Idade</p>
                            </div>
                        </div>
                        <button onClick={() => setShowProfileForm(true)} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2 mx-auto">
                            <Edit className="w-3 h-3"/>
                            Editar Dados
                        </button>
                    </div>
                )}


                 <div className="gradient-border mt-6">
                    <div className="gradient-border-content">
                        <h3 className="text-lg font-semibold mb-4 text-white text-center">Estatísticas Gerais</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-cyan-400">{totalWorkouts}</p>
                                <p className="text-sm text-gray-400">Treinos Concluídos</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-cyan-400">{totalCalories.toLocaleString('pt-BR')}</p>
                                <p className="text-sm text-gray-400">Total de Calorias</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 mb-4">
                    <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-cyan-400"/>
                        Histórico de Treinos
                    </h3>
                     {workoutHistory.length === 0 ? (
                        <div className="text-center text-gray-500 bg-gray-800/50 rounded-lg p-6">
                            <p>Nenhum treino registrado ainda.</p>
                            <p className="text-sm mt-1">Complete seu primeiro treino para vê-lo aqui!</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {workoutHistory.map(workout => (
                                <li key={workout.id} className="bg-gray-800/50 rounded-xl p-4 transition-all hover:bg-gray-800/80 hover:scale-[1.02] flex justify-between items-start">
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                {workout.type === 'musculacao' && <Dumbbell className="w-6 h-6 text-cyan-400" />}
                                                {workout.type === 'corrida' && <Route className="w-6 h-6 text-cyan-400" />}
                                                {workout.type === 'caminhada' && <Footprints className="w-6 h-6 text-cyan-400" />}
                                            </div>
                                            <span className="font-bold text-lg">{workout.name}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3"/>
                                                {new Date(workout.date).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        {workout.type === 'musculacao' ? (
                                            <ul className="text-sm space-y-1 text-gray-300 pl-2">
                                                {workout.exercises.map(ex => (
                                                    <li key={ex.id}>- {ex.name}: {ex.sets}x{ex.reps} {ex.weight && ` com ${ex.weight}`}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 text-center text-sm pt-2 border-t border-gray-700/50">
                                                <div>
                                                    <p className="font-bold">{formatCardioTime(workout.cardioTime || 0)}</p>
                                                    <p className="text-xs text-gray-500">Tempo</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">{(workout.distance || 0).toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">Dist (km)</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">{workout.calories || 0}</p>
                                                    <p className="text-xs text-gray-500">Calorias</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button onClick={() => setWorkoutToDelete(workout.id)} className="ml-4 flex-shrink-0 text-gray-500 hover:text-red-500 transition-colors p-1">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </AlertDialogTrigger>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>


                 {workoutToDelete !== null && (
                    <AlertDialog open={workoutToDelete !== null} onOpenChange={(open) => !open && setWorkoutToDelete(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Treino</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir este treino do seu histórico? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setWorkoutToDelete(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteWorkout}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        );
    };

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
            <main className="phone-frame">
                 {isLoadingSplash ? (
                    <SplashScreen isExiting={isExitingSplash} />
                ) : (
                    <>
                        <div className="phone-content custom-scrollbar fade-in-main">
                            {activeTab === 'profile' ? renderProfileContent() : renderMainContent()}
                        </div>
                        <nav className="bottom-nav bg-gray-900/50 backdrop-blur-md border-t border-gray-700/50 mt-auto fade-in-main" style={{ backgroundColor: 'rgba(2, 6, 23, 0.7)' }}>
                            <div className="flex justify-around items-center h-16">
                                <button 
                                    onClick={() => handleNavClick('musculacao')} 
                                    className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${activeTab === 'musculacao' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                     <Dumbbell className="w-7 h-7" />
                                    <span className="text-xs mt-1">Musculação</span>
                                </button>
                                <button 
                                    onClick={() => handleNavClick('corrida')} 
                                     className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${activeTab === 'corrida' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Route className="w-7 h-7" />
                                    <span className="text-xs mt-1">Corrida</span>
                                </button>
                                <button 
                                    onClick={() => handleNavClick('caminhada')} 
                                     className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${activeTab === 'caminhada' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <Footprints className="w-7 h-7" />
                                    <span className="text-xs mt-1">Caminhada</span>
                                </button>
                                 <button 
                                    onClick={() => handleNavClick('profile')} 
                                    className={`flex flex-col items-center justify-center w-full transition-colors duration-300 ${activeTab === 'profile' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <User className="w-7 h-7" />
                                    <span className="text-xs mt-1">Perfil</span>
                                </button>
                            </div>
                        </nav>
                    </>
                 )}
            </main>
        </>
    );
}
