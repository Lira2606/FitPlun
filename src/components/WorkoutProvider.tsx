'use client';
import React, { createContext, useReducer, useEffect, useRef, useCallback } from 'react';
import type { WorkoutState, Action, Exercise } from '@/types';

const initialState: WorkoutState = {
  workoutPlan: [],
  currentExerciseIndex: 0,
  currentSet: 1,
  screen: 'welcome',
  restTime: 60,
  isInitialized: false,
  hasPreviousWorkout: false,
};

let exerciseIdCounter = 0;
const generateUniqueId = () => {
  return `${new Date().toISOString()}_${exerciseIdCounter++}`;
}

const workoutReducer = (state: WorkoutState, action: Action): WorkoutState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, ...action.payload, isInitialized: true };
    case 'CONTINUE_WORKOUT':
      return { ...state, screen: 'workout' };
    case 'START_NEW_WORKOUT':
      return { ...state, workoutPlan: [], currentExerciseIndex: 0, currentSet: 1, screen: 'builder', hasPreviousWorkout: false };
    case 'ADD_EXERCISE':
      return { ...state, workoutPlan: [...state.workoutPlan, { ...action.payload, id: generateUniqueId() }] };
    case 'REMOVE_EXERCISE':
      return { ...state, workoutPlan: state.workoutPlan.filter(ex => ex.id !== action.payload.id) };
    case 'START_WORKOUT':
      if (state.workoutPlan.length === 0) return state;
      return { ...state, screen: 'workout', currentExerciseIndex: 0, currentSet: 1 };
    case 'COMPLETE_SET': {
      const exercise = state.workoutPlan[state.currentExerciseIndex];
      const isLastSet = state.currentSet >= exercise.sets;
      const isLastExercise = state.currentExerciseIndex >= state.workoutPlan.length - 1;

      if (isLastSet && isLastExercise) {
        return { ...state, screen: 'finished' };
      }
      return { ...state, screen: 'rest' };
    }
    case 'FINISH_REST': {
        const exercise = state.workoutPlan[state.currentExerciseIndex];
        const isLastSet = state.currentSet >= exercise.sets;
        let nextSet = state.currentSet + 1;
        let nextExerciseIndex = state.currentExerciseIndex;

        if (isLastSet) {
            nextSet = 1;
            nextExerciseIndex++;
        }
        return { ...state, screen: 'workout', currentSet: nextSet, currentExerciseIndex: nextExerciseIndex };
    }
    case 'SKIP_REST':
      return { ...state, screen: 'workout' };
    case 'FINISH_WORKOUT':
        return { ...initialState, screen: 'builder', isInitialized: true, hasPreviousWorkout: false };
    case 'SET_REST_TIME':
        return { ...state, restTime: action.payload };
    default:
      return state;
  }
};

export const WorkoutContext = createContext<{
  state: WorkoutState;
  dispatch: React.Dispatch<Action>;
  playSound: () => void;
  vibrate: () => void;
} | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(workoutReducer, initialState);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    if (!audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("AudioContext not supported");
            return;
        }
    }
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  }, []);

  const vibrate = useCallback(() => {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
  }, []);


  useEffect(() => {
    try {
      const savedState = localStorage.getItem('treinoProState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'INITIALIZE', payload: { ...parsedState, screen: 'welcome', hasPreviousWorkout: true } });
      } else {
        dispatch({ type: 'INITIALIZE', payload: { screen: 'builder', hasPreviousWorkout: false } });
      }
    } catch (error) {
        console.error("Could not load state from localStorage", error);
        dispatch({ type: 'INITIALIZE', payload: { screen: 'builder' } });
    }
  }, []);

  useEffect(() => {
    if (state.isInitialized) {
        if(state.screen === 'finished') {
            localStorage.removeItem('treinoProState');
        } else if (state.screen !== 'welcome' && state.screen !== 'builder') {
             try {
                const stateToSave = { ...state, screen: 'workout' }; // always return to workout screen
                localStorage.setItem('treinoProState', JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Could not save state to localStorage", error);
            }
        } else if (state.screen === 'builder' && !state.hasPreviousWorkout) {
            localStorage.removeItem('treinoProState');
        }
    }
  }, [state]);

  return (
    <WorkoutContext.Provider value={{ state, dispatch, playSound, vibrate }}>
      {children}
    </WorkoutContext.Provider>
  );
};
