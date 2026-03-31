import supabaseEntities from './supabaseEntities';

// ✅ PRODUCTION MODE - Supabase Database
// Alle Daten werden in echter Supabase-Datenbank gespeichert
// KEINE LocalStorage, KEINE Mock-Daten
export const mimitech = {
    entities: {
        Abrechnung: supabaseEntities.Abrechnung,
        UserProfile: supabaseEntities.UserProfile,
        Foerderleistung: supabaseEntities.Foerderleistung,
        Antrag: supabaseEntities.Antrag,
        Anspruchspruefung: supabaseEntities.Antrag, // Alias
    },
    auth: supabaseEntities.Auth,
    functions: {
        invoke: async (functionName, options) => {
            // Supabase Edge Functions aufrufen
            const { supabase } = await import('./supabaseClient');
            const { data, error } = await supabase.functions.invoke(functionName, {
                body: options.body || options
            });

            if (error) throw error;
            return { data, status: 200 };
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                const { uploadFile } = await import('./integrations');
                return await uploadFile(file);
            },
            ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
                // Call Supabase Edge Function for document extraction
                const { supabase } = await import('./supabaseClient');
                
                const { data, error } = await supabase.functions.invoke('extract-document', {
                    body: { file_url, json_schema }
                });
                
                if (error) {
                    console.error('Extract document error:', error);
                    throw new Error(`Extraktion fehlgeschlagen: ${error.message}`);
                }
                
                return data;
            }
        }
    }
};

export default mimitech;
