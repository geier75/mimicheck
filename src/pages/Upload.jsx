import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Abrechnung } from "@/api/entities";
import { mimitech } from "@/api/mimitechClient";
import { uploadFile } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload as UploadIcon, Sparkles, ShieldCheck, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track, trackError, AREA, SEVERITY } from '@/components/core/telemetry';
import { AppError } from '@/components/core/errors';
import UploadAnimation from "@/components/animations/UploadAnimation"; // NEW
import SpotlightCard from "@/components/ui/SpotlightCard"; // NEW

import FileUploadZone from "../components/upload/FileUploadZone";
import AnalysisProgress from "../components/upload/AnalysisProgress";
import UploadResults from "../components/upload/UploadResults";
import ErrorState from "@/components/ui/ErrorState";

import { useTranslation } from 'react-i18next';

export default function Upload() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);

    const MAX_RETRIES = 2;

    const analysisSteps = [
        { title: t('uploadPage.steps.upload.title', 'Dokument hochladen'), description: t('uploadPage.steps.upload.description', 'Sichere Übertragung...') },
        { title: t('uploadPage.steps.analysis.title', 'KI-Analyse'), description: t('uploadPage.steps.analysis.description', 'Prüfe Inhalt und Struktur...') },
        { title: t('uploadPage.steps.extraction.title', 'Datenextraktion'), description: t('uploadPage.steps.extraction.description', 'Identifiziere Kostenpunkte...') },
        { title: t('uploadPage.steps.legal.title', 'Rechtliche Prüfung'), description: t('uploadPage.steps.legal.description', 'Abgleich mit Mietrecht...') },
        { title: t('uploadPage.steps.report.title', 'Bericht erstellen'), description: t('uploadPage.steps.report.description', 'Finalisiere Ergebnisse...') }
    ];

    const extractDataWithFallback = async (file_url) => {
        const extractionStrategies = [
            {
                name: "Vollständige Extraktion",
                schema: {
                    type: "object",
                    properties: {
                        titel: { type: "string" },
                        abrechnungszeitraum: { type: "string" },
                        verwalter: { type: "string" },
                        objekt_adresse: { type: "string" },
                        gesamtkosten: { type: "number" },
                        kostenposten: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    position: { type: "string" },
                                    betrag: { type: "number" },
                                    beschreibung: { type: "string" }
                                }
                            }
                        }
                    }
                }
            },
            {
                name: "Vereinfachte Extraktion",
                schema: {
                    type: "object",
                    properties: {
                        titel: { type: "string" },
                        abrechnungszeitraum: { type: "string" },
                        verwalter: { type: "string" },
                        gesamtkosten: { type: "number" }
                    }
                }
            },
            {
                name: "Basis-Extraktion",
                schema: {
                    type: "object",
                    properties: {
                        titel: { type: "string" },
                        typ: { type: "string" }
                    }
                }
            }
        ];

        let lastError = null;

        for (const strategy of extractionStrategies) {
            try {
                const result = await mimitech.integrations.Core.ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: strategy.schema
                });

                if (result && result.status === "success" && result.output) {
                    track('upload.extraction.success', AREA.UPLOAD, { strategy: strategy.name });
                    return result.output;
                }
            } catch (err) {
                console.warn(`Strategie ${strategy.name} fehlgeschlagen:`, err);
                lastError = err;
            }
        }

        throw lastError || new Error("Alle Extraktionsstrategien fehlgeschlagen");
    };

    const handleFileSelect = async (file) => {
        console.log('🚀 handleFileSelect called with:', file?.name, file?.size);
        setSelectedFile(file);
        setError(null);
        setIsProcessing(true);
        setAnalysisStep(0);
        setUploadProgress(0);

        try {
            // Step 1: Upload to real backend
            console.log('📤 Starting upload...');
            setAnalysisStep(0);
            const uploadResult = await uploadFile(file, (progress) => {
                console.log(`📊 Upload progress: ${progress}%`);
                setUploadProgress(progress);
            });
            console.log('✅ Upload complete:', uploadResult);

            if (!uploadResult || (!uploadResult.url && !uploadResult.file_url)) {
                throw new AppError(
                    t('uploadPage.errors.uploadFailed', 'Upload fehlgeschlagen. Bitte stellen Sie sicher, dass das Backend läuft.'),
                    SEVERITY.HIGH,
                    { fileName: file.name }
                );
            }

            // Use file_url as fallback for url
            const fileUrl = uploadResult.url || uploadResult.file_url;

            // Step 2: OCR & Analysis
            setAnalysisStep(1);
            await new Promise(resolve => setTimeout(resolve, 1500)); // UX Delay

            // Step 3: Extraction - DIRECT EDGE FUNCTION CALL
            setAnalysisStep(2);
            console.log('🔥 Calling extract-document Edge Function with URL:', fileUrl);
            
            // DIREKT zur Edge Function!
            const { supabase } = await import('@/api/supabaseClient');
            const { data: extractResult, error: extractError } = await supabase.functions.invoke('extract-document', {
                body: { 
                    file_url: fileUrl,
                    json_schema: {
                        type: "object",
                        properties: {
                            titel: { type: "string" },
                            abrechnungszeitraum: { type: "string" },
                            verwalter: { type: "string" },
                            gesamtkosten: { type: "number" }
                        }
                    }
                }
            });
            
            if (extractError) {
                console.error('❌ Edge Function Error:', extractError);
                throw new Error(`Extraction failed: ${extractError.message}`);
            }
            
            console.log('✅ Extraction result:', extractResult);
            const extractedData = extractResult?.output || {};

            // Step 4: Legal Check
            setAnalysisStep(3);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 5: Report
            setAnalysisStep(4);

            // Create Record in real database
            const abrechnung = await Abrechnung.create({
                filename: file.name,
                file_url: fileUrl,
                status: 'in_bearbeitung',
                extracted_data: extractedData,
                analysis_results: {
                    issues_found: [],
                    savings_potential: 0,
                    legal_compliance_score: 0
                }
            });

            setResults({
                abrechnung,
                analysis: {
                    fehler: [],
                    hinweise: [],
                    rechtliche_bedenken: []
                }
            });
            track('upload.complete', AREA.UPLOAD, { id: abrechnung.id });

        } catch (err) {
            console.error("Upload Process Error:", err);
            trackError(err, AREA.UPLOAD);
            setError(err.message || t('uploadPage.errors.unexpected', "Ein unerwarteter Fehler ist aufgetreten."));

            if (retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetry = () => {
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    if (results) {
        return <UploadResults results={results} onReset={() => {
            setResults(null);
            setSelectedFile(null);
            setAnalysisStep(0);
        }} />;
    }

    return (
        <div className="h-full w-full bg-transparent text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <UploadAnimation />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('uploadPage.back', 'Zurück')}
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        {t('uploadPage.secureTransfer', 'Sichere Übertragung')}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-heading">
                                {t('uploadPage.title', 'Dokument')} <span className="text-violet-400">{t('uploadPage.titleHighlight', 'hochladen')}</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-lg mx-auto">
                                {t('uploadPage.subtitle', 'Wir analysieren deine Nebenkostenabrechnung oder deinen Mietvertrag auf Fehler und Sparpotenzial.')}
                            </p>
                        </div>

                        {error ? (
                            <ErrorState
                                message={error}
                                onRetry={handleRetry}
                                onCancel={() => {
                                    setError(null);
                                    setSelectedFile(null);
                                }}
                            />
                        ) : isProcessing ? (
                            <SpotlightCard className="p-8 border-violet-500/30" spotlightColor="rgba(139, 92, 246, 0.15)">
                                <AnalysisProgress
                                    currentStep={analysisStep}
                                    steps={analysisSteps}
                                    progress={uploadProgress}
                                />
                            </SpotlightCard>
                        ) : (
                            <SpotlightCard className="p-1 border-white/10 overflow-hidden" spotlightColor="rgba(139, 92, 246, 0.15)">
                                <div className="bg-slate-900/50 rounded-xl p-8 backdrop-blur-sm">
                                    <FileUploadZone
                                        onFileSelected={handleFileSelect}
                                        acceptedFileTypes={{
                                            'application/pdf': ['.pdf'],
                                            'image/jpeg': ['.jpg', '.jpeg'],
                                            'image/png': ['.png']
                                        }}
                                        maxSize={10 * 1024 * 1024} // 10MB
                                    />

                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-medium text-white">{t('uploadPage.features.formats.title', 'Alle Formate')}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{t('uploadPage.features.formats.desc', 'PDF, JPG, PNG')}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-medium text-white">{t('uploadPage.features.gdpr.title', 'DSGVO Konform')}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{t('uploadPage.features.gdpr.desc', 'Verschlüsselt')}</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                            <h3 className="text-sm font-medium text-white">{t('uploadPage.features.ai.title', 'KI Analyse')}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{t('uploadPage.features.ai.desc', 'Sofort-Ergebnis')}</p>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}