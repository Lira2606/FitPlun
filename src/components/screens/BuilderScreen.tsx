'use client';
import { useWorkout } from '@/hooks/use-workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState } from 'react';
import type { Exercise } from '@/types';
import { Trash2, Sparkles, PlusCircle } from 'lucide-react';
import { generateWorkout } from '@/ai/flows/generate-workout-flow';

type BuilderMode = 'ai' | 'manual' | null;

export function BuilderScreen() {
    const { state, dispatch } = useWorkout();
    const [exercise, setExercise] = useState({ name: '', sets: '', reps: '', weight: '', notes: '' });
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<BuilderMode>(null);

    const handleAddExercise = () => {
        const setsNum = parseInt(exercise.sets, 10);
        if (exercise.name && setsNum > 0 && exercise.reps && exercise.weight) {
            dispatch({ type: 'ADD_EXERCISE', payload: { ...exercise, sets: setsNum } });
            setExercise({ name: '', sets: '', reps: '', weight: '', notes: '' });
        }
    };

    const handleGenerateWorkout = async () => {
      setIsLoading(true);
      try {
        const workoutPlan = await generateWorkout(goal);
        workoutPlan.forEach(ex => {
          dispatch({ type: 'ADD_EXERCISE', payload: ex });
        });
        setGoal(''); 
        setMode(null);
      } catch (error) {
        console.error("Failed to generate workout", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setExercise({ ...exercise, [e.target.name]: e.target.value });
    };

    const renderForm = () => {
      switch (mode) {
        case 'ai':
          return (
            <div className="w-full max-w-xs space-y-3 animate-fadeIn">
              <div className="glass-card p-4 space-y-3">
                <Textarea name="goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="glass-card text-center text-base" placeholder="Descreva seu objetivo (ex: treino de peito e tríceps para hipertrofia)" rows={3} />
                <Button onClick={handleGenerateWorkout} variant="secondary" className="w-full bg-primary/20 border border-primary/50 hover:bg-primary/30 font-semibold py-3 h-auto rounded-xl flex items-center gap-2" disabled={isLoading || !goal}>
                  {isLoading ? 'Gerando...' : <> <Sparkles className="h-4 w-4"/> Gerar Treino </>}
                </Button>
              </div>
            </div>
          );
        case 'manual':
          return (
            <div className="w-full max-w-xs space-y-3 animate-fadeIn">
              <Input type="text" name="name" value={exercise.name} onChange={handleInputChange} className="glass-card text-center text-base" placeholder="Nome do exercício" />
              <div className="grid grid-cols-2 gap-3">
                  <Input type="number" name="sets" value={exercise.sets} onChange={handleInputChange} className="glass-card text-center text-base" placeholder="Séries" />
                  <Input type="text" name="reps" value={exercise.reps} onChange={handleInputChange} className="glass-card text-center text-base" placeholder="Reps (ex: 8-12)" />
              </div>
              <Input type="text" name="weight" value={exercise.weight} onChange={handleInputChange} className="glass-card text-center text-base" placeholder="Peso (ex: 40kg)" />
              <Textarea name="notes" value={exercise.notes} onChange={handleInputChange} className="glass-card text-center text-base" placeholder="Notas (opcional)" rows={2} />
              <Button onClick={handleAddExercise} variant="secondary" className="w-full bg-gray-700 hover:bg-gray-600 font-semibold py-3 h-auto rounded-xl">Adicionar Exercício</Button>
            </div>
          );
        default:
          return null;
      }
    }

    return (
        <div className="screen justify-start pt-16 text-center">
            <h2 className="font-bebas text-4xl mb-4 text-primary text-glow">Monte seu Treino</h2>
            
            <div className="w-full max-w-xs space-y-3 mb-4">
              {mode === null ? (
                <div className="flex flex-col space-y-3 animate-fadeIn">
                    <Button onClick={() => setMode('ai')} variant="secondary" className="w-full bg-primary/20 border border-primary/50 hover:bg-primary/30 font-semibold py-3 h-auto rounded-xl flex items-center gap-2">
                        <Sparkles className="h-4 w-4"/> Gerar com IA
                    </Button>
                    <Button onClick={() => setMode('manual')} variant="secondary" className="w-full bg-gray-700 hover:bg-gray-600 font-semibold py-3 h-auto rounded-xl flex items-center gap-2">
                        <PlusCircle className="h-4 w-4"/> Adicionar Manualmente
                    </Button>
                </div>
              ) : (
                <Button onClick={() => setMode(null)} variant="ghost" size="sm" className="mb-2 text-gray-400">Voltar</Button>
              )}
              {renderForm()}
            </div>
            
            <ScrollArea className="flex-grow mt-4 w-full max-w-xs">
                <div id="exercise-list" className="p-2">
                    {state.workoutPlan.length === 0 ? (
                        <p className="text-gray-500">Nenhum exercício adicionado.</p>
                    ) : (
                        state.workoutPlan.map((ex: Exercise) => (
                            <div key={ex.id} className="glass-card p-3 rounded-lg mb-2 text-left animate-fadeIn">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-semibold">{ex.name}</span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => dispatch({ type: 'REMOVE_EXERCISE', payload: { id: ex.id }})}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {ex.sets} séries de {ex.reps} com {ex.weight}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
            <div className="w-full max-w-xs mt-auto pb-4">
                <Button onClick={() => dispatch({ type: 'START_WORKOUT'})} className="w-full btn-primary font-bebas text-2xl py-3 h-auto rounded-xl" disabled={state.workoutPlan.length === 0}>
                    INICIAR TREINO
                </Button>
            </div>
        </div>
    );
}
