import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * ⚠️ PROTOTYPE CLOUD CONFIGURATION
 * This uses a public JSON storage service to act as the "json file on a server".
 * In a production environment, this would be replaced with a secure Private API/Database.
 */

// This ID identifies the "Master Registry" for your specific students project.
// Anyone with this ID can technically see the registry, but for a prototype it works!
const REGISTRY_BLOB_ID = '1342512686823374848'; // Pre-generated ID for the Rabbit Registry
const API_BASE = 'https://jsonblob.com/api/jsonBlob';

interface UserRecord {
  id: string;
  email: string;
  password?: string;
  name: string;
  avatarColor: string;
  dataBlobId: string; // The specific cloud file for this user's data
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
  // 1. Fetch the master "users.json" from the cloud
  async _getRegistry(): Promise<RegistrySchema> {
    try {
      const response = await fetch(`${API_BASE}/${REGISTRY_BLOB_ID}`);
      if (!response.ok) return { users: [] };
      return await response.json();
    } catch (e) {
      console.error("Cloud Registry unreachable, using local mock.");
      return { users: [] };
    }
  },

  // 2. Save the master "users.json" back to the cloud
  async _saveRegistry(registry: RegistrySchema) {
    await fetch(`${API_BASE}/${REGISTRY_BLOB_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registry)
    });
  },

  // 3. Create a new "user_data.json" file in the cloud for a new student
  async _createUserDataBlob(data: UserDataPackage): Promise<string> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // The Location header contains the URL to the new blob
    const location = response.headers.get('Location');
    if (!location) throw new Error("Could not create remote data file.");
    return location.split('/').pop() || '';
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    
    if (registry.users.find(u => u.email === cleanEmail)) {
      throw new Error("Cet email est déjà utilisé dans la base cloud.");
    }

    // Initialize empty data file for this user in the cloud
    const initialData: UserDataPackage = {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    const dataBlobId = await this._createUserDataBlob(initialData);

    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      name,
      password,
      avatarColor,
      dataBlobId
    };

    registry.users.push(newUser);
    await this._saveRegistry(registry);

    return { id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatarColor };
  },

  async login(email: string, password: string): Promise<{ user: User; data: UserDataPackage }> {
    const registry = await this._getRegistry();
    const cleanEmail = email.toLowerCase().trim();
    const userRecord = registry.users.find(u => u.email === cleanEmail && u.password === password);
    
    if (!userRecord) throw new Error("Email ou mot de passe incorrect.");

    const user: User = { 
      id: userRecord.id, 
      email: userRecord.email, 
      name: userRecord.name, 
      avatarColor: userRecord.avatarColor 
    };

    // Fetch the specific user's data from their remote JSON file
    const dataResponse = await fetch(`${API_BASE}/${userRecord.dataBlobId}`);
    const data = await dataResponse.json();

    // Cache the dataBlobId in memory/session for saving updates
    (window as any)._currentDataBlobId = userRecord.dataBlobId;

    return { user, data };
  },

  async saveUserData(userId: string, data: UserDataPackage) {
    const blobId = (window as any)._currentDataBlobId;
    if (!blobId) return;

    // Async push to the remote cloud file
    fetch(`${API_BASE}/${blobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error("Cloud save failed", err));
  }
};