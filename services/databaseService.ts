import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD SYNC v4.1 - ÉDITION FIABLE
 * Système de stockage JSON ultra-simplifié pour les écoles.
 * Chaque utilisateur a son propre "panier" (basket) indépendant.
 */

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

// Utilitaire pour transformer un email en ID de fichier cloud 100% sûr
const getSafeBasketId = (email: string) => {
  const cleanEmail = email.toLowerCase().trim();
  // Encodage Base64 nettoyé des caractères problématiques pour les URLs
  return `rb_${btoa(cleanEmail).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`;
};

export const databaseService = {
  
  async _getBasket(basketId: string): Promise<UserDataPackage | null> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 404 || response.status === 400) return null;
      if (!response.ok) throw new Error(`Fetch Error: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Cloud Get Error:", e);
      return null;
    }
  },

  async _saveBasket(basketId: string, data: UserDataPackage): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'POST', // POST sur Pantry crée ou remplace complètement le contenu
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (e) {
      console.error("Cloud Save Error:", e);
      return false;
    }
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const basketId = getSafeBasketId(email);
    const existing = await this._getBasket(basketId);
    
    if (existing) {
      throw new Error("Ce compte existe déjà. Essaie de te connecter !");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      name,
      avatarColor
    };

    const initialData: UserDataPackage = {
      profile: { ...newUser, password },
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    const success = await this._saveBasket(basketId, initialData);
    if (!success) throw new Error("Impossible de créer le compte sur le Cloud. Vérifie ta connexion.");

    return newUser;
  },

  async login(email: string, password: string): Promise<{ user: User; data: any }> {
    const basketId = getSafeBasketId(email);
    const cloudData = await this._getBasket(basketId);
    
    if (!cloudData) {
      throw new Error("Compte non trouvé. Vérifie l'email ou crée un compte.");
    }

    // Si on demande un mot de passe (pas vide) et qu'il ne correspond pas
    if (password && cloudData.profile.password !== password) {
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
    const basketId = getSafeBasketId(email);
    // On récupère le profil actuel pour ne pas écraser le mot de passe
    const current = await this._getBasket(basketId);
    if (!current) return;

    const fullPackage: UserDataPackage = {
      profile: current.profile,
      ...data
    };

    // Sauvegarde asynchrone
    this._saveBasket(basketId, fullPackage);
  }
};