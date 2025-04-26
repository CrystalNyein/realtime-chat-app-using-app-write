import { Account, Client, Databases } from 'appwrite';

export const DATABASE_ID = import.meta.env.VITE_API_DATABASE_ID;
export const COLLECTION_ID_MESSAGES = import.meta.env.VITE_API_COLLECTION_ID_MESSAGES;

const client = new Client();
client.setEndpoint(import.meta.env.VITE_API_URL).setProject(import.meta.env.VITE_API_PROJECT_ID);

export const account = new Account(client);

export const databases = new Databases(client);

export default client;
