import { useState } from 'react';
import { UploadFile } from '@/api/integrations';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const officialPdfUrls = [
    {
        id: 'buergergeld',
        title: 'Bürgergeld-Hauptantrag',
        url: 'https://www.arbeitsagentur.de/datei/antrag-sgb2_ba042689.pdf',
        filename: 'buergergeld_hauptantrag.pdf'
    },
    {
        id: 'arbeitslosengeld',
        title: 'Arbeitslosengeld I',
        url: 'https://www.arbeitsagentur.de/vor-ort/datei/eservice-anleitung-arbeitslosengeld_ba108727.pdf',
        filename: 'arbeitslosengeld_antrag.pdf'
    },
    {
        id: 'kindergeld',
        title: 'Kindergeld-Antrag',
        url: 'https://www.arbeitsagentur.de/datei/kindergeldantrag_ba013086.pdf',
        filename: 'kindergeld_antrag.pdf'
    },
    {
        id: 'kinderzuschlag',
        title: 'Kinderzuschlag',
        url: 'https://www.arbeitsagentur.de/datei/kiz1-hauptantrag_ba016462.pdf',
        filename: 'kinderzuschlag_antrag.pdf'
    },
    {
        id: 'wohngeld',
        title: 'Wohngeld-Antrag',
        url: 'https://www.bmas.de/SharedDocs/Downloads/DE/Formulare/wohngeldantrag.pdf',
        filename: 'wohngeld_antrag.pdf'
    },
    {
        id: 'bab',
        title: 'Berufsausbildungsbeihilfe',
        url: 'https://www.arbeitsagentur.de/datei/bab-antrag_ba036520.pdf',
        filename: 'bab_antrag.pdf'
    }
];

export default function PdfDownloader({ onPdfsDownloaded }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentDownload, setCurrentDownload] = useState('');
    const [downloadedPdfs, setDownloadedPdfs] = useState([]);
    const [errors, setErrors] = useState([]);

    const downloadAllPdfs = async () => {
        setIsDownloading(true);
        setProgress(0);
        setErrors([]);
        const downloaded = [];

        for (let i = 0; i < officialPdfUrls.length; i++) {
            const pdf = officialPdfUrls[i];
            setCurrentDownload(pdf.title);
            setProgress((i / officialPdfUrls.length) * 100);

            try {
                console.log(`Downloading PDF: ${pdf.title} from ${pdf.url}`);
                
                // Fetch PDF from official URL
                const response = await fetch(pdf.url);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
                }

                const blob = await response.blob();
                
                // Create File object for upload
                const file = new File([blob], pdf.filename, { type: 'application/pdf' });
                
                // Upload to our app's storage
                const uploadResult = await UploadFile({ file });
                
                console.log(`Successfully uploaded: ${pdf.title}`, uploadResult);
                
                downloaded.push({
                    ...pdf,
                    localUrl: uploadResult.file_url,
                    uploadedAt: new Date().toISOString()
                });

                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error downloading ${pdf.title}:`, error);
                setErrors(prev => [...prev, `${pdf.title}: ${error.message}`]);
            }
        }

        setProgress(100);
        setDownloadedPdfs(downloaded);
        setIsDownloading(false);
        setCurrentDownload('');

        // Store the downloaded PDFs in localStorage for the app to use
        localStorage.setItem('downloaded_pdfs', JSON.stringify(downloaded));
        
        if (onPdfsDownloaded) {
            onPdfsDownloaded(downloaded);
        }
    };

    return (
        <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    PDF Download Center
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Lädt alle offiziellen Antragsformulare direkt in die App herunter
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isDownloading && downloadedPdfs.length === 0 && (
                    <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                            PDFs in App integrieren
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Lädt alle {officialPdfUrls.length} offiziellen Antragsformulare herunter und speichert sie direkt in der App.
                        </p>
                        <Button 
                            onClick={downloadAllPdfs}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Alle PDFs herunterladen ({officialPdfUrls.length} Dateien)
                        </Button>
                    </div>
                )}

                {isDownloading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    Lade herunter: {currentDownload}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {Math.round(progress)}% abgeschlossen
                                </p>
                            </div>
                        </div>
                        <Progress value={progress} className="w-full" />
                    </div>
                )}

                {downloadedPdfs.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">
                                {downloadedPdfs.length} PDFs erfolgreich heruntergeladen!
                            </span>
                        </div>
                        
                        <div className="grid gap-2">
                            {downloadedPdfs.map((pdf) => (
                                <div key={pdf.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                            {pdf.title}
                                        </span>
                                    </div>
                                    <a 
                                        href={pdf.localUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                                    >
                                        Öffnen
                                    </a>
                                </div>
                            ))}
                        </div>
                        
                        <Button 
                            onClick={downloadAllPdfs}
                            variant="outline"
                            className="w-full"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            PDFs erneut herunterladen
                        </Button>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Fehler beim Download:</span>
                        </div>
                        {errors.map((error, index) => (
                            <p key={index} className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                {error}
                            </p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}