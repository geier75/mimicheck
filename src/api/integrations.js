// src/api/integrations.js - MIMITECH Backend Integration
import { supabase } from './supabaseClient';

/**
 * Upload File to Supabase Storage
 */
export async function uploadFile(file, options = {}) {
  const onProgress = typeof options === 'function' ? options : options?.onProgress;
  
  try {
    // Simulate progress for UX
    if (onProgress) {
      onProgress(10);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `uploads/${timestamp}_${safeFileName}`;

    if (onProgress) {
      onProgress(30);
    }

    // Upload to Supabase Storage
    console.log('🔄 Uploading to Supabase Storage...', filePath);
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    console.log('📦 Storage response:', { data, error });

    if (onProgress) {
      onProgress(70);
    }

    if (error) {
      console.error('❌ Supabase Storage upload error:', error);
      // Fallback: Return local blob URL for development
      if (import.meta.env.DEV) {
        console.warn('Using local fallback for file upload');
        if (onProgress) onProgress(100);
        return { 
          file_url: URL.createObjectURL(file), 
          id: timestamp.toString(),
          local: true 
        };
      }
      throw new Error(`Upload fehlgeschlagen: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    if (onProgress) {
      onProgress(100);
    }

    return {
      file_url: urlData.publicUrl,
      url: urlData.publicUrl,
      id: timestamp.toString(),
      path: data.path
    };

  } catch (err) {
    console.error('Upload error:', err);
    // Fallback for development
    if (import.meta.env.DEV) {
      console.warn('Using local fallback for file upload');
      if (onProgress) onProgress(100);
      return { 
        file_url: URL.createObjectURL(file), 
        id: Date.now().toString(),
        local: true 
      };
    }
    throw err;
  }
}

/**
 * Analyze Abrechnung - Uses Supabase Edge Function
 */
export async function analyzeAbrechnung(abrechnungId) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-eligibility', {
      body: { abrechnung_id: abrechnungId }
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Analysis error:', err);
    // Return mock analysis for development
    if (import.meta.env.DEV) {
      return {
        issues_found: [],
        savings_potential: Math.floor(Math.random() * 500),
        legal_compliance_score: 85 + Math.floor(Math.random() * 15)
      };
    }
    throw err;
  }
}

/**
 * Get Report
 */
export async function getReport(abrechnungId) {
  // Report is stored in Supabase - fetch from database
  const { data, error } = await supabase
    .from('abrechnungen')
    .select('*')
    .eq('id', abrechnungId)
    .single();
    
  if (error) throw new Error("Report nicht gefunden");
  return data;
}

// Legacy-Exports für Kompatibilität
export const Core = {};

/**
 * InvokeLLM - OpenAI Integration über Backend
 * 2025 Best Practice: Returns structured response with content string
 */
export const InvokeLLM = async ({ prompt, system_prompt, temperature, max_tokens, response_json_schema }) => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  
  try {
    const res = await fetch(`${apiBase}/api/llm/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        system_prompt,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 4096,
        json_mode: !!response_json_schema
      }),
      credentials: "include"
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "LLM-Anfrage fehlgeschlagen" }));
      throw new Error(error.detail || "LLM service unavailable");
    }
    
    const result = await res.json();
    
    // If JSON mode and schema provided, parse and validate
    if (response_json_schema && result.content) {
      try {
        const parsed = JSON.parse(result.content);
        return parsed; // Return parsed JSON directly for convenience
      } catch (e) {
        console.warn('[LLM] Failed to parse JSON response:', e);
        return result.content; // Fallback to raw content
      }
    }
    
    // Return content string for text responses
    return result.content || result;
  } catch (error) {
    console.error('[LLM Error]', error);
    
    // For JSON mode, return empty object
    if (response_json_schema) {
      return {};
    }
    
    // For text mode, return error message
    return `⚠️ **Backend nicht erreichbar**

Die KI-Funktion ist derzeit nicht verfügbar.

**Error:** ${error.message}`;
  }
};

/**
 * ExtractDataFromUploadedFile - PDF-Extraktion
 * Uses /api/forms/extract for universal PDF form extraction
 */
export const ExtractDataFromUploadedFile = async (fileOrId) => {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";
  
  try {
    // If it's a file object, upload it first
    if (fileOrId instanceof File || (fileOrId && fileOrId.name)) {
      const formData = new FormData();
      formData.append('file', fileOrId);
      formData.append('ocr_enabled', 'true');
      
      const res = await fetch(`${apiBase}/api/forms/extract`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("PDF extraction failed");
      
      const result = await res.json();
      return {
        success: true,
        form_schema: result.form_schema,
        upload_id: result.upload_id
      };
    }
    
    // Otherwise, treat as upload_id and fetch schema
    const res = await fetch(`${apiBase}/api/forms/schema/${fileOrId}`, {
      credentials: "include"
    });
    
    if (!res.ok) throw new Error("Schema retrieval failed");
    
    const schema = await res.json();
    return {
      success: true,
      form_schema: schema,
      upload_id: fileOrId
    };
  } catch (error) {
    console.error('[PDF Extraction Error]', error);
    return {
      success: false,
      error: error.message,
      form_schema: {
        form_id: 'error',
        title: 'Extraction Failed',
        fields: [],
        source: {}
      }
    };
  }
};

export const SendEmail = async () => ({ success: true });
export const UploadFile = uploadFile;
export const GenerateImage = async () => ({ url: "https://via.placeholder.com/400" });
export const CreateFileSignedUrl = async () => ({ url: "#" });
export const UploadPrivateFile = uploadFile;
