import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import * as admin from 'firebase-admin';

if (!admin.apps.length && process.env.GCLOUD_PROJECT && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.GCLOUD_PROJECT,
    });
}

export const auth = admin.apps.length ? admin.auth() : null;

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.5-flash',
});
