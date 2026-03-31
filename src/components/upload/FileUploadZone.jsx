import { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, FileText, Camera, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { track, AREA } from '@/components/core/telemetry';

/**
 * U3.1 - DATEITYP/GRÖSSE VORPRÜFUNG
 * Validierung vor dem Upload
 */

const FILE_VALIDATION = {
    maxSizeMB: 10,
    maxSizeBytes: 10 * 1024 * 1024,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    acceptedExtensions: ['.pdf', '.jpg', '.jpeg', '.png']
};

const validateFile = (file) => {
    const errors = [];

    // Size check
    if (file.size > FILE_VALIDATION.maxSizeBytes) {
        errors.push({
            type: 'size',
            message: `Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximal ${FILE_VALIDATION.maxSizeMB} MB erlaubt.`
        });
    }

    // Type check
    if (!FILE_VALIDATION.acceptedTypes.includes(file.type)) {
        errors.push({
            type: 'type',
            message: `Dateityp "${file.type}" nicht unterstützt. Nur PDF, JPG und PNG erlaubt.`
        });
    }

    // Extension check (zusätzlich zum Type)
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!FILE_VALIDATION.acceptedExtensions.includes(extension)) {
        errors.push({
            type: 'extension',
            message: `Dateiendung "${extension}" nicht unterstützt.`
        });
    }

    // Name check (keine Sonderzeichen)
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(file.name)) {
        errors.push({
            type: 'name',
            message: 'Dateiname enthält ungültige Zeichen.'
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

export default function FileUploadZone({ onFileSelected }) {
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isDragReject, setIsDragReject] = useState(false);
    const [isCameraMode, setIsCameraMode] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const inputRef = useRef(null);
    const cameraRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const acceptedFileTypes = useMemo(() => FILE_VALIDATION.acceptedTypes, []);
    const acceptedFileExtensions = FILE_VALIDATION.acceptedExtensions.join(',');

    const handleFile = useCallback((selectedFile) => {
        // U3.1: Validate file before accepting
        const validation = validateFile(selectedFile);
        
        if (!validation.valid) {
            setValidationErrors(validation.errors);
            setFile(null);
            setIsDragReject(true);
            
            track('upload.file.rejected', AREA.UPLOAD, {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                errors: validation.errors.map(e => e.type)
            });
            
            setTimeout(() => setIsDragReject(false), 3000);
            return;
        }

        // Valid file
        setFile(selectedFile);
        setValidationErrors([]);
        setIsDragReject(false);
        
        track('upload.file.accepted', AREA.UPLOAD, {
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type
        });
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
            
            // Preview validation on drag
            const items = e.dataTransfer.items;
            if (items && items.length > 0) {
                const itemType = items[0].type;
                if (!acceptedFileTypes.includes(itemType)) {
                    setIsDragReject(true);
                } else {
                    setIsDragReject(false);
                }
            }
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
            setIsDragReject(false);
        }
    }, [acceptedFileTypes]);

    const handleInputChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    const openFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const stopCamera = useCallback(() => {
        if (cameraRef.current) {
            const tracks = cameraRef.current.getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraMode(false);
        cameraRef.current = null;
    }, []);

    const startCamera = useCallback(async () => {
        try {
            setIsCameraMode(true);
            setIsCapturing(true);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                cameraRef.current = stream;
            }
            
            track('upload.camera.started', AREA.UPLOAD);
            setIsCapturing(false);
        } catch (error) {
            console.error('Kamera-Zugriff fehlgeschlagen:', error);
            alert('Kamera-Zugriff nicht möglich. Bitte verwenden Sie den Datei-Upload.');
            setIsCameraMode(false);
            setIsCapturing(false);
            
            track('upload.camera.failed', AREA.UPLOAD, {
                error: error.message
            });
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setFile(file);
                    stopCamera();
                    
                    track('upload.camera.captured', AREA.UPLOAD, {
                        fileSize: file.size
                    });
                }
            }, 'image/jpeg', 0.85);
        }
    }, [stopCamera]);

    const handleConfirm = useCallback((e) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        console.log('🎯 handleConfirm called, file:', file?.name);
        
        if (file) {
            track('upload.file.confirmed', AREA.UPLOAD, {
                fileName: file.name,
                fileSize: file.size
            });
            console.log('🚀 Calling onFileSelected with file:', file);
            onFileSelected(file);
        } else {
            console.error('❌ No file selected!');
        }
    }, [file, onFileSelected]);

    // FILE SELECTED - CONFIRMATION VIEW
    if (file) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20 rounded-2xl">
                <div className="flex items-center justify-center gap-4 text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                    <Check className="w-6 h-6" />
                    <span>Datei bereit zum Hochladen:</span>
                </div>
                
                <div className="my-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">{file.name}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                    </p>
                </div>
                
                <div className="flex justify-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setFile(null);
                            setValidationErrors([]);
                            track('upload.file.cancelled', AREA.UPLOAD);
                        }}
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <X className="w-4 h-4 mr-2"/>
                        Abbrechen
                    </Button>
                    <Button 
                        type="button"
                        onClick={handleConfirm}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Upload className="w-4 h-4 mr-2"/>
                        Analyse starten
                    </Button>
                </div>
            </div>
        );
    }

    // CAMERA MODE
    if (isCameraMode) {
        return (
            <div className="text-center space-y-4">
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                        ref={videoRef}
                        className="w-full max-w-2xl mx-auto rounded-2xl"
                        autoPlay
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="flex justify-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={stopCamera} 
                        disabled={isCapturing}
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Abbrechen
                    </Button>
                    <Button 
                        onClick={capturePhoto} 
                        disabled={isCapturing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Camera className="w-4 h-4 mr-2"/>
                        Foto aufnehmen
                    </Button>
                </div>
                
                {isCapturing && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Kamera wird gestartet...
                    </p>
                )}
            </div>
        );
    }

    // UPLOAD ZONE
    return (
        <div className="space-y-6">
            {/* U3.1: Validation Errors */}
            {validationErrors.length > 0 && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Datei abgelehnt:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {validationErrors.map((error, idx) => (
                                <li key={idx}>{error.message}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* DRAG & DROP ZONE */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                    className={cn(
                        "relative group p-10 flex flex-col items-center justify-center text-center border-4 border-dashed rounded-3xl transition-all duration-300 ease-in-out cursor-pointer",
                        isDragActive && !isDragReject && 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20',
                        isDragReject && 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20',
                        !isDragActive && 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                    )}
                >
                    <input 
                        ref={inputRef}
                        type="file" 
                        className="hidden"
                        onChange={handleInputChange}
                        accept={acceptedFileExtensions}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300",
                            isDragReject ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        )}>
                            {isDragReject ? (
                                <X className="w-12 h-12 text-white" />
                            ) : (
                                <Upload className="w-12 h-12 text-white" />
                            )}
                        </div>
                        
                        <h3 className="mt-6 text-2xl font-bold text-slate-800 dark:text-white">
                            Dokument hochladen
                        </h3>
                        
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            {isDragActive && !isDragReject && 'Lassen Sie die Datei hier los'}
                            {isDragReject && '❌ Ungültiger Dateityp oder zu groß'}
                            {!isDragActive && 'Ziehen Sie Ihre Abrechnung hierher oder klicken Sie'}
                        </p>
                        
                        <div className="mt-4 space-y-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                ✅ PDF, JPG, PNG erlaubt
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                📦 Maximal {FILE_VALIDATION.maxSizeMB} MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* ALTERNATIVES */}
                <div className="p-8 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/60 dark:border-slate-700/60">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                        Alternativen
                    </h3>
                    
                    <div className="space-y-4">
                        <Button 
                            variant="outline" 
                            onClick={startCamera}
                            disabled={isCapturing}
                            className="w-full justify-start p-6 text-left h-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <Camera className="w-5 h-5 mr-4 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    {isCapturing ? 'Kamera startet...' : 'Mit Kamera scannen'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Fotografieren Sie Ihre Abrechnung direkt
                                </p>
                            </div>
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            className="w-full justify-start p-6 text-left h-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            <FileText className="w-5 h-5 mr-4 text-slate-400" />
                            <div>
                                <p className="font-semibold text-slate-600 dark:text-slate-400">
                                    Manuell eingeben
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Bald verfügbar
                                </p>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}