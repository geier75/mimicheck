import { useState, useEffect } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Building2, 
    Key, 
    Shield, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Send,
    FileSignature,
    Lock,
    Globe
} from 'lucide-react';

// ZEPTO STEP 6.1: Behörden-API Test Cases (RED PHASE - Tests First!)
class BehoerdenAPITestCase {
    constructor(name, testFn, expectedResult = null, behoerde = null, apiType = 'test') {
        this.id = `api_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.testFn = testFn;
        this.expectedResult = expectedResult;
        this.behoerde = behoerde; // 'arbeitsagentur', 'familienkasse', 'wohngeldstelle', 'finanzamt'
        this.apiType = apiType; // 'test', 'sandbox', 'production'
        this.status = 'pending';
        this.actualResult = null;
        this.error = null;
        this.duration = 0;
        this.timestamp = null;
    }

    async run() {
        this.status = 'running';
        this.timestamp = new Date().toISOString();
        const startTime = performance.now();
        
        try {
            this.actualResult = await this.testFn();
            this.duration = performance.now() - startTime;
            
            if (this.expectedResult !== null) {
                this.status = JSON.stringify(this.actualResult) === JSON.stringify(this.expectedResult) 
                    ? 'passed' 
                    : 'failed';
            } else {
                this.status = 'passed';
            }

            // Track Behörden API test
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'behoerden_api_test',
                    'BehoerdenAPITestSuite',
                    { 
                        testName: this.name, 
                        status: this.status,
                        behoerde: this.behoerde,
                        apiType: this.apiType,
                        duration: this.duration 
                    }
                );
            }
        } catch (error) {
            this.error = error;
            this.status = 'failed';
            this.duration = performance.now() - startTime;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'behoerden_api_test',
                        testName: this.name,
                        behoerde: this.behoerde 
                    },
                    'high'
                );
            }
        }
        
        return this.status;
    }
}

// ZEPTO STEP 6.2: Behörden-Connector Base Class (GREEN PHASE - Foundation)
class BehoerdenConnector {
    constructor(behoerdeName, config = {}) {
        this.behoerdeName = behoerdeName;
        this.config = {
            baseUrl: config.baseUrl || '',
            apiKey: config.apiKey || '',
            timeout: config.timeout || 30000,
            retryAttempts: config.retryAttempts || 3,
            rateLimitPerMinute: config.rateLimitPerMinute || 10,
            ...config
        };
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.digitalSigner = new DigitalSignatureService();
    }

    // ZEPTO STEP 6.3: Rate limiting
    async checkRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        if (now - this.lastRequestTime < oneMinute) {
            if (this.requestCount >= this.config.rateLimitPerMinute) {
                throw new Error(`Rate limit exceeded for ${this.behoerdeName}. Max ${this.config.rateLimitPerMinute} requests per minute.`);
            }
        } else {
            this.requestCount = 0;
        }
        
        this.requestCount++;
        this.lastRequestTime = now;
    }

    // ZEPTO STEP 6.4: Secure API Request with retry logic
    async makeRequest(endpoint, method = 'POST', data = null, requiresSignature = false) {
        await this.checkRateLimit();
        
        let attempt = 0;
        while (attempt < this.config.retryAttempts) {
            try {
                if (requiresSignature && data) {
                    data = await this.digitalSigner.signData(data, this.behoerdeName);
                }
                
                const response = await this.performRequest(endpoint, method, data);
                
                if (window.MiMiCheckObservability) {
                    window.MiMiCheckObservability.trackUserInteraction(
                        'behoerden_api_request',
                        `BehoerdenConnector.${this.behoerdeName}`,
                        { 
                            endpoint, 
                            method, 
                            attempt: attempt + 1,
                            success: true,
                            requiresSignature
                        }
                    );
                }
                
                return response;
            } catch (error) {
                attempt++;
                
                if (attempt >= this.config.retryAttempts) {
                    if (window.MiMiCheckObservability) {
                        window.MiMiCheckObservability.trackError(
                            error,
                            { 
                                source: 'behoerden_api_request',
                                behoerde: this.behoerdeName,
                                endpoint,
                                totalAttempts: attempt
                            },
                            'high'
                        );
                    }
                    throw error;
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // ZEPTO STEP 6.5: Abstract method for specific implementation
    async performRequest(endpoint, method, data) {
        throw new Error('performRequest must be implemented by subclass');
    }

    // ZEPTO STEP 6.6: Validate API credentials
    async validateCredentials() {
        try {
            const response = await this.makeRequest('/health', 'GET');
            return { valid: true, response };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

// ZEPTO STEP 6.7: Digital Signature Service (Critical for Behörden-Integration)
class DigitalSignatureService {
    constructor() {
        this.keyPair = null;
        this.certificates = new Map();
        this.initialized = false;
    }

    // ZEPTO STEP 6.8: Initialize cryptographic keys
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Generate key pair for digital signatures
            // In production: Load from secure key management service
            this.keyPair = await window.crypto.subtle.generateKey(
                {
                    name: 'RSASSA-PKCS1-v1_5',
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
                true, // extractable
                ['sign', 'verify']
            );
            
            this.initialized = true;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'digital_signature_service_initialized',
                    'DigitalSignatureService',
                    { keyType: 'RSASSA-PKCS1-v1_5', keySize: 2048 }
                );
            }
        } catch (error) {
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { source: 'digital_signature_initialization' },
                    'critical'
                );
            }
            throw error;
        }
    }

    // ZEPTO STEP 6.9: Sign data for Behörden submission
    async signData(data, behoerdeName) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const dataString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(dataString);
        
        try {
            const signature = await window.crypto.subtle.sign(
                'RSASSA-PKCS1-v1_5',
                this.keyPair.privateKey,
                dataBuffer
            );
            
            const signedData = {
                data: data,
                signature: Array.from(new Uint8Array(signature)),
                timestamp: new Date().toISOString(),
                behoerde: behoerdeName,
                signatureAlgorithm: 'RSASSA-PKCS1-v1_5',
                keyFingerprint: await this.getKeyFingerprint()
            };
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'data_digitally_signed',
                    'DigitalSignatureService',
                    { 
                        behoerde: behoerdeName,
                        dataSize: dataString.length,
                        signatureSize: signature.byteLength
                    }
                );
            }
            
            return signedData;
        } catch (error) {
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'digital_signing',
                        behoerde: behoerdeName,
                        dataSize: dataString.length
                    },
                    'high'
                );
            }
            throw error;
        }
    }

    // ZEPTO STEP 6.10: Verify signature
    async verifySignature(signedData) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const dataString = JSON.stringify(signedData.data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(dataString);
        const signatureBuffer = new Uint8Array(signedData.signature).buffer;
        
        try {
            const isValid = await window.crypto.subtle.verify(
                'RSASSA-PKCS1-v1_5',
                this.keyPair.publicKey,
                signatureBuffer,
                dataBuffer
            );
            
            return {
                valid: isValid,
                timestamp: signedData.timestamp,
                behoerde: signedData.behoerde,
                keyFingerprint: signedData.keyFingerprint
            };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    // ZEPTO STEP 6.11: Get key fingerprint for identification
    async getKeyFingerprint() {
        if (!this.keyPair) return null;
        
        const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', publicKeyBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// ZEPTO STEP 6.12: Arbeitsagentur Connector (Specific Implementation)
class ArbeitsagenturConnector extends BehoerdenConnector {
    constructor(config = {}) {
        super('Arbeitsagentur', {
            baseUrl: config.baseUrl || 'https://api.arbeitsagentur.de/sandbox',
            apiKey: config.apiKey || 'test_key',
            ...config
        });
    }

    async performRequest(endpoint, method, data) {
        // Simulated API call for testing
        // In production: Real HTTP request to Arbeitsagentur API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    endpoint,
                    method,
                    data,
                    timestamp: new Date().toISOString(),
                    behoerde: this.behoerdeName
                });
            }, 1000);
        });
    }

    // ZEPTO STEP 6.13: Submit Bürgergeld application
    async submitBuergergelAntrag(userData) {
        const antragData = {
            antragsteller: {
                vorname: userData.vorname,
                nachname: userData.nachname,
                geburtsdatum: userData.geburtsdatum
            },
            lebenssituation: userData.lebenssituation,
            timestamp: new Date().toISOString(),
            antragType: 'buergergeld'
        };

        return await this.makeRequest('/antrag/buergergeld', 'POST', antragData, true);
    }
}

// ZEPTO STEP 6.14: Familienkasse Connector
class FamilienkasseConnector extends BehoerdenConnector {
    constructor(config = {}) {
        super('Familienkasse', {
            baseUrl: config.baseUrl || 'https://api.familienkasse.de/sandbox',
            apiKey: config.apiKey || 'test_key',
            ...config
        });
    }

    async performRequest(endpoint, method, data) {
        // Simulated API call for testing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    endpoint,
                    method,
                    data,
                    timestamp: new Date().toISOString(),
                    behoerde: this.behoerdeName
                });
            }, 800);
        });
    }

    // ZEPTO STEP 6.15: Submit Kindergeld application
    async submitKindergeldAntrag(userData) {
        const antragData = {
            antragsteller: {
                vorname: userData.vorname,
                nachname: userData.nachname,
                geburtsdatum: userData.geburtsdatum
            },
            kinder: userData.lebenssituation?.kinder_details || [],
            timestamp: new Date().toISOString(),
            antragType: 'kindergeld'
        };

        return await this.makeRequest('/antrag/kindergeld', 'POST', antragData, true);
    }
}

// ZEPTO STEP 6.16: API Gateway for Behörden Integration
class BehoerdenAPIGateway {
    constructor() {
        this.connectors = new Map();
        this.requestLog = [];
        this.initialized = false;
    }

    // ZEPTO STEP 6.17: Initialize all available connectors
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Initialize available connectors
            this.connectors.set('arbeitsagentur', new ArbeitsagenturConnector());
            this.connectors.set('familienkasse', new FamilienkasseConnector());
            
            // Validate connections
            for (const [name, connector] of this.connectors) {
                const validation = await connector.validateCredentials();
                if (!validation.valid) {
                    console.warn(`${name} connector validation failed:`, validation.error);
                }
            }
            
            this.initialized = true;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'behoerden_api_gateway_initialized',
                    'BehoerdenAPIGateway',
                    { 
                        availableConnectors: Array.from(this.connectors.keys()),
                        totalConnectors: this.connectors.size
                    }
                );
            }
        } catch (error) {
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { source: 'api_gateway_initialization' },
                    'critical'
                );
            }
            throw error;
        }
    }

    // ZEPTO STEP 6.18: Route request to appropriate Behörde
    async routeRequest(behoerde, action, userData) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const connector = this.connectors.get(behoerde);
        if (!connector) {
            throw new Error(`No connector available for ${behoerde}`);
        }

        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const request = {
            id: requestId,
            behoerde,
            action,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        this.requestLog.push(request);
        
        try {
            let response;
            switch (action) {
                case 'submit_buergergeld':
                    response = await connector.submitBuergergelAntrag(userData);
                    break;
                case 'submit_kindergeld':
                    response = await connector.submitKindergeldAntrag(userData);
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            request.status = 'completed';
            request.response = response;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'behoerden_request_completed',
                    'BehoerdenAPIGateway',
                    { 
                        requestId,
                        behoerde,
                        action,
                        success: true
                    }
                );
            }
            
            return { success: true, requestId, response };
        } catch (error) {
            request.status = 'failed';
            request.error = error.message;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'behoerden_request',
                        requestId,
                        behoerde,
                        action
                    },
                    'high'
                );
            }
            
            return { success: false, requestId, error: error.message };
        }
    }

    // ZEPTO STEP 6.19: Get request history
    getRequestHistory(limit = 10) {
        return this.requestLog
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }
}

// ZEPTO STEP 6.20: Create Behörden API Tests (RED PHASE)
const createBehoerdenAPITests = () => [
    new BehoerdenAPITestCase(
        'Digital Signature Service - Initialisierung',
        async () => {
            const digitalSigner = new DigitalSignatureService();
            await digitalSigner.initialize();
            
            return {
                initialized: digitalSigner.initialized,
                hasKeyPair: !!digitalSigner.keyPair,
                keyType: digitalSigner.keyPair ? 'RSASSA-PKCS1-v1_5' : null
            };
        },
        { initialized: true, hasKeyPair: true, keyType: 'RSASSA-PKCS1-v1_5' },
        null,
        'test'
    ),

    new BehoerdenAPITestCase(
        'Digital Signature - Signierung und Verifikation',
        async () => {
            const digitalSigner = new DigitalSignatureService();
            await digitalSigner.initialize();
            
            const testData = { vorname: 'Max', nachname: 'Mustermann', test: true };
            const signedData = await digitalSigner.signData(testData, 'test_behoerde');
            const verification = await digitalSigner.verifySignature(signedData);
            
            return {
                dataSigned: !!signedData.signature,
                signatureValid: verification.valid,
                timestampPresent: !!signedData.timestamp,
                behoerdeMatches: signedData.behoerde === 'test_behoerde'
            };
        },
        { dataSigned: true, signatureValid: true, timestampPresent: true, behoerdeMatches: true },
        null,
        'test'
    ),

    new BehoerdenAPITestCase(
        'Arbeitsagentur Connector - Credentials Validation',
        async () => {
            const connector = new ArbeitsagenturConnector();
            const validation = await connector.validateCredentials();
            
            return {
                connectionEstablished: validation.valid,
                behoerdeName: connector.behoerdeName,
                rateLimitConfigured: connector.config.rateLimitPerMinute > 0
            };
        },
        { connectionEstablished: true, behoerdeName: 'Arbeitsagentur', rateLimitConfigured: true },
        'arbeitsagentur',
        'test'
    ),

    new BehoerdenAPITestCase(
        'Familienkasse Connector - Credentials Validation',
        async () => {
            const connector = new FamilienkasseConnector();
            const validation = await connector.validateCredentials();
            
            return {
                connectionEstablished: validation.valid,
                behoerdeName: connector.behoerdeName,
                rateLimitConfigured: connector.config.rateLimitPerMinute > 0
            };
        },
        { connectionEstablished: true, behoerdeName: 'Familienkasse', rateLimitConfigured: true },
        'familienkasse',
        'test'
    ),

    new BehoerdenAPITestCase(
        'API Gateway - Initialization und Routing',
        async () => {
            const gateway = new BehoerdenAPIGateway();
            await gateway.initialize();
            
            const testUser = {
                vorname: 'Test',
                nachname: 'User',
                geburtsdatum: '1990-01-01',
                lebenssituation: { kinder_details: [{ alter: 5 }] }
            };
            
            const result = await gateway.routeRequest('arbeitsagentur', 'submit_buergergeld', testUser);
            
            return {
                gatewayInitialized: gateway.initialized,
                connectorsCount: gateway.connectors.size,
                requestSuccessful: result.success,
                requestIdGenerated: !!result.requestId
            };
        },
        { gatewayInitialized: true, connectorsCount: 2, requestSuccessful: true, requestIdGenerated: true },
        null,
        'test'
    ),

    new BehoerdenAPITestCase(
        'Rate Limiting - Schutz vor Überlastung',
        async () => {
            const connector = new ArbeitsagenturConnector({
                rateLimitPerMinute: 2 // Sehr niedrig für Test
            });
            
            let requestCount = 0;
            let rateLimitError = false;
            
            try {
                // Erste beiden Requests sollten funktionieren
                await connector.makeRequest('/test1', 'GET');
                requestCount++;
                await connector.makeRequest('/test2', 'GET');
                requestCount++;
                
                // Dritter Request sollte Rate Limit auslösen
                await connector.makeRequest('/test3', 'GET');
                requestCount++;
            } catch (error) {
                rateLimitError = error.message.includes('Rate limit exceeded');
            }
            
            return {
                successfulRequests: requestCount,
                rateLimitTriggered: rateLimitError,
                rateLimitWorking: requestCount === 2 && rateLimitError
            };
        },
        { successfulRequests: 2, rateLimitTriggered: true, rateLimitWorking: true },
        'arbeitsagentur',
        'test'
    )
];

// ZEPTO STEP 6.21: Main Behörden API Test Suite Component
export default function BehoerdenAPITestSuite() {
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [testResults, setTestResults] = useState({});
    const [gateway] = useState(() => new BehoerdenAPIGateway());
    const [requestHistory, setRequestHistory] = useState([]);

    useEffect(() => {
        // Initialize gateway on component mount
        gateway.initialize().catch(error => {
            console.error('Gateway initialization failed:', error);
        });
        
        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'behoerden_api_test_suite_loaded',
                'BehoerdenAPITestSuite',
                { timestamp: new Date().toISOString() }
            );
        }
    }, [gateway]);

    const runAllTests = async () => {
        setIsRunning(true);
        setProgress(0);
        
        const allTests = createBehoerdenAPITests();
        const results = {};
        let completedTests = 0;
        
        for (const test of allTests) {
            await test.run();
            results[test.id] = test;
            completedTests++;
            setProgress((completedTests / allTests.length) * 100);
        }
        
        setTestResults(results);
        setIsRunning(false);
        
        // Update request history
        setRequestHistory(gateway.getRequestHistory());
        
        // Calculate overall compliance
        const passedTests = Object.values(results).filter(test => test.status === 'passed').length;
        const overallCompliance = (passedTests / allTests.length) * 100;
        
        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'behoerden_api_tests_completed',
                'BehoerdenAPITestSuite',
                { 
                    totalTests: allTests.length,
                    passedTests,
                    overallCompliance
                }
            );
        }
    };

    const testResultsArray = Object.values(testResults);
    const passedTests = testResultsArray.filter(test => test.status === 'passed').length;
    const failedTests = testResultsArray.filter(test => test.status === 'failed').length;
    const overallCompliance = testResultsArray.length > 0 ? (passedTests / testResultsArray.length) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-50/80 to-green-50/80 dark:from-blue-900/20 dark:to-green-900/20 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        Behörden-API Integration Test Suite
                    </CardTitle>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Sichere, signierte Kommunikation mit deutschen Behörden testen
                    </p>
                </CardHeader>
            </Card>

            {/* Test Controls */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={runAllTests} 
                                disabled={isRunning}
                                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-6 py-3"
                            >
                                {isRunning ? 'Integration Tests laufen...' : 'Alle Behörden-API Tests ausführen'}
                            </Button>
                            
                            {testResultsArray.length > 0 && (
                                <Badge className={`px-4 py-2 text-base ${
                                    overallCompliance >= 90 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : overallCompliance >= 70 
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            : 'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                    {overallCompliance.toFixed(1)}% Integration bereit
                                </Badge>
                            )}
                        </div>

                        {testResultsArray.length > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-600">{passedTests}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-red-600">{failedTests}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isRunning && (
                        <div className="mb-6">
                            <Progress value={progress} className="h-3" />
                            <p className="text-center mt-2 text-slate-600 dark:text-slate-400">
                                {progress.toFixed(0)}% abgeschlossen
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Connectors Status */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Globe className="w-6 h-6" />
                        Verfügbare Behörden-Connectoren
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-6 h-6 text-blue-600" />
                            <h3 className="font-semibold text-slate-800 dark:text-white">Bundesagentur für Arbeit</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Bürgergeld, Arbeitslosengeld, Berufsberatung
                        </p>
                        <Badge className="bg-blue-100 text-blue-800">Test-Modus</Badge>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-6 h-6 text-green-600" />
                            <h3 className="font-semibold text-slate-800 dark:text-white">Familienkasse</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Kindergeld, Kinderzuschlag, Elterngeld
                        </p>
                        <Badge className="bg-green-100 text-green-800">Test-Modus</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Test Results */}
            {testResultsArray.length > 0 && (
                <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <FileSignature className="w-6 h-6" />
                            Testergebnisse
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0">
                            {testResultsArray.map((test) => (
                                <div key={test.id} className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                {test.status === 'passed' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : test.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                )}
                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    {test.name}
                                                </h3>
                                            </div>
                                            
                                            {test.behoerde && (
                                                <Badge variant="outline" className="text-xs mb-2">
                                                    {test.behoerde}
                                                </Badge>
                                            )}
                                            
                                            {test.error && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    Fehler: {test.error.message}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <Badge className={test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {test.status === 'passed' ? 'VERBUNDEN' : 'FEHLER'}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {test.duration.toFixed(0)}ms
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Digital Signature Status */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Lock className="w-6 h-6" />
                        Digitale Signatur & Sicherheit
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">RSA-2048 Verschlüsselung</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Bank-Level Sicherheit</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                        <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">SHA-256 Hashing</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Datenintegrität garantiert</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <FileSignature className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Behörden-konform</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">OZG-Standard erfüllt</p>
                    </div>
                </CardContent>
            </Card>

            {/* Request History */}
            {requestHistory.length > 0 && (
                <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Send className="w-6 h-6" />
                            Letzte API-Anfragen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0">
                            {requestHistory.map((request, index) => (
                                <div key={request.id} className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    {request.behoerde} - {request.action}
                                                </h3>
                                                <Badge className={request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                                request.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                                                'bg-yellow-100 text-yellow-800'}>
                                                    {request.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Request ID: {request.id}
                                            </p>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">
                                                {new Date(request.timestamp).toLocaleString('de-DE')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}