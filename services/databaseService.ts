import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD DATABASE CONFIGURATION
 * Using KVDB.io (Public Bucket) as a high-performance JSON storage.
 * This allows true cross-device synchronization without a complex backend.
 */

// A unique bucket ID for your students project
const BUCKET_ID = 'Kq7u7C4mN5vXy7vA5pE8z2'; 
const BASE_URL = `https://kvdb.io/${BUCKET_ID}`;

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

export const databaseService = {
  // Helper to handle fetch with better error reporting
  async _request(key: string, method: 'GET' | 'PUT' = 'GET', body?: any) {
    const url = `${BASE_URL}/${key}`;
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (method === 'GET' && response.status === 404) return null;
        throw new Error(`Erreur Serveur: ${response.status}`);
      }
      
      return method === 'GET' ? await response.json() : true;
    } catch (e) {
      console.error(`Database request failed for ${key}:`, e);
      throw new Error("Impossible de contacter la base de données. Vérifiez votre connexion.");
    }
  },

  // 1. Get/Create the student registry
  async _getRegistry(): Promise<RegistrySchema> {
    const data = await this._request('registry');
    return data || { users: [] };
  },

  // 2. Save the registry
  async _saveRegistry(registry: RegistrySchema) {
    await this._request('registry', 'PUT', registry);
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    if (registry.users.find(u => u.email === cleanEmail)) {
      throw new Error("Cet email est déjà utilisé dans la base cloud.");
    }

    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      name,
      password,
      avatarColor
    };

    // Initialize their data slot immediately
    const initialData: UserDataPackage = {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    await this._request(`data_${newUser.id}`, 'PUT', initialData);

    registry.users.push(newUser);
    await this._saveRegistry(registry);

    return { id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatarColor };
  },

  async login(email: string, password: string): Promise<{ user: User; data: UserDataPackage }> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    // For auto-login from session, we might not have a password
    const userRecord = registry.users.find(u => 
        u.email === cleanEmail && (password === '' || u.password === password)
    );
    
    if (!userRecord) throw new Error("Email ou mot de passe incorrect.");

    const user: User = { 
      id: userRecord.id, 
      email: userRecord.email, 
      name: userRecord.name, 
      avatarColor: userRecord.avatarColor 
    };

    // Fetch the specific user's partition
    const data = await this._request(`data_${user.id}`);
    
    if (!data) {
        // Fallback for edge cases
        return { user, data: { plan: { objectives: [], tasks: [], schedule: [] }, notes: [], noteCategories: DEFAULT_NOTE_CATEGORIES } };
    }

    return { user, data };
  },

  async saveUserData(userId: string, data: UserDataPackage) {
    // Fire and forget PUT to save progress in background
    this._request(`data_${userId}`, 'PUT', data).catch(e => console.warn("Background save failed", e));
  }
};