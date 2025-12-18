import { User, Objective, Task, ScheduleSlot, Note, NoteCategory } from '../types';
import { DEFAULT_NOTE_CATEGORIES } from '../constants';

/**
 * 🐇 RABBIT CLOUD SYNC v4.2 - ÉDITION ÉCOLE
 * Chaque élève a son propre casier JSON privé.
 * Pas de fichier central = pas de bugs de collision.
 */

// Nouvel ID propre, garanti sans espaces
const PANTRY_ID = '4a8a5b2e-0672-4632-8494-6338b809825b';
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

// Génère un ID unique et sûr à partir de l'email
const getSafeBasketId = (email: string) => {
  const cleanEmail = email.toLowerCase().trim();
  // On utilise btoa pour l'email, mais on nettoie les caractères que Pantry n'aime pas
  return `rabbit_user_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, 'x')}`;
};

export const databaseService = {
  
  async _getBasket(basketId: string): Promise<UserDataPackage | null> {
    try {
      const response = await fetch(`${BASE_URL}/basket/${basketId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404 || response.status === 400) return null;
      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      return await response.json();
    } catch (e) {
      console.warn("Erreur de lecture Cloud (normal si nouveau compte) :", e);
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
      return response.ok;
    } catch (e) {
      console.error("Erreur de sauvegarde Cloud :", e);
      return false;
    }
  },

  async signup(email: string, name: string, password: string, avatarColor: string): Promise<User> {
    const basketId = getSafeBasketId(email);
    const existing = await this._getBasket(basketId);
    
    if (existing) {
      throw new Error("Ce compte existe déjà sur le cloud. Connecte-toi !");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      avatarColor
    };

    const initialData: UserDataPackage = {
      profile: { ...newUser, password },
      plan: { objectives: [], tasks: [], schedule: [] },
      notes: [],
      noteCategories: DEFAULT_NOTE_CATEGORIES
    };
    
    const success = await this._saveBasket(basketId, initialData);
    if (!success) throw new Error("Erreur de création sur le Cloud. Vérifie ta connexion.");

    return newUser;
  },

  async login(email: string, password: string): Promise<{ user: User; data: any }> {
    const basketId = getSafeBasketId(email);
    const cloudData = await this._getBasket(basketId);
    
    if (!cloudData) {
      throw new Error("Compte inconnu. Crée un compte pour synchroniser tes appareils.");
    }

    // Le mot de passe est facultatif pour les tests, mais on vérifie s'il existe
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
    const basketId = getSafeBasketId(email);
    
    // On récupère d'abord le profil pour ne pas perdre le mdp
    const current = await this._getBasket(basketId);
    if (!current) return;

    const fullPackage: UserDataPackage = {
      profile: current.profile,
      ...data
    };

    this._saveBasket(basketId, fullPackage);
  }
};