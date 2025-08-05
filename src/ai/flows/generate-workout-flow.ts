'use server';
/**
 * @fileOverview A workout generation AI agent.
 *
 * - generateWorkout - A function that handles the workout generation process.
 * - GenerateWorkoutInput - The input type for the generateWorkout function.
 * - GenerateWorkoutOutput - The return type for the generateWorkout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExerciseSchema = z.object({
  name: z.string().describe('The name of the exercise.'),
  sets: z.number().describe('The number of sets for the exercise.'),
  reps: z.string().describe('The repetition range for the exercise (e.g., "8-12").'),
  weight: z.string().describe('The suggested weight for the exercise (e.g., "40kg" or "Bodyweight").'),
  notes: z.string().optional().describe('Optional notes or tips for the exercise.'),
});

const GenerateWorkoutInputSchema = z.string().describe('The user\'s workout goal.');
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;

const GenerateWorkoutOutputSchema = z.array(ExerciseSchema);
export type GenerateWorkoutOutput = z.infer<typeof GenerateWorkoutOutputSchema>;

export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutOutput> {
  return generateWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  input: {schema: GenerateWorkoutInputSchema},
  output: {schema: GenerateWorkoutOutputSchema},
  prompt: `You are a world-class personal trainer. A user will provide you with their workout goal. Create a concise and effective workout plan with 4 to 6 exercises that directly target their goal. 

Return the plan as a JSON array of exercises. Do not include any exercises that are not directly related to the user's goal. For the weight, you can suggest a specific weight if appropriate, or use terms like "Bodyweight", "Medium", or "Light".

User's goal: {{{prompt}}}`
});

const generateWorkoutFlow = ai.defineFlow(
  {
    name: 'generateWorkoutFlow',
    inputSchema: GenerateWorkoutInputSchema,
    outputSchema: GenerateWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
