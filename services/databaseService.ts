import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD SYNC v4.0
 * Utilise Pantry Cloud pour une synchronisation JSON transparente.
 * Pas de gestion de fichiers pour les élèves : ça "juste marche".
 */

// ID de projet unique pour le projet "French Learners"
const PANTRY_ID = '70265293-707b-402b-a010-488665057022';
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}`;

interface UserRecord {
  id: string;
  email: string;
  password?: string;
  name: string;
  avatarColor: string;
}

interface UserDataPackage {
  plan: {
    objectives: Objective[];
    tasks: Task[];
    schedule: ScheduleSlot[];
  };
  notes: Note[];
  noteCategories: NoteCategory[];
}

interface RegistrySchema {
  users: UserRecord[];
}

// Utilitaire pour transformer un email en ID de basket valide (Pantry n'aime pas les @)
const getBasketId = (email: string) => `rabbit_user_${btoa(email.toLowerCase()).replace(/=/g, '')}`;

export const databaseService = {
  
  async _request(basketName: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
    const url = basketName === 'registry' 
      ? `${BASE_URL}/basket/user_registry` 
      : `${BASE_URL}/basket/${basketName}`;
    
    try {
      const options: RequestInit = {
        method: method === 'PUT' ? 'POST' : method, // Pantry utilise POST pour l'update
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(url, options);
      
      if (response.status === 404 && method === 'GET') return null;
      if (!response.ok) throw new Error(`Pantry Error: ${response.status}`);
      
      return method === 'DELETE' ? true : await response.json();
    } catch (e) {
      console.error("Database error:", e);
      throw e;
    }
  },

  async _getRegistry(): Promise<RegistrySchema> {
    const data = await this._request('registry');
    return data || { users: [] };
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    if (registry.users.find(u => u.email === cleanEmail)) {
      throw new Error("Cet email est déjà utilisé.");
    }

    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      name,
      password,
      avatarColor
    };

    const initialData: UserDataPackage = {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    // 1. Créer le panier de l'utilisateur
    await this._request(getBasketId(cleanEmail), 'POST', initialData);
    
    // 2. Mettre à jour le registre
    await this._request('registry', 'POST', { users: [...registry.users, newUser] });

    return { id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatarColor };
  },

  async login(email: string, password: string): Promise<{ user: User; data: UserDataPackage }> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    const userRecord = registry.users.find(u => u.email === cleanEmail);
    
    if (!userRecord || (password !== '' && userRecord.password !== password)) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const user: User = { 
      id: userRecord.id, 
      email: userRecord.email, 
      name: userRecord.name, 
      avatarColor: userRecord.avatarColor 
    };

    // Charger les données depuis son panier Pantry
    const remoteData = await this._request(getBasketId(cleanEmail));
    const data: UserDataPackage = remoteData || { 
      plan: { objectives: [], tasks: [], schedule: [] }, 
      notes: [], 
      noteCategories: DEFAULT_NOTE_CATEGORIES 
    };

    return { user, data };
  },

  async saveUserData(email: string, data: UserDataPackage) {
    // Sauvegarde silencieuse en arrière-plan
    try {
        await this._request(getBasketId(email), 'POST', data);
    } catch (e) {
        console.warn("Échec de synchronisation temporaire...");
    }
  }
};