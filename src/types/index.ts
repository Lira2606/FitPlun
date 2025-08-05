export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
}

export type ScreenType = 'welcome' | 'builder' | 'workout' | 'rest' | 'finished';

export interface WorkoutState {
  workoutPlan: Exercise[];
  currentExerciseIndex: number;
  currentSet: number;
  screen: ScreenType;
  restTime: number; // in seconds
  isInitialized: boolean;
  hasPreviousWorkout: boolean;
}

export type Action =
  | { type: 'INITIALIZE'; payload: Partial<WorkoutState> }
  | { type: 'CONTINUE_WORKOUT' }
  | { type: 'START_NEW_WORKOUT' }
  | { type: 'ADD_EXERCISE'; payload: Omit<Exercise, 'id'> }
  | { type: 'REMOVE_EXERCISE'; payload: { id: string } }
  | { type: 'START_WORKOUT' }
  | { type: 'COMPLETE_SET' }
  | { type: 'FINISH_REST' }
  | { type: 'SKIP_REST' }
  | { type: 'FINISH_WORKOUT' }
  | { type: 'SET_REST_TIME'; payload: number };
