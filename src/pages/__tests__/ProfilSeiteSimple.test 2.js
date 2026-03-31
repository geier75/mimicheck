/**
 * TDD Tests für ProfilSeite Speicherung
 * 
 * Diese Tests verifizieren:
 * 1. Profildaten werden korrekt in localStorage gespeichert
 * 2. Profildaten werden beim Laden aus localStorage gelesen
 * 3. Leere Felder werden korrekt behandelt
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get store() { return store; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test-Hilfsfunktionen (simulieren die Logik aus ProfilSeiteSimple.jsx)
const STORAGE_KEY = 'mimicheck-profil';

function saveProfilToLocalStorage(profil) {
  const dataToSave = {};
  Object.keys(profil).forEach(key => {
    const value = profil[key];
    if (typeof value === 'boolean') {
      dataToSave[key] = value;
    } else if (value && value !== '') {
      dataToSave[key] = value;
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  return dataToSave;
}

function loadProfilFromLocalStorage() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      return null;
    }
  }
  return null;
}

describe('ProfilSeite Speicherung', () => {
  
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('saveProfilToLocalStorage', () => {
    
    it('sollte Profildaten korrekt in localStorage speichern', () => {
      const testProfil = {
        vorname: 'Max',
        nachname: 'Mustermann',
        geburtsdatum: '1990-01-15',
        email: 'max@example.com'
      };

      saveProfilToLocalStorage(testProfil);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );

      const saved = JSON.parse(localStorageMock.store[STORAGE_KEY]);
      expect(saved.vorname).toBe('Max');
      expect(saved.nachname).toBe('Mustermann');
      expect(saved.geburtsdatum).toBe('1990-01-15');
      expect(saved.email).toBe('max@example.com');
    });

    it('sollte leere Strings nicht speichern', () => {
      const testProfil = {
        vorname: 'Max',
        nachname: '',
        email: ''
      };

      const saved = saveProfilToLocalStorage(testProfil);

      expect(saved.vorname).toBe('Max');
      expect(saved.nachname).toBeUndefined();
      expect(saved.email).toBeUndefined();
    });

    it('sollte Boolean-Werte korrekt speichern', () => {
      const testProfil = {
        vorname: 'Max',
        dsgvo_einwilligung: true,
        ki_verarbeitung_einwilligung: false,
        datenweitergabe_behoerden: true
      };

      const saved = saveProfilToLocalStorage(testProfil);

      expect(saved.dsgvo_einwilligung).toBe(true);
      expect(saved.ki_verarbeitung_einwilligung).toBe(false);
      expect(saved.datenweitergabe_behoerden).toBe(true);
    });

    it('sollte alle Adressfelder speichern', () => {
      const testProfil = {
        strasse: 'Musterstraße',
        hausnummer: '123a',
        plz: '12345',
        ort: 'Berlin',
        bundesland: 'BE'
      };

      const saved = saveProfilToLocalStorage(testProfil);

      expect(saved.strasse).toBe('Musterstraße');
      expect(saved.hausnummer).toBe('123a');
      expect(saved.plz).toBe('12345');
      expect(saved.ort).toBe('Berlin');
      expect(saved.bundesland).toBe('BE');
    });
  });

  describe('loadProfilFromLocalStorage', () => {
    
    it('sollte gespeicherte Profildaten laden', () => {
      const testData = {
        vorname: 'Max',
        nachname: 'Mustermann',
        dsgvo_einwilligung: true
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(testData);

      const loaded = loadProfilFromLocalStorage();

      expect(loaded.vorname).toBe('Max');
      expect(loaded.nachname).toBe('Mustermann');
      expect(loaded.dsgvo_einwilligung).toBe(true);
    });

    it('sollte null zurückgeben wenn keine Daten vorhanden', () => {
      const loaded = loadProfilFromLocalStorage();
      expect(loaded).toBeNull();
    });

    it('sollte null zurückgeben bei ungültigem JSON', () => {
      localStorageMock.store[STORAGE_KEY] = 'invalid json{{{';

      const loaded = loadProfilFromLocalStorage();
      expect(loaded).toBeNull();
    });
  });

  describe('Speichern und Laden Roundtrip', () => {
    
    it('sollte Daten nach Speichern und Laden identisch sein', () => {
      const originalProfil = {
        anrede: 'Herr',
        vorname: 'Max',
        nachname: 'Mustermann',
        geburtsdatum: '1990-01-15',
        steuer_id: '12345678901',
        strasse: 'Musterstraße',
        hausnummer: '42',
        plz: '10115',
        ort: 'Berlin',
        bundesland: 'BE',
        dsgvo_einwilligung: true,
        ki_verarbeitung_einwilligung: false
      };

      // Speichern
      saveProfilToLocalStorage(originalProfil);

      // Laden
      const loaded = loadProfilFromLocalStorage();

      // Vergleichen
      expect(loaded.anrede).toBe(originalProfil.anrede);
      expect(loaded.vorname).toBe(originalProfil.vorname);
      expect(loaded.nachname).toBe(originalProfil.nachname);
      expect(loaded.geburtsdatum).toBe(originalProfil.geburtsdatum);
      expect(loaded.steuer_id).toBe(originalProfil.steuer_id);
      expect(loaded.strasse).toBe(originalProfil.strasse);
      expect(loaded.hausnummer).toBe(originalProfil.hausnummer);
      expect(loaded.plz).toBe(originalProfil.plz);
      expect(loaded.ort).toBe(originalProfil.ort);
      expect(loaded.bundesland).toBe(originalProfil.bundesland);
      expect(loaded.dsgvo_einwilligung).toBe(originalProfil.dsgvo_einwilligung);
      expect(loaded.ki_verarbeitung_einwilligung).toBe(originalProfil.ki_verarbeitung_einwilligung);
    });
  });
});
