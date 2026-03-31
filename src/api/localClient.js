// Komplett lokaler Client - kein Backend nötig
// Nutzt LocalStorage für Datenpersistenz

const STORAGE_KEYS = {
  USER: 'nebenkosten_user',
  ABRECHNUNGEN: 'nebenkosten_abrechnungen',
  ANSPRUCHSPRUEFUNGEN: 'nebenkosten_anspruchspruefungen',
  FOERDERLEISTUNGEN: 'nebenkosten_foerderleistungen'
};

// Helper Funktionen
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Fehler beim Lesen:', e);
    return null;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
  }
};

// Initialisiere Standardbenutzer
const initUser = () => {
  let user = getFromStorage(STORAGE_KEYS.USER);
  if (!user) {
    user = {
      id: '1',
      email: 'nutzer@lokal.de',
      full_name: 'Lokaler Nutzer',
      created_at: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.USER, user);
  }
  return user;
};

// Initialisiere Beispieldaten - DEAKTIVIERT FÜR PRODUCTION
// WICHTIG: Diese Funktion generiert Mock-Daten und wird NICHT mehr aufgerufen
// Kunden sollen nur ECHTE Daten sehen
const initSampleData = () => {
  // DEAKTIVIERT - Keine Mock-Daten mehr!
  /*
  let abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN);
  if (!abrechnungen || abrechnungen.length === 0) {
    abrechnungen = [
      {
        id: '1',
        titel: 'Nebenkostenabrechnung 2023',
        // ... (Mock-Daten entfernt)
      }
    ];
    saveToStorage(STORAGE_KEYS.ABRECHNUNGEN, abrechnungen);
  }
  */

  // Auch Förderleistungen NICHT mehr automatisch initialisieren
  /*
  let foerderleistungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN);
  if (!foerderleistungen || foerderleistungen.length === 0) {
    // ... (Mock-Daten entfernt)
  }
  */
};

// Lokaler Client
export const localClient = {
  auth: {
    me: async () => {
      return initUser();
    },

    logout: async (redirectUrl) => {
      // Optional: Daten löschen beim Logout
      // localStorage.clear();
      window.location.href = redirectUrl || '/';
    },

    updateProfile: async (data) => {
      const user = initUser();
      const updatedUser = { ...user, ...data };
      saveToStorage(STORAGE_KEYS.USER, updatedUser);
      return updatedUser;
    }
  },

  entities: {
    Abrechnung: {
      list: async (order = '-created_date', limit = 100) => {
        // PRODUCTION MODE: Keine Auto-Generierung von Mock-Daten
        // initSampleData(); // <-- ENTFERNT!

        let abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];

        // Sortierung
        if (order === '-created_date') {
          abrechnungen.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        } else if (order === 'created_date') {
          abrechnungen.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        }

        return abrechnungen.slice(0, limit);
      },

      get: async (id) => {
        const abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];
        return abrechnungen.find(a => a.id === id) || null;
      },

      create: async (data) => {
        const abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];
        const newAbrechnung = {
          id: Date.now().toString(),
          ...data,
          created_date: new Date().toISOString(),
          analyse_status: data.analyse_status || 'wartend',
          rueckforderung_potential: data.rueckforderung_potential || 0
        };
        abrechnungen.push(newAbrechnung);
        saveToStorage(STORAGE_KEYS.ABRECHNUNGEN, abrechnungen);
        return newAbrechnung;
      },

      update: async (id, data) => {
        const abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];
        const index = abrechnungen.findIndex(a => a.id === id);
        if (index !== -1) {
          abrechnungen[index] = { ...abrechnungen[index], ...data };
          saveToStorage(STORAGE_KEYS.ABRECHNUNGEN, abrechnungen);
          return abrechnungen[index];
        }
        return null;
      },

      delete: async (id) => {
        const abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];
        const filtered = abrechnungen.filter(a => a.id !== id);
        saveToStorage(STORAGE_KEYS.ABRECHNUNGEN, filtered);
        return { success: true };
      }
    },

    Anspruchspruefung: {
      list: async (order, limit = 100) => {
        const pruefungen = getFromStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN) || [];
        return pruefungen.slice(0, limit);
      },

      get: async (id) => {
        const pruefungen = getFromStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN) || [];
        return pruefungen.find(p => p.id === id) || null;
      },

      create: async (data) => {
        const pruefungen = getFromStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN) || [];
        const newPruefung = {
          id: Date.now().toString(),
          ...data,
          created_date: new Date().toISOString()
        };
        pruefungen.push(newPruefung);
        saveToStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN, pruefungen);
        return newPruefung;
      },

      update: async (id, data) => {
        const pruefungen = getFromStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN) || [];
        const index = pruefungen.findIndex(p => p.id === id);
        if (index !== -1) {
          pruefungen[index] = { ...pruefungen[index], ...data };
          saveToStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN, pruefungen);
          return pruefungen[index];
        }
        return null;
      },

      delete: async (id) => {
        const pruefungen = getFromStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN) || [];
        const filtered = pruefungen.filter(p => p.id !== id);
        saveToStorage(STORAGE_KEYS.ANSPRUCHSPRUEFUNGEN, filtered);
        return { success: true };
      }
    },

    Foerderleistung: {
      list: async (order, limit = 100) => {
        const foerderungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN) || [];
        return foerderungen.slice(0, limit);
      },

      get: async (id) => {
        const foerderungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN) || [];
        return foerderungen.find(f => f.id === id) || null;
      },

      create: async (data) => {
        const foerderungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN) || [];
        const newFoerderung = {
          id: Date.now().toString(),
          ...data,
          created_date: new Date().toISOString()
        };
        foerderungen.push(newFoerderung);
        saveToStorage(STORAGE_KEYS.FOERDERLEISTUNGEN, foerderungen);
        return newFoerderung;
      },

      update: async (id, data) => {
        const foerderungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN) || [];
        const index = foerderungen.findIndex(f => f.id === id);
        if (index !== -1) {
          foerderungen[index] = { ...foerderungen[index], ...data };
          saveToStorage(STORAGE_KEYS.FOERDERLEISTUNGEN, foerderungen);
          return foerderungen[index];
        }
        return null;
      },

      delete: async (id) => {
        const foerderungen = getFromStorage(STORAGE_KEYS.FOERDERLEISTUNGEN) || [];
        const filtered = foerderungen.filter(f => f.id !== id);
        saveToStorage(STORAGE_KEYS.FOERDERLEISTUNGEN, filtered);
        return { success: true };
      }
    }
  }
};

// Integrations - DEPRECATED: Nutze stattdessen src/api/integrations.js
// Diese Mock-Implementierungen werden nicht mehr verwendet
localClient.integrations = {
  Core: {
    InvokeLLM: async (params) => {
      console.warn('⚠️ DEPRECATED: Use integrations.js InvokeLLM instead');
      return { result: 'DEPRECATED', content: 'Nutze integrations.js' };
    },

    SendEmail: async (params) => {
      console.log('SendEmail Mock:', params);
      return { success: true, message: 'E-Mail wurde simuliert (nicht wirklich versendet)' };
    },

    UploadFile: async ({ file }) => {
      console.log('UploadFile Mock:', file?.name);
      if (!file) {
        throw new Error('No file provided to UploadFile');
      }
      return {
        file_url: URL.createObjectURL(file),
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file?.name,
        size: file?.size
      };
    },

    GenerateImage: async (params) => {
      console.log('GenerateImage Mock:', params);
      return {
        url: 'https://via.placeholder.com/400x300.png?text=Mock+Image',
        id: Date.now().toString()
      };
    },

    ExtractDataFromUploadedFile: async (fileId) => {
      console.log('ExtractDataFromUploadedFile Mock:', fileId);
      return {
        success: true,
        data: {
          text: 'Beispieltext aus simuliertem Dokument',
          abrechnungszeitraum: '2023',
          gesamtkosten: 2500.00
        }
      };
    },

    CreateFileSignedUrl: async (fileId) => {
      console.log('CreateFileSignedUrl Mock:', fileId);
      return { url: 'https://via.placeholder.com/400x300.png?text=Mock+File', expiresAt: Date.now() + 3600000 };
    },

    UploadPrivateFile: async (file) => {
      console.log('UploadPrivateFile Mock:', file?.name);
      return {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file?.name,
        size: file?.size,
        private: true
      };
    }
  }
};

// Functions API für Edge Functions (Mock)
localClient.functions = {
  invoke: async (functionName, params) => {
    console.log(`🔧 Mock Function Call: ${functionName}`, params);

    // Mock-Implementierungen für verschiedene Functions
    switch (functionName) {
      case 'analyzePdfFields':
        return {
          status: 200,
          data: {
            hasFormFields: false,
            fieldCount: 0,
            warning: 'Dieses PDF hat keine ausfüllbaren Formularfelder. Bitte laden Sie ein interaktives PDF-Formular hoch.',
            suggestions: []
          }
        };

      case 'fillPdfForm':
        // Simuliere PDF-Ausfüllung
        throw new Error('PDF-Ausfüllung erfordert Backend-Integration. Bitte Backend konfigurieren.');

      case 'exportUserData':
        // Simuliere Datenexport
        const user = getFromStorage(STORAGE_KEYS.USER);
        const abrechnungen = getFromStorage(STORAGE_KEYS.ABRECHNUNGEN) || [];
        const exportData = {
          user,
          abrechnungen,
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        return {
          status: 200,
          data: blob
        };

      case 'deleteUserAccount':
        // Simuliere Konto-Löschung
        if (params.confirmation === 'DELETE') {
          localStorage.clear();
          return {
            status: 200,
            data: { success: true, message: 'Konto wurde gelöscht' }
          };
        }
        throw new Error('Bestätigung fehlgeschlagen');

      default:
        console.warn(`⚠️ Unbekannte Function: ${functionName}`);
        return {
          status: 404,
          data: { error: `Function '${functionName}' nicht implementiert` }
        };
    }
  }
};

// PRODUCTION MODE: Keine automatische Initialisierung beim Import
// Kunden sollen nur ECHTE Daten sehen, keine Mock-Daten!
// 
// initUser();        // <-- ENTFERNT
// initSampleData();  // <-- ENTFERNT
