import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD SYNC v4.3 - ÉDITION FIABLE
 * Système de stockage décentralisé par élève.
 * Optimisé pour éviter les erreurs 400 (Bad Request).
 */

// Nouvel ID Pantry frais pour éviter tout conflit ou blocage
const PANTRY_ID = 'bb7e399a-05e1-4545-9279-f6236357d605';
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

// Nettoie l'email pour créer un identifiant de fichier 100% sûr pour l'API
const getSafeBasketId = (email: string) => {
  const clean = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  // On limite la longueur et on s'assure que c'est uniquement alphanumérique
  return `user${clean.substring(0, 50)}`;
};

export const databaseService = {
  
  async _getBasket(basketId: string): Promise<UserDataPackage | null> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404 || response.status === 400) return null;
      if (!response.ok) return null;
      
      const data = await response.json();
      return data;
    } catch (e) {
      return null;
    }
  },

  async _saveBasket(basketId: string, data: UserDataPackage): Promise<boolean> {
    try {
      // On nettoie les données pour éviter d'envoyer des "undefined" que l'API rejette parfois
      const cleanData = JSON.parse(JSON.stringify(data));
      
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });
      return response.ok;
    } catch (e) {
      console.error("Erreur de synchronisation Cloud :", e);
      return false;
    }
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const basketId = getSafeBasketId(email);
    
    // Vérification existence
    const existing = await this._getBasket(basketId);
    if (existing && existing.profile && existing.profile.email === email.toLowerCase().trim()) {
      throw new Error("Ce compte existe déjà. Connecte-toi !");
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
    if (!success) throw new Error("Le serveur de sauvegarde est temporairement indisponible. Réessaie dans quelques instants.");

    return newUser;
  },

  async login(email: string, password: string): Promise<{ user: User; data: any }> {
    const basketId = getSafeBasketId(email);
    const cloudData = await this._getBasket(basketId);
    
    if (!cloudData || !cloudData.profile) {
      throw new Error("Compte introuvable. Vérifie ton email ou crée un compte.");
    }

    // Vérification du mot de passe si présent
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
      // Échec silencieux pour ne pas bloquer l'utilisateur
    }
  }
};