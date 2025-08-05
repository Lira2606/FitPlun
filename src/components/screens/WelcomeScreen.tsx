'use client';
import { useWorkout } from '@/hooks/use-workout';
import { BicepIcon } from '@/components/icons/BicepIcon';
import { Button } from '@/components/ui/button';

export function WelcomeScreen() {
    const { state, dispatch } = useWorkout();

    return (
        <div className="screen justify-center text-center">
            <h1 className="font-bebas text-5xl mb-2 text-white flex items-center justify-center gap-3">
                <BicepIcon className="h-8 w-8 text-primary" />
                TREINO PRO
            </h1>
            <p className="text-gray-400 mb-8">
                {state.hasPreviousWorkout ? 'Seu último treino foi salvo.' : 'Pronto para começar?'}
            </p>
            <div className="w-full max-w-xs">
                {state.hasPreviousWorkout && (
                    <Button
                        onClick={() => dispatch({ type: 'CONTINUE_WORKOUT' })}
                        className="w-full mb-4 btn-primary text-white font-bold py-3 h-auto px-4 rounded-xl text-lg transition transform hover:scale-105"
                    >
                        Continuar Treino
                    </Button>
                )}
                <Button
                    onClick={() => dispatch({ type: 'START_NEW_WORKOUT' })}
                    variant="secondary"
                    className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 h-auto px-4 rounded-xl text-lg transition"
                >
                    Criar Novo Treino
                </Button>
            </div>
        </div>
    );
}
