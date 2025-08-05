'use client';
import { useWorkout } from '@/hooks/use-workout';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { BuilderScreen } from '@/components/screens/BuilderScreen';
import { WorkoutScreen } from '@/components/screens/WorkoutScreen';
import { RestScreen } from '@/components/screens/RestScreen';
import { FinishedScreen } from '@/components/screens/FinishedScreen';
import { BicepIcon } from '@/components/icons/BicepIcon';

export default function Home() {
  const { state } = useWorkout();

  if (!state.isInitialized) {
    return (
      <div className="app-bg flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
            <BicepIcon className="h-12 w-12 text-orange-500" />
            <h1 className="font-bebas text-5xl text-white mt-2">TREINO PRO</h1>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (state.screen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'builder':
        return <BuilderScreen />;
      case 'workout':
        return <WorkoutScreen />;
      case 'rest':
        return <RestScreen />;
      case 'finished':
        return <FinishedScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <main className="app-bg h-full w-full overflow-hidden">
      {renderScreen()}
    </main>
  );
}
