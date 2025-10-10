// Offline storage utilities for React Native using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineAction {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const STORAGE_KEYS = {
  INVENTORY: '@myglasscase:inventory',
  WISHLIST: '@myglasscase:wishlist',
  PENDING_ACTIONS: '@myglasscase:pending_actions',
};

class OfflineStorage {
  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  }

  private async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to storage:`, error);
      throw error;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  }

  async saveInventoryItem(item: any): Promise<void> {
    try {
      const items = await this.getInventoryItems(item.user_id);
      const existingIndex = items.findIndex(i => i.id === item.id);

      if (existingIndex >= 0) {
        items[existingIndex] = item;
      } else {
        items.push(item);
      }

      await this.setItem(`${STORAGE_KEYS.INVENTORY}:${item.user_id}`, items);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  }

  async getInventoryItems(userId: string): Promise<any[]> {
    try {
      const items = await this.getItem<any[]>(`${STORAGE_KEYS.INVENTORY}:${userId}`);
      return items || [];
    } catch (error) {
      console.error('Error getting inventory items:', error);
      return [];
    }
  }

  async deleteInventoryItem(userId: string, itemId: string): Promise<void> {
    try {
      const items = await this.getInventoryItems(userId);
      const filteredItems = items.filter(i => i.id !== itemId);
      await this.setItem(`${STORAGE_KEYS.INVENTORY}:${userId}`, filteredItems);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  async saveWishlistItem(item: any): Promise<void> {
    try {
      const items = await this.getWishlistItems(item.user_id);
      const existingIndex = items.findIndex(i => i.id === item.id);

      if (existingIndex >= 0) {
        items[existingIndex] = item;
      } else {
        items.push(item);
      }

      await this.setItem(`${STORAGE_KEYS.WISHLIST}:${item.user_id}`, items);
    } catch (error) {
      console.error('Error saving wishlist item:', error);
      throw error;
    }
  }

  async getWishlistItems(userId: string): Promise<any[]> {
    try {
      const items = await this.getItem<any[]>(`${STORAGE_KEYS.WISHLIST}:${userId}`);
      return items || [];
    } catch (error) {
      console.error('Error getting wishlist items:', error);
      return [];
    }
  }

  async deleteWishlistItem(userId: string, itemId: string): Promise<void> {
    try {
      const items = await this.getWishlistItems(userId);
      const filteredItems = items.filter(i => i.id !== itemId);
      await this.setItem(`${STORAGE_KEYS.WISHLIST}:${userId}`, filteredItems);
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      throw error;
    }
  }

  async savePendingAction(action: OfflineAction): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      actions.push(action);
      await this.setItem(STORAGE_KEYS.PENDING_ACTIONS, actions);
    } catch (error) {
      console.error('Error saving pending action:', error);
      throw error;
    }
  }

  async getPendingActions(): Promise<OfflineAction[]> {
    try {
      const actions = await this.getItem<OfflineAction[]>(STORAGE_KEYS.PENDING_ACTIONS);
      return actions || [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  async removePendingAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getPendingActions();
      const filteredActions = actions.filter(a => a.id !== actionId);
      await this.setItem(STORAGE_KEYS.PENDING_ACTIONS, filteredActions);
    } catch (error) {
      console.error('Error removing pending action:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();

      // Filter keys that belong to our app
      const appKeys = keys.filter(key =>
        key.startsWith('@myglasscase:')
      );

      // Remove all app keys
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async clearUserData(userId: string): Promise<void> {
    try {
      await this.removeItem(`${STORAGE_KEYS.INVENTORY}:${userId}`);
      await this.removeItem(`${STORAGE_KEYS.WISHLIST}:${userId}`);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }
}

export const offlineStorage = new OfflineStorage();
