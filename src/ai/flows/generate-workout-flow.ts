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
  name: z.string().describe('O nome do exercício.'),
  sets: z.number().describe('O número de séries para o exercício.'),
  reps: z.string().describe('A faixa de repetições para o exercício (ex: "8-12").'),
  weight: z.string().describe('O peso sugerido para o exercício (ex: "40kg" ou "Peso Corporal").'),
  notes: z.string().describe('Uma breve explicação do exercício, para que serve e como executá-lo.'),
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
  prompt: `Você é um personal trainer de classe mundial. Um usuário fornecerá seu objetivo de treino. Crie um plano de treino conciso e eficaz com 4 a 6 exercícios que visem diretamente o seu objetivo.

Responda em português do Brasil (pt-BR).

Para cada exercício, forneça uma breve explicação no campo 'notes', detalhando para que serve o exercício e como realizá-lo.

Retorne o plano como um array JSON de exercícios. Não inclua exercícios que não estejam diretamente relacionados ao objetivo do usuário. Para o peso, você pode sugerir um peso específico, se apropriado, ou usar termos como "Peso Corporal", "Médio" ou "Leve".

Objetivo do usuário: {{{prompt}}}`
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
