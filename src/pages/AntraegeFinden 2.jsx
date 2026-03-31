import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import AntragsService from '@/services/AntragsService';
import PdfParserService from '@/services/PdfParserService';
import PdfFillService from '@/services/PdfFillService';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Sparkles,
  Euro,
  Clock,
  Building2,
  ArrowRight,
  Upload,
  FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingState from '@/components/ui/LoadingState';

export default function AntraegeFinden() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [eligibleAntraege, setEligibleAntraege] = useState([]);
  const [selectedAntrag, setSelectedAntrag] = useState(null);
  const [filledAntrag, setFilledAntrag] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [pdfAnalysis, setPdfAnalysis] = useState(null);
  const [isFillingPdf, setIsFillingPdf] = useState(false);
  const [filledPdfResult, setFilledPdfResult] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load user profile from Supabase
      const profile = {
        vorname: currentUser.full_name?.split(' ')[0],
        nachname: currentUser.full_name?.split(' ')[1],
        geburtsdatum: currentUser.geburtsdatum,
        adresse: currentUser.adresse,
        plz: currentUser.plz,
        stadt: currentUser.stadt,
        wohnart: currentUser.wohnart,
        monatliche_miete_kalt: currentUser.monatliche_miete_kalt,
        wohnflaeche_qm: currentUser.wohnflaeche_qm,
        haushalt_groesse: currentUser.haushalt_groesse,
        monatliches_nettoeinkommen: currentUser.monatliches_nettoeinkommen,
        kinder_anzahl: currentUser.kinder_anzahl,
        beschaeftigungsstatus: currentUser.beschaeftigungsstatus
      };
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setError('Bitte melden Sie sich an.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchAntraege = async () => {
    if (!userProfile) return;
    
    setIsSearching(true);
    setError(null);

    try {
      const result = await AntragsService.findEligibleAntraege(userProfile);
      
      if (result.success) {
        setEligibleAntraege(result.antraege);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Suchfehler:', err);
      setError(err.message || 'Suche fehlgeschlagen');
    } finally {
      setIsSearching(false);
    }
  };

  const autofillAntrag = async (antragId) => {
    try {
      const result = await AntragsService.autofillAntrag(antragId, userProfile);
      
      if (result.success) {
        setFilledAntrag(result.antrag);
        setSelectedAntrag(antragId);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Ausfüll-Fehler:', err);
      setError(err.message);
    }
  };

  const downloadAntrag = async () => {
    if (!filledAntrag) return;
    
    try {
      const result = await AntragsService.generateFilledPDF(
        selectedAntrag,
        filledAntrag.filledData
      );
      
      if (result.success) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        link.click();
      }
    } catch (err) {
      console.error('Download-Fehler:', err);
      setError(err.message);
    }
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setUploadedPdf(file);

    try {
      // Validiere PDF
      const validation = await PdfParserService.validatePdf(file);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Analysiere PDF
      const analysis = await PdfParserService.parsePdfForm(file);
      
      if (!analysis.success) {
        throw new Error(analysis.error);
      }

      setPdfAnalysis(analysis);
    } catch (err) {
      console.error('PDF-Upload-Fehler:', err);
      setError(err.message);
      setUploadedPdf(null);
    }
  };

  const fillUploadedPdf = async () => {
    if (!uploadedPdf || !userProfile) return;

    setIsFillingPdf(true);
    setError(null);

    try {
      const result = await PdfFillService.fillPdfForm(uploadedPdf, userProfile, {
        flatten: false,
        watermark: 'MiMiCheck - Automatisch ausgefüllt'
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setFilledPdfResult(result);

      // Download-Link erstellen
      const downloadLink = PdfFillService.createDownloadLink(
        result.pdfBytes,
        `${uploadedPdf.name.replace('.pdf', '')}_ausgefuellt.pdf`
      );

      // Automatisch downloaden
      const link = document.createElement('a');
      link.href = downloadLink.url;
      link.download = downloadLink.filename;
      link.click();

    } catch (err) {
      console.error('PDF-Fill-Fehler:', err);
      setError(err.message);
    } finally {
      setIsFillingPdf(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Lade Profil..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Anträge finden & ausfüllen
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            KI findet automatisch passende Förderungen und füllt Anträge für Sie aus
          </p>
        </motion.div>

        {/* PDF Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Eigenes PDF-Formular ausfüllen
              </CardTitle>
              <CardDescription>
                Laden Sie ein beliebiges PDF-Formular hoch und lassen Sie es automatisch ausfüllen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload">
                  <Button asChild variant="outline">
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF auswählen
                    </span>
                  </Button>
                </label>
                
                {uploadedPdf && (
                  <div className="flex-1 flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{uploadedPdf.name}</span>
                    </div>
                    <Button
                      onClick={fillUploadedPdf}
                      disabled={isFillingPdf}
                      size="sm"
                    >
                      {isFillingPdf ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Fülle aus...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Automatisch ausfüllen
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {pdfAnalysis && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    PDF analysiert: {pdfAnalysis.totalFields} Felder gefunden
                    {pdfAnalysis.metadata.title !== 'Unbekannt' && ` - ${pdfAnalysis.metadata.title}`}
                  </p>
                </div>
              )}

              {filledPdfResult && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-green-900 dark:text-green-100 font-semibold">
                    ✅ PDF erfolgreich ausgefüllt!
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-700 dark:text-green-300">Ausgefüllt:</span>
                      <span className="ml-2 font-semibold">{filledPdfResult.filledCount} Felder</span>
                    </div>
                    <div>
                      <span className="text-green-700 dark:text-green-300">Nicht zugeordnet:</span>
                      <span className="ml-2 font-semibold">{filledPdfResult.unmappedFields.length} Felder</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        {eligibleAntraege.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h2 className="text-2xl font-bold mb-2">Bereit, Ihre Ansprüche zu finden?</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Unsere KI analysiert Ihr Profil und findet alle Förderungen, die zu Ihnen passen
                </p>
                <Button
                  onClick={searchAntraege}
                  disabled={isSearching}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Suche läuft...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Jetzt Anträge finden
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {eligibleAntraege.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {eligibleAntraege.length} passende Anträge gefunden
              </h2>
              <Button
                onClick={searchAntraege}
                variant="outline"
                size="sm"
              >
                <Search className="w-4 h-4 mr-2" />
                Neu suchen
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {eligibleAntraege.map((antrag, index) => (
                <motion.div
                  key={antrag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {antrag.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {antrag.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={antrag.eligibilityScore >= 80 ? "success" : "default"}
                          className="ml-2"
                        >
                          {antrag.eligibilityScore}% Match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Euro className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">{antrag.estimatedAmount}€/Monat</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{antrag.processingTime}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span>{antrag.authority}</span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      {antrag.reasoning && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            {antrag.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Missing Data */}
                      {antrag.missingData && antrag.missingData.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                          <p className="text-sm text-yellow-900 dark:text-yellow-100">
                            <AlertCircle className="w-4 h-4 inline mr-2" />
                            Fehlende Daten: {antrag.missingData.join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={() => autofillAntrag(antrag.id)}
                        className="w-full"
                        variant={selectedAntrag === antrag.id ? "secondary" : "default"}
                      >
                        {selectedAntrag === antrag.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ausgefüllt
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Automatisch ausfüllen
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filled Antrag Preview */}
        {filledAntrag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Antrag ausgefüllt: {filledAntrag.name}
                </CardTitle>
                <CardDescription>
                  Vollständigkeit: {filledAntrag.completeness}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filled Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(filledAntrag.filledData).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Missing Fields */}
                {filledAntrag.missingFields && filledAntrag.missingFields.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bitte ergänzen Sie noch: {filledAntrag.missingFields.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Download Button */}
                <div className="flex gap-4">
                  <Button
                    onClick={downloadAntrag}
                    className="flex-1"
                    size="lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Antrag herunterladen
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Weiter bearbeiten
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
