'use server';

/**
 * @fileOverview Optimizes driver matching based on location, predicted travel time, driver availability, and user preferences.
 *
 * - optimizeDriverMatching - A function that handles the driver matching process.
 * - OptimizeDriverMatchingInput - The input type for the optimizeDriverMatching function.
 * - OptimizeDriverMatchingOutput - The return type for the optimizeDriverMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDriverMatchingInputSchema = z.object({
  userLocation: z
    .object({
      latitude: z.number().describe('The latitude of the user.'),
      longitude: z.number().describe('The longitude of the user.'),
    })
    .describe('The current location of the user.'),
  preferredVehicleType: z
    .string() 
    .optional()
    .describe('The user preferred vehicle type, if any.'),
  userRatingPreference: z
    .number()
    .optional()
    .describe('The minimum driver rating preferred by the user (1-5).'),
  availableDrivers: z.array(
    z.object({
      driverId: z.string().describe('The unique identifier of the driver.'),
      location: z.object({
        latitude: z.number().describe('The latitude of the driver.'),
        longitude: z.number().describe('The longitude of the driver.'),
      }),
      vehicleType: z.string().describe('The type of vehicle the driver has.'),
      rating: z.number().describe('The average rating of the driver (1-5).'),
      availability: z
        .boolean()
        .describe('Whether the driver is currently available.'),
    })
  ).describe('An array of available drivers with their details.'),
  maxTravelTime: z
    .number()
    .optional()
    .describe('The maximum acceptable travel time in minutes.'),
});

export type OptimizeDriverMatchingInput = z.infer<
  typeof OptimizeDriverMatchingInputSchema
>;

const OptimizeDriverMatchingOutputSchema = z.object({
  bestMatchDriverId: z
    .string()
    .nullable()
    .describe(
      'The driver ID of the best matched driver, or null if no suitable driver is found.'
    ),
  estimatedTravelTime: z
    .number()
    .nullable()
    .describe(
      'The estimated travel time in minutes for the best matched driver, or null if no suitable driver is found.'
    ),
  reason: z
    .string()
    .describe(
      'Reasoning behind the driver match or why no match was found.'
    )
});

export type OptimizeDriverMatchingOutput = z.infer<
  typeof OptimizeDriverMatchingOutputSchema
>;

export async function optimizeDriverMatching(
  input: OptimizeDriverMatchingInput
): Promise<OptimizeDriverMatchingOutput> {
  return optimizeDriverMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDriverMatchingPrompt',
  input: {schema: OptimizeDriverMatchingInputSchema},
  output: {schema: OptimizeDriverMatchingOutputSchema},
  prompt: `You are an AI assistant designed to optimize driver matching for a ride-hailing app.

Given the user's location, preferred vehicle type (if any), minimum driver rating preference (if any), a list of available drivers with their details (location, vehicle type, rating, availability), and maximum acceptable travel time, determine the best driver to match with the user.

Prioritize drivers who are closest to the user, have a vehicle type that matches the user's preference (if specified), and have a rating that meets or exceeds the user's preference (if specified). Also, ensure that the driver is currently available and the estimated travel time is within the acceptable limit.

If no suitable driver is found, return null for bestMatchDriverId and estimatedTravelTime and explain why no match was found.

User Location: Latitude: {{userLocation.latitude}}, Longitude: {{userLocation.longitude}}
Preferred Vehicle Type: {{preferredVehicleType}}
User Rating Preference: {{userRatingPreference}}
Maximum Travel Time: {{maxTravelTime}}

Available Drivers:
{{#each availableDrivers}}
- Driver ID: {{this.driverId}}, Location: Latitude: {{this.location.latitude}}, Longitude: {{this.location.longitude}}, Vehicle Type: {{this.vehicleType}}, Rating: {{this.rating}}, Availability: {{this.availability}}
{{/each}}

Output the bestMatchDriverId, estimatedTravelTime, and a brief reason for the match or lack thereof.

Ensure that the bestMatchDriverId is only populated if a driver meets the criteria defined in the prompt above, and the reason must give a detailed explanation as to how you arrived at the answer.`,
});

const optimizeDriverMatchingFlow = ai.defineFlow(
  {
    name: 'optimizeDriverMatchingFlow',
    inputSchema: OptimizeDriverMatchingInputSchema,
    outputSchema: OptimizeDriverMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
