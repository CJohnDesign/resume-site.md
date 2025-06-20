import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'career_assistant_api_key';
const ENCRYPTION_KEY = 'career_assistant_secret_key_2024';

export function useApiKey() {
  const [hasValidKey, setHasValidKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredKey();
  }, []);

  // Listen for storage changes (including from clearApiKey)
  useEffect(() => {
    const handleStorageChange = () => {
      checkStoredKey();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events
    window.addEventListener('apiKeyCleared', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeyCleared', handleStorageChange);
    };
  }, []);

  const checkStoredKey = () => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        setHasValidKey(decrypted.startsWith('sk-'));
      } else {
        setHasValidKey(false);
      }
    } catch (error) {
      console.error('Error checking stored key:', error);
      setHasValidKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  const storeApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      // Validate API key format
      if (!apiKey.startsWith('sk-') || apiKey.length < 40) {
        throw new Error('Invalid API key format');
      }

      // Test the API key
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      // Encrypt and store
      const encrypted = CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
      localStorage.setItem(STORAGE_KEY, encrypted);
      setHasValidKey(true);
      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      return false;
    }
  };

  const getApiKey = (): string | null => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (encrypted) {
        return CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      }
    } catch (error) {
      console.error('Error retrieving API key:', error);
    }
    return null;
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasValidKey(false);
    // Dispatch custom event to trigger immediate re-check
    window.dispatchEvent(new Event('apiKeyCleared'));
  };

  return {
    hasValidKey,
    isLoading,
    storeApiKey,
    getApiKey,
    clearApiKey,
  };
}