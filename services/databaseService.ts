import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD DATABASE v2.1
 * Using KVDB.io with enhanced error handling for school environments.
 */

// A fresh, unique bucket ID for your project
const BUCKET_ID = 'rabbit_prod_v2_f29k3l'; 
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
  // Enhanced request helper with better error/404 handling
  async _request(key: string, method: 'GET' | 'PUT' = 'GET', body?: any) {
    const url = `${BASE_URL}/${key}`;
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(url, options);
      
      // Handle 404 as "Empty/Not Found" rather than an exception
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return method === 'GET' ? await response.json() : true;
    } catch (e) {
      // For background saves (PUT), we log but don't throw to avoid interrupting the user
      if (method === 'PUT') {
        console.warn(`Sync failed for ${key}:`, e);
        return false;
      }
      // For GET (critical loads), we log more details
      console.error(`Load failed for ${key}:`, e);
      throw e;
    }
  },

  async _getRegistry(): Promise<RegistrySchema> {
    try {
      const data = await this._request('registry');
      return data || { users: [] };
    } catch (e) {
      // If registry itself is unreachable, return empty instead of crashing
      return { users: [] };
    }
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

    // Initialize their data slot immediately
    const initialData: UserDataPackage = {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    await this._request(`data_${newUser.id}`, 'PUT', initialData);

    registry.users.push(newUser);
    await this._request('registry', 'PUT', registry);

    return { id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatarColor };
  },

  async login(email: string, password: string): Promise<{ user: User; data: UserDataPackage }> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    // Find user record. Note: during auto-login password might be empty.
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

    // Fetch the data. If 404 (null), use default state (Self-Healing)
    const remoteData = await this._request(`data_${user.id}`);
    const data: UserDataPackage = remoteData || { 
      plan: { objectives: [], tasks: [], schedule: [] }, 
      notes: [], 
      noteCategories: DEFAULT_NOTE_CATEGORIES 
    };

    return { user, data };
  },

  async saveUserData(userId: string, data: UserDataPackage) {
    // Background task: no 'await' in caller to keep UI snappy
    this._request(`data_${userId}`, 'PUT', data);
  }
};