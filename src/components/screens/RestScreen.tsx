'use client';
import { useWorkout } from '@/hooks/use-workout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RestScreen() {
    const { state, dispatch, playSound } = useWorkout();
    const [timeLeft, setTimeLeft] = useState(state.restTime);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setTimeLeft(state.restTime);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.restTime, state.currentExerciseIndex, state.currentSet]); // Reruns timer when a new rest period starts

    useEffect(() => {
        if (timeLeft <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            playSound();
            dispatch({ type: 'FINISH_REST' });
        }
    }, [timeLeft, dispatch, playSound]);

    const handleSkip = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        dispatch({ type: 'FINISH_REST' });
    }

    const progress = (timeLeft / state.restTime) * 100;
    const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

    return (
        <div className="screen justify-center items-center text-center">
            <h2 className="font-bebas text-5xl mb-4 text-primary text-glow">DESCANSO</h2>
            <div className="relative w-52 h-52 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="ring-progress-track" cx="50" cy="50" r={RADIUS} strokeWidth="8" fill="transparent"></circle>
                    <circle
                        id="progress-ring"
                        className="ring-progress-fill"
                        cx="50"
                        cy="50"
                        r={RADIUS}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                    ></circle>
                </svg>
                <p id="timer-display" className="font-bebas text-7xl text-white absolute">{timeLeft > 0 ? timeLeft : 0}</p>
            </div>
            <Input
                type="number"
                id="rest-time-input"
                className="glass-card text-center text-lg w-32 py-2 px-3 h-auto mb-4"
                value={state.restTime}
                onChange={(e) => dispatch({type: 'SET_REST_TIME', payload: parseInt(e.target.value, 10) || 60 })}
            />
            <div className="w-full max-w-xs">
                <Button onClick={handleSkip} variant="secondary" className="w-full bg-gray-700 hover:bg-gray-600 font-bold py-3 px-4 rounded-xl h-auto transition">
                    Pular Descanso
                </Button>
            </div>
        </div>
    );
}
