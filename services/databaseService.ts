import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD SYNC v4.4 - ÉDITION DE SURVIE
 * Correction des erreurs 400 par simplification extrême des identifiants.
 */

// Nouvel ID Pantry fraîchement généré
const PANTRY_ID = '930eb82d-6931-47d4-8647-03e13ccc0bfe';
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}`;

interface UserDataPackage {
  profile: User & { password?: string };
  plan: {
    objectives: Objective[];
    tasks: Task[];
    schedule: ScheduleSlot[];
  };
  notes: Note[];
  noteCategories: NoteCategory[];
}

// Génère un ID court et sûr (uniquement lettres et chiffres)
const getSafeBasketId = (email: string) => {
  const clean = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  // On prend un préfixe et les 20 premiers caractères pour un ID compact
  return `rb${clean.substring(0, 20)}`;
};

export const databaseService = {
  
  async _getBasket(basketId: string): Promise<UserDataPackage | null> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404) return null;
      if (!response.ok) {
        console.error(`Pantry GET error: ${response.status}`);
        return null;
      }
      
      return await response.json();
    } catch (e) {
      return null;
    }
  },

  async _saveBasket(basketId: string, data: UserDataPackage): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Pantry POST error ${response.status}: ${errText}`);
      }
      
      return response.ok;
    } catch (e) {
      console.error("Erreur réseau Cloud :", e);
      return false;
    }
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const basketId = getSafeBasketId(email);
    
    // On tente de voir si le panier existe déjà
    const existing = await this._getBasket(basketId);
    if (existing && existing.profile && existing.profile.email === email.toLowerCase().trim()) {
      throw new Error("Ce compte semble déjà exister.");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      name: name.trim() || "Étudiant",
      avatarColor
    };

    const initialData: UserDataPackage = {
      profile: { ...newUser, password },
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    const success = await this._saveBasket(basketId, initialData);
    if (!success) {
      throw new Error("Échec de création du compte sur le Cloud (Erreur 400/500). Vérifie ta connexion.");
    }

    return newUser;
  },

  async login(email: string, password: string): Promise<{ user: User; data: any }> {
    const basketId = getSafeBasketId(email);
    const cloudData = await this._getBasket(basketId);
    
    if (!cloudData || !cloudData.profile) {
      throw new Error("Compte introuvable ou erreur de synchronisation.");
    }

    if (password && cloudData.profile.password && cloudData.profile.password !== password) {
      throw new Error("Mot de passe incorrect.");
    }

    const { profile, ...rest } = cloudData;
    const user: User = { 
      id: profile.id, 
      email: profile.email, 
      name: profile.name, 
      avatarColor: profile.avatarColor 
    };

    return { user, data: rest };
  },

  async saveUserData(email: string, data: any) {
    if (!email) return;
    const basketId = getSafeBasketId(email);
    
    try {
      const current = await this._getBasket(basketId);
      if (!current) return;

      const fullPackage: UserDataPackage = {
        profile: current.profile,
        plan: data.plan || { objectives: [], tasks: [], schedule: [] },
        notes: data.notes || [],
        noteCategories: data.noteCategories || DEFAULT_NOTE_CATEGORIES
      };

      await this._saveBasket(basketId, fullPackage);
    } catch (e) {
      // Échec silencieux
    }
  }
};