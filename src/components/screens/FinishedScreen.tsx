'use client';
import { useWorkout } from '@/hooks/use-workout';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FinishedScreen() {
    const { state, dispatch } = useWorkout();

    return (
        <div className="screen justify-start pt-16 text-center">
            <h2 className="font-bebas text-5xl mb-2 text-primary text-glow">TREINO CONCLUÍDO!</h2>
            <p className="text-gray-400 mb-6">Bom trabalho, guerreiro(a)!</p>
            <ScrollArea className="w-full max-w-xs flex-grow glass-card p-4 rounded-lg mb-6">
                <div id="summary-list" className="text-left">
                    {state.workoutPlan.map(ex => (
                        <div key={ex.id} className="mb-3 pb-3 border-b border-gray-700 last:border-b-0 last:pb-0 last:mb-0">
                            <p className="font-semibold text-white">{ex.name}</p>
                            <p className="text-sm text-gray-400">{ex.sets} séries x {ex.reps} reps @ {ex.weight}</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="w-full max-w-xs pb-4">
                <Button onClick={() => dispatch({ type: 'FINISH_WORKOUT' })} className="w-full btn-primary font-bold py-4 px-4 rounded-xl text-lg h-auto transition flex items-center justify-center gap-2">
                    <RefreshCcw className="h-5 w-5" />
                    NOVO TREINO
                </Button>
            </div>
        </div>
    );
}
