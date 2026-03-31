import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { mimitech } from '@/api/mimitechClient';
import { supabase } from '@/api/supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    Download,
    FileText,
    User as UserIcon,
    AlertTriangle,
    CheckCircle,
    ArrowLeft,
    Loader2,
    Sparkles,
    Eye,
    Info,
    XCircle,
    Brain,
    Zap
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import SuccessToast from '@/components/ui/SuccessToast';

export default function PdfAutofill() {
    const [searchParams] = useSearchParams();
    const formType = searchParams.get('type');
    const applicationId = searchParams.get('application');

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [filledPdfUrl, setFilledPdfUrl] = useState(null);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [stats, setStats] = useState(null);
    const [pdfAnalysis, setPdfAnalysis] = useState(null);
    const [processingStage, setProcessingStage] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Fehler beim Laden des Nutzers:', error);
                setError('Bitte melden Sie sich an, um diese Funktion zu nutzen.');
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const calculateCompleteness = () => {
        if (!user) return 0;

        const requiredData = {
            vorname: user.vorname,
            nachname: user.nachname,
            geburtsdatum: user.geburtsdatum,
            plz: user.lebenssituation?.wohnadresse?.plz,
            ort: user.lebenssituation?.wohnadresse?.ort,
            strasse: user.lebenssituation?.wohnadresse?.strasse,
            monatliches_nettoeinkommen: user.lebenssituation?.monatliches_nettoeinkommen,
        };

        const totalFields = Object.keys(requiredData).length;
        const filledFields = Object.values(requiredData).filter(v => v !== null && v !== undefined && v !== '').length;

        return Math.round((filledFields / totalFields) * 100);
    };

    const completeness = calculateCompleteness();

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Bitte laden Sie eine PDF-Datei hoch.');
            return;
        }

        setError(null);
        setUploadedFile(file);
        setPdfAnalysis(null);

        // PDF hochladen und analysieren
        try {
            setIsAnalyzing(true);
            setProcessingStage('Datei wird hochgeladen...');

            const { file_url } = await mimitech.integrations.Core.UploadFile({ file });
            setUploadedFileUrl(file_url);

            setProcessingStage('KI analysiert das Formular...');

            // **UNIVERSELLE PDF-Analyse** - funktioniert für ALLE Anträge
            const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-pdf-universal', {
                body: {
                    pdfUrl: file_url,
                    userProfile: {
                        vorname: user.vorname,
                        nachname: user.nachname,
                        full_name: user.full_name,
                        geburtsdatum: user.geburtsdatum,
                        email: user.email,
                        lebenssituation: user.lebenssituation
                    }
                }
            });

            if (analysisError) throw analysisError;

            if (analysisData) {
                setPdfAnalysis(analysisData);

                if (!analysisData.hasFormFields) {
                    setError('⚠️ Dieses PDF hat keine ausfüllbaren Formularfelder und kann nicht automatisch ausgefüllt werden. Bitte laden Sie ein Formular mit ausfüllbaren Feldern hoch.');
                }
            }
        } catch (error) {
            console.error('Fehler beim Analysieren:', error);
            setError('PDF konnte nicht analysiert werden. Bitte versuchen Sie es erneut.');
        } finally {
            setIsAnalyzing(false);
            setProcessingStage('');
        }
    };

    const handleFillPdf = async () => {
        if (!uploadedFileUrl) {
            setError('Bitte laden Sie zuerst eine PDF-Datei hoch.');
            return;
        }

        if (pdfAnalysis && !pdfAnalysis.hasFormFields) {
            setError('Dieses PDF kann nicht automatisch ausgefüllt werden, da es keine Formularfelder hat.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            setProcessingStage('🤖 KI bereitet die Daten vor...');

            // **UNIVERSELLE KI-AUSFÜLLUNG** - funktioniert für ALLE Anträge
            const { data: fillData, error: fillError } = await supabase.functions.invoke('fill-pdf-universal', {
                body: {
                    pdfUrl: uploadedFileUrl,
                    userProfile: {
                        vorname: user.vorname,
                        nachname: user.nachname,
                        full_name: user.full_name,
                        geburtsdatum: user.geburtsdatum,
                        email: user.email,
                        lebenssituation: user.lebenssituation
                    },
                    pdfAnalysis: pdfAnalysis // Übergebe die Analyse für intelligenteres Mapping
                }
            });

            if (fillError) throw fillError;

            setProcessingStage('📝 Felder werden ausgefüllt...');

            // Zeige KI's Mapping-Vorschläge
            if (fillData?.pdfBlob) {
                // Direktes PDF bekommen
                const blob = new Blob([Uint8Array.from(atob(fillData.pdfBlob), c => c.charCodeAt(0))], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                setFilledPdfUrl(url);
            } else if (fillData?.mapping) {
                console.log('KI Mapping:', fillData.mapping);

                // Erstelle Preview mit Vorschlägen
                const previewHtml = `
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Inter', Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                            .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                            h1 { color: #667eea; margin-bottom: 10px; }
                            .subtitle { color: #666; margin-bottom: 30px; }
                            .field { margin: 15px 0; padding: 20px; border: 2px solid #e0e0e0; border-radius: 12px; background: #fafafa; transition: all 0.3s; }
                            .field:hover { border-color: #667eea; box-shadow: 0 4px 12px rgba(102,126,234,0.2); }
                            .field-name { font-weight: 600; color: #333; font-size: 16px; margin-bottom: 8px; }
                            .field-value { color: #059669; font-weight: bold; font-size: 18px; font-family: monospace; }
                            .confidence { display: inline-block; padding: 4px 12px; background: #059669; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 8px; }
                            .confidence.medium { background: #f59e0b; }
                            .confidence.low { background: #ef4444; }
                            .missing { color: #dc2626; background: #fee2e2; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #dc2626; }
                            .section { margin: 30px 0; }
                            .section-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 15px; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
                            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 10px 0; }
                            .stats { display: flex; gap: 20px; margin: 30px 0; }
                            .stat { flex: 1; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; }
                            .stat-number { font-size: 36px; font-weight: bold; }
                            .stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🤖 KI-Analyse: Formular ausgefüllt</h1>
                            <p class="subtitle">Ihre Profildaten wurden intelligent auf das Formular übertragen</p>
                            
                            <div class="stats">
                                <div class="stat">
                                    <div class="stat-number">${fillData.mapping.suggestions?.length || 0}</div>
                                    <div class="stat-label">Felder ausgefüllt</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-number">${Math.round((fillData.mapping.suggestions?.filter(s => s.confidence > 0.7).length || 0) / (fillData.mapping.suggestions?.length || 1) * 100)}%</div>
                                    <div class="stat-label">Genauigkeit</div>
                                </div>
                            </div>

                            <div class="section">
                                <div class="section-title">✅ Ausgefüllte Felder</div>
                                ${fillData.mapping.suggestions?.map(s => `
                                    <div class="field">
                                        <div class="field-name">${s.displayName || s.fieldName}</div>
                                        <div class="field-value">${s.suggestedValue}</div>
                                        <span class="confidence ${s.confidence > 0.8 ? 'high' : s.confidence > 0.5 ? 'medium' : 'low'}">
                                            ${Math.round(s.confidence * 100)}% Sicherheit
                                        </span>
                                        ${s.note ? `<div style="margin-top: 8px; font-size: 13px; color: #666;">💡 ${s.note}</div>` : ''}
                                    </div>
                                `).join('') || '<p>Keine Felder ausgefüllt.</p>'}
                            </div>

                            ${fillData.mapping.missingFields?.length > 0 ? `
                                <div class="section">
                                    <div class="section-title">⚠️ Fehlende Informationen</div>
                                    ${fillData.mapping.missingFields.map(f => `
                                        <div class="missing">
                                            <strong>${f.displayName}</strong>: ${f.description}
                                            ${f.required ? '<span style="color: #dc2626; font-weight: bold;"> (Pflichtfeld)</span>' : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}

                            ${fillData.mapping.warnings?.length > 0 ? `
                                <div class="section">
                                    <div class="section-title">💡 Hinweise</div>
                                    ${fillData.mapping.warnings.map(w => `
                                        <div class="warning">${w}</div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </body>
                    </html>
                `;

                const blob = new Blob([previewHtml], { type: 'text/html' });
                const url = window.URL.createObjectURL(blob);
                setFilledPdfUrl(url);
            }

            const filledFields = fillData?.stats?.filledFields || fillData?.mapping?.suggestions?.length || 0;
            const skippedFields = fillData?.stats?.skippedFields || 0;
            setStats({ filledFields, skippedFields });

            setShowSuccess(true);
            setProcessingStage('✅ Fertig!');
        } catch (error) {
            console.error('Fehler beim Ausfüllen:', error);
            setError(error.message || 'PDF konnte nicht ausgefüllt werden. Bitte versuchen Sie es erneut.');
        } finally {
            setIsProcessing(false);
            setTimeout(() => setProcessingStage(''), 2000);
        }
    };

    const handleDownload = () => {
        if (!filledPdfUrl) return;

        const link = document.createElement('a');
        link.href = filledPdfUrl;
        link.download = `antrag_ausgefuellt_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <LoadingState message="Lade Profildaten..." fullScreen />;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <SuccessToast
                message="PDF erfolgreich ausgefüllt!"
                isVisible={showSuccess}
                onClose={() => setShowSuccess(false)}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <Link to={createPageUrl('Antraege')}>
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Universelle KI-Ausfüllhilfe</h1>
                </div>
            </div>

            {/* Hero Banner */}
            <Card className="shadow-xl border-none bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Zap className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">Beliebige Anträge automatisch ausfüllen</CardTitle>
                            <p className="text-white/90">
                                Laden Sie <strong>jeden beliebigen Antrag</strong> hoch (Kindergeld, Bürgergeld, BAföG, etc.),
                                und unsere KI füllt ihn mit Ihren Daten aus!
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Profile Completeness */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Profil-Vollständigkeit
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                                {completeness < 50 && 'Unvollständig'}
                                {completeness >= 50 && completeness < 80 && 'Fast vollständig'}
                                {completeness >= 80 && 'Vollständig'}
                            </span>
                            <span className="font-semibold">{completeness}%</span>
                        </div>
                        <Progress value={completeness} className="h-2" />
                    </div>

                    {completeness < 80 && (
                        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 dark:text-amber-300">
                                Ihr Profil ist zu {100 - completeness}% unvollständig.
                                Für optimales Ausfüllen vervollständigen Sie bitte Ihr Profil.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Link to={createPageUrl('Lebenslagen')}>
                        <Button variant="outline" className="w-full">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Profil vervollständigen
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Upload Section */}
            {!filledPdfUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Antrag hochladen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Laden Sie <strong>jeden beliebigen Antrag</strong> als PDF hoch - unsere KI erkennt automatisch,
                            welche Felder ausgefüllt werden müssen und nutzt Ihre Profildaten.
                        </p>

                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="pdf-upload"
                                disabled={isAnalyzing}
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                {isAnalyzing ? (
                                    <div className="space-y-2">
                                        <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600" />
                                        <p className="font-semibold text-slate-800 dark:text-white">
                                            {processingStage || 'PDF wird analysiert...'}
                                        </p>
                                    </div>
                                ) : uploadedFile ? (
                                    <div className="space-y-2">
                                        <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                                        <p className="font-semibold text-slate-800 dark:text-white">
                                            {uploadedFile.name}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                        <Button variant="outline" size="sm" asChild>
                                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                                Andere Datei wählen
                                            </label>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-12 h-12 mx-auto text-slate-400" />
                                        <p className="font-semibold text-slate-800 dark:text-white">
                                            PDF-Datei hochladen
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Klicken oder Drag & Drop
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* PDF Analysis Results */}
                        {pdfAnalysis && (
                            <Card className={pdfAnalysis.hasFormFields ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {pdfAnalysis.hasFormFields ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`font-semibold mb-2 ${pdfAnalysis.hasFormFields ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                                {pdfAnalysis.hasFormFields
                                                    ? `✅ ${pdfAnalysis.fieldCount} ausfüllbare Felder gefunden`
                                                    : '❌ Keine ausfüllbaren Felder gefunden'}
                                            </p>
                                            {pdfAnalysis.hasFormFields ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                        🤖 Dieses PDF kann automatisch mit KI ausgefüllt werden.
                                                    </p>
                                                    {pdfAnalysis.suggestions && pdfAnalysis.suggestions.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2">
                                                                🔍 KI-Vorschau ({pdfAnalysis.suggestions.length} Felder):
                                                            </p>
                                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                {pdfAnalysis.suggestions.slice(0, 5).map((suggestion, i) => (
                                                                    <div key={i} className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {(suggestion.confidence * 100).toFixed(0)}%
                                                                        </Badge>
                                                                        <span className="font-mono">{suggestion.fieldName}</span>
                                                                        <span>→</span>
                                                                        <span className="font-semibold">{suggestion.suggestedValue}</span>
                                                                    </div>
                                                                ))}
                                                                {pdfAnalysis.suggestions.length > 5 && (
                                                                    <p className="text-xs text-green-600 dark:text-green-400 italic">
                                                                        +{pdfAnalysis.suggestions.length - 5} weitere Felder
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="text-sm text-red-700 dark:text-red-300">
                                                        {pdfAnalysis.warning || 'Dieses PDF kann nicht automatisch ausgefüllt werden.'}
                                                    </p>
                                                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                                                        <Info className="h-4 w-4 text-amber-600" />
                                                        <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                                                            <strong>Tipp:</strong> Viele Behörden-PDFs haben keine ausfüllbaren Felder.
                                                            Laden Sie stattdessen ein offizielles Formular mit Formularfeldern hoch,
                                                            oder nutzen Sie unseren Web-Assistenten für Online-Formulare.
                                                        </AlertDescription>
                                                    </Alert>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {error && <ErrorState message={error} />}

                        <Button
                            onClick={handleFillPdf}
                            disabled={!uploadedFileUrl || isProcessing || isAnalyzing || (pdfAnalysis && !pdfAnalysis.hasFormFields)}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {processingStage || 'Formular wird ausgefüllt...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Mit KI automatisch ausfüllen
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {filledPdfUrl && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                            <CheckCircle className="w-6 h-6" />
                            Formular erfolgreich ausgefüllt!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {stats && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">{stats.filledFields}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Felder ausgefüllt</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-slate-400">{stats.skippedFields}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Felder übersprungen</p>
                                </div>
                            </div>
                        )}

                        <iframe
                            src={filledPdfUrl}
                            className="w-full h-96 border border-slate-300 dark:border-slate-600 rounded-xl"
                            title="Ausgefülltes Formular"
                        />

                        <div className="flex gap-3">
                            <Button
                                onClick={handleDownload}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Herunterladen
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFilledPdfUrl(null);
                                    setUploadedFile(null);
                                    setUploadedFileUrl(null);
                                    setStats(null);
                                    setPdfAnalysis(null);
                                }}
                            >
                                Neues Formular ausfüllen
                            </Button>
                        </div>

                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Wichtig:</strong> Bitte prüfen Sie alle ausgefüllten Felder vor dem Einreichen des Antrags.
                                Nicht alle Felder können automatisch ausgefüllt werden.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}