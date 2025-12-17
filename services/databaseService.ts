import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * DATABASE SCHEMA (JSON structure)
 * {
 *   "users": [ { "id": "...", "email": "...", "password": "...", "profile": { ... } } ],
 *   "userData": {
 *      "user_id_1": { "plan": { ... }, "notes": [ ... ], "categories": [ ... ] },
 *      "user_id_2": { ... }
 *   }
 * }
 */

const DB_KEY = 'rabbit_central_db_json';

interface UserRecord {
  id: string;
  email: string;
  password?: string; // In a real app, this is hashed
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

interface DatabaseSchema {
  users: UserRecord[];
  userData: Record<string, UserDataPackage>;
}

const getEmptyDB = (): DatabaseSchema => ({
  users: [],
  userData: {}
});

export const databaseService = {
  // Load the entire "json file"
  _getDB(): DatabaseSchema {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : getEmptyDB();
  },

  // Save the entire "json file"
  _saveDB(db: DatabaseSchema) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  // Auth: Create account in the JSON
  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const db = this._getDB();
    if (db.users.find(u => u.email === email)) throw new Error("Cet email est déjà utilisé.");

    const newUser: UserRecord = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password,
      avatarColor
    };

    db.users.push(newUser);
    
    // Initialize empty data for this user in the JSON
    db.userData[newUser.id] = {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };

    this._saveDB(db);
    return { id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatarColor };
  },

  // Auth: Find user in the JSON
  async login(email: string, password: string): Promise<{ user: User; data: UserDataPackage }> {
    const db = this._getDB();
    const userRecord = db.users.find(u => u.email === email && u.password === password);
    
    if (!userRecord) throw new Error("Email ou mot de passe incorrect.");

    const user: User = { 
      id: userRecord.id, 
      email: userRecord.email, 
      name: userRecord.name, 
      avatarColor: userRecord.avatarColor 
    };

    const data = db.userData[user.id] || {
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };

    return { user, data };
  },

  // Data: Save a user's specific state into the central JSON
  async saveUserData(userId: string, data: UserDataPackage) {
    const db = this._getDB();
    db.userData[userId] = data;
    this._saveDB(db);
  },

  // For developer debugging: get the raw JSON
  getRawJson(): string {
    return JSON.stringify(this._getDB(), null, 2);
  }
};