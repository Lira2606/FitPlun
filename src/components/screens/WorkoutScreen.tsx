'use client';
import { useWorkout } from '@/hooks/use-workout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function WorkoutScreen() {
    const { state, dispatch, vibrate } = useWorkout();
    const router = useRouter();
    const exercise = state.workoutPlan[state.currentExerciseIndex];
    const nextExercise = state.workoutPlan[state.currentExerciseIndex + 1];

    if (!exercise) {
        // This case should ideally not happen if logic is correct
        return (
            <div className="screen justify-center text-center">
                <p>Exercício não encontrado. Voltando...</p>
                <Button onClick={() => dispatch({type: 'START_NEW_WORKOUT'})}>Novo Treino</Button>
            </div>
        )
    }
    
    const handleCompleteSet = () => {
        vibrate();
        dispatch({ type: 'COMPLETE_SET' });
    }

    return (
        <div className="screen justify-between py-10 text-center">
            <div className="w-full">
                <p id="workout-progress" className="text-primary font-semibold mb-1">
                    Exercício {state.currentExerciseIndex + 1} de {state.workoutPlan.length}
                </p>
                <h2 id="current-exercise-name" className="font-bebas text-5xl text-white truncate">{exercise.name}</h2>
                <div className="text-gray-400 flex justify-center gap-4 mt-1">
                    <span id="current-reps">Reps: {exercise.reps}</span>
                    <span id="current-weight">Peso: {exercise.weight}</span>
                </div>
                <p id="current-notes" className="text-sm text-gray-500 mt-2 h-10">{exercise.notes || ''}</p>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center">
                <h3 className="font-bebas text-2xl mb-1 text-gray-400">SÉRIES RESTANTES</h3>
                <p id="sets-display" className="font-bebas text-white leading-none text-[10rem]">{exercise.sets - state.currentSet + 1}</p>
            </div>
            <div className="w-full max-w-xs">
                <Button
                    onClick={handleCompleteSet}
                    className="w-full bg-white hover:bg-gray-200 text-gray-900 font-bold py-4 px-4 rounded-xl text-lg transition transform active:scale-95 flex items-center justify-center gap-2 h-auto"
                >
                    <Check className="h-6 w-6" strokeWidth={3} />
                    CONCLUIR SÉRIE
                </Button>
                <p id="next-exercise-preview" className="text-gray-500 mt-3 text-sm h-5">
                    {nextExercise ? `A seguir: ${nextExercise.name}` : 'Último exercício!'}
                </p>
            </div>
        </div>
    );
}
