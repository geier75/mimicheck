import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            language: 'de',
            setLanguage: () => {},
            t: (key) => key
        };
    }
    return context;
};

const translations = {
    de: {
        nav: {
            dashboard: 'Dashboard',
            life_situations: 'Profil',
            upload: 'Upload',
            reports: 'Abrechnungen',
            help: 'Hilfe'
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('de');

    const t = (key) => {
        const path = key.split('.');
        let translation = translations[language];
        
        for (let i = 0; i < path.length; i++) {
            if (translation && translation[path[i]]) {
                translation = translation[path[i]];
            } else {
                return key;
            }
        }
        
        return typeof translation === 'string' ? translation : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};