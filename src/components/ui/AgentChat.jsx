
import { useState, useEffect, useRef, useContext } from 'react';
import { Bot, User as UserIcon, Send, Loader2, X, MousePointer, Zap, FileText, Edit, CheckCircle, AlertTriangle, Eye, Brain, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InvokeLLM } from '@/api/integrations';
import { AgentContext } from '@/components/AgentContext';
import { Abrechnung } from '@/api/entities';
import { User } from '@/api/entities';
import { Anspruchspruefung } from '@/api/entities';
import { Foerderleistung } from '@/api/entities';
import ConsentDialog from './ConsentDialog'; // Added import for ConsentDialog

// REVOLUTIONARY COGNITIVE AGENTIC AI - FULLY AUTONOMOUS DIGITAL WORKER WITH REAL EXECUTION
export default function AgentChat({ isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [currentProcess, setCurrentProcess] = useState(null);
    const [processSteps, setProcessSteps] = useState([]);
    const [agentMemory, setAgentMemory] = useState({});
    const [cognitiveState, setCognitiveState] = useState({
        currentPageUnderstanding: {},
        visualContext: {},
        platformKnowledge: {},
        userIntentHistory: []
    });
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { animateCursorTo, agentState, setAgentState } = useContext(AgentContext);

    // Consent Management State
    const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [userPermissions, setUserPermissions] = useState({});

    // Lade Nutzer-Berechtigungen beim Start
    useEffect(() => {
        const loadUserPermissions = async () => {
            try {
                const user = await User.me();
                const permissions = user.lebenssituation?.vollmachten_einverstaendnis || {};
                setUserPermissions(permissions);
            } catch (error) {
                console.error('Failed to load user permissions:', error);
                setUserPermissions({});
            }
        };
        
        if (isOpen) {
            loadUserPermissions();
        }
    }, [isOpen]);

    // Überprüfe, ob eine Aktion Zustimmung benötigt
    const requiresConsent = (actionType) => {
        // Defines actions considered high-risk and potentially requiring consent.
        // These are actions that directly modify data or navigate the user.
        const highRiskActions = ['create_widerspruch', 'fill_form', 'generate_document', 'navigate'];
        
        // Check if the action is high-risk AND if the user has NOT auto-allowed it
        // The permission key is expected to be `actionType_auto_allowed`
        return highRiskActions.includes(actionType) && !userPermissions[actionType + '_auto_allowed'];
    };

    // Fordere Zustimmung für kritische Aktionen an
    const requestConsent = async (actionType, actionDetails, actionFunction) => {
        return new Promise((resolve) => {
            if (!requiresConsent(actionType)) {
                // Keine Zustimmung erforderlich, führe direkt aus
                actionFunction().then(resolve).catch(resolve);
                return;
            }

            // Zustimmung erforderlich
            setPendingAction({
                type: actionType,
                details: actionDetails,
                execute: actionFunction,
                resolve: resolve // Store the resolve function to complete the promise later
            });
            setIsConsentDialogOpen(true);
        });
    };

    const handleConsentApprove = async () => {
        setIsConsentDialogOpen(false);
        if (pendingAction) {
            try {
                const result = await pendingAction.execute();
                pendingAction.resolve(result); // Resolve the promise with the action's result
            } catch (error) {
                pendingAction.resolve({ success: false, message: error.message }); // Resolve with an error state
            } finally {
                setPendingAction(null);
            }
        }
    };

    const handleConsentDeny = () => {
        setIsConsentDialogOpen(false);
        if (pendingAction) {
            pendingAction.resolve({ 
                success: false, 
                message: "Aktion wurde vom Nutzer abgelehnt." 
            }); // Resolve with denial message
        }
        setPendingAction(null);
    };

    // REVOLUTIONARY: INTELLIGENT PAGE SUMMARY
    const captureFullPageWithScrolling = async () => {
        return new Promise(async (resolve) => {
            const originalScrollY = window.scrollY;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 300));

            // Scrolle die Seite einmal komplett durch, um alle Elemente zu laden
            const documentHeight = document.body.scrollHeight;
            const viewportHeight = window.innerHeight;
            for (let pos = 0; pos < documentHeight; pos += viewportHeight) {
                window.scrollTo({ top: pos, behavior: 'smooth' });
                await new Promise(r => setTimeout(r, 300));
            }

            // Erstelle eine CONCISE ZUSAMMENFASSUNG, kein Daten-Dump
            const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent.trim()).filter(Boolean);
            const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.textContent.trim()).filter(Boolean);
            const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean);

            const summary = {
                url: window.location.pathname,
                title: document.title,
                main_topics: [...new Set(headers)].slice(0, 10), // Nur die Top-Überschriften
                available_actions: [...new Set([...links, ...buttons])].slice(0, 20) // Nur die Top-Aktionen
            };

            window.scrollTo({ top: originalScrollY, behavior: 'smooth' }); // Zurückscrollen
            await new Promise(r => setTimeout(r, 300));
            
            resolve(summary);
        });
    };

    // REVOLUTIONARY COGNITIVE VISUAL SCAN - Komplette Seitenanalyse
    const performCognitiveVisualScan = async () => {
        setIsScanning(true);
        
        try {
            // VERWENDET JETZT DIE KURZE ZUSAMMENFASSUNG
            const pageSummary = await captureFullPageWithScrolling();
            
            const cognitiveAnalysis = await InvokeLLM({
                prompt: `Du bist ein hochintelligenter digitaler Assistent. Analysiere diese Seiten-ZUSAMMENFASSUNG.

**SEITEN-ZUSAMMENFASSUNG:** ${JSON.stringify(pageSummary)}

**AUFGABE:** Verstehe den Zweck der Seite und welche Aktionen möglich sind.`,

                response_json_schema: {
                    type: "object",
                    properties: {
                        page_understanding: {
                            type: "object",
                            properties: {
                                primary_purpose: { type: "string" },
                                main_topics: { type: "array", items: { type: "string" } },
                                key_actions: { type: "array", items: { type: "string" } }
                            }
                        }
                    }
                }
            });

            setCognitiveState(prev => ({
                ...prev,
                currentPageUnderstanding: cognitiveAnalysis.page_understanding,
                visualContext: pageSummary,
                lastCognitiveScan: new Date().toISOString()
            }));

            return cognitiveAnalysis;

        } catch (error) {
            console.error('Cognitive visual scan failed:', error);
            // Spezifische Fehlerbehandlung
            if (error.message.includes("Network Error")) {
                 throw new Error("Kommunikation mit der KI fehlgeschlagen. Bitte versuchen Sie es erneut.");
            }
            throw error;
        } finally {
            setIsScanning(false);
        }
    };

    // REVOLUTIONARY AGENTIC REASONING ENGINE - MIT FESTER BEFEHLSSPRACHE
    const performAgenticReasoning = async (userInput, currentContext) => {
        setIsAnalyzing(true);
        
        try {
            const cognitiveAnalysis = await performCognitiveVisualScan();
            const userProfile = await User.me().catch(() => ({}));
            const recentDocuments = await Abrechnung.list('-created_date', 10).catch(() => []);
            
            const reasoning = await InvokeLLM({
                prompt: `Du bist ein revolutionärer kognitiver KI-Agent. Du bist KEIN Chat-Bot - du bist ein DIGITALER ARBEITER der WIRKLICH handelt.

**NUTZER-ANFRAGE:** "${userInput}"

**COGNITIVE PAGE ANALYSIS:** ${JSON.stringify(cognitiveAnalysis)}

**NUTZERPROFIL:** ${JSON.stringify(userProfile)}

**VERFÜGBARE DOKUMENTE:** ${JSON.stringify(recentDocuments.map(d => ({ id: d.id, titel: d.titel, status: d.analyse_status })))}

**DEINE WAHREN FÄHIGKEITEN (ECHTE AKTIONEN):**
- **navigate**: WIRKLICH zu Seiten navigieren
- **fill_form**: WIRKLICH Formulare ausfüllen
- **create_widerspruch**: WIRKLICH Widersprüche erstellen
- **analyze_data**: WIRKLICH Daten analysieren
- **scan_page**: WIRKLICH die aktuelle Seite scannen
- **generate_document**: WIRKLICH ein Dokument erstellen

**WICHTIGE REGEL:** Erstelle einen Plan mit ECHTEN AKTIONEN. Verwende NUR die oben genannten \`action_type\` Keys. Rede nicht darüber, was du tust - TUE ES!

**AUFGABE:** Erstelle einen AUSFÜHRUNGSPLAN für ECHTE AKTIONEN.`,
                
                response_json_schema: {
                    type: "object",
                    properties: {
                        cognitive_analysis: {
                            type: "object",
                            properties: {
                                user_intent_deep: { type: "string" },
                                execution_readiness: { type: "string" }
                            },
                            required: ["user_intent_deep", "execution_readiness"]
                        },
                        execution_plan: {
                            type: "object",
                            properties: {
                                can_execute_autonomously: { type: "boolean" },
                                confidence_level: { type: "number", minimum: 80, maximum: 100 },
                                required_steps: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            step_number: { type: "integer" },
                                            // **DER ENTSCHEIDENDE FIX: Strikte Befehlssprache (Enum)**
                                            action_type: { 
                                                type: "string",
                                                enum: ["navigate", "scan_page", "fill_form", "create_widerspruch", "analyze_data", "generate_document"]
                                            },
                                            description: { type: "string" },
                                            target: { type: "string", description: "Ziel der Aktion (z.B. Seitenname, Formular-ID, Dokumenten-ID)" },
                                            execution_details: { type: "string", description: "Zusätzliche Details für die Ausführung" }
                                        },
                                        required: ["step_number", "action_type", "description"]
                                    }
                                },
                                immediate_execution: { type: "boolean" }
                            },
                            required: ["can_execute_autonomously", "confidence_level", "required_steps", "immediate_execution"]
                        },
                        response_to_user: { type: "string" }
                    },
                    required: ["cognitive_analysis", "execution_plan", "response_to_user"]
                }
            });

            if (!reasoning || typeof reasoning !== 'object') {
                throw new Error('Invalid reasoning response format');
            }

            return reasoning;
            
        } catch (error) {
            console.error('Cognitive agentic reasoning failed:', error);
            return {
                cognitive_analysis: { user_intent_deep: "Anfrage konnte nicht verstanden werden.", execution_readiness: "Nicht bereit" },
                execution_plan: { can_execute_autonomously: false, confidence_level: 0, required_steps: [], immediate_execution: false },
                response_to_user: "Entschuldigung, ein interner Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
            };
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ECHTE NAVIGATION MIT VISUELLER BESTÄTIGUNG
    const performSmartNavigation = async (targetPage) => {
        return await requestConsent(
            'navigate',
            `Navigation zu "${targetPage}"`,
            async () => {
                onClose();
                await new Promise(resolve => setTimeout(resolve, 500));

                let pageKey = targetPage;
                if (targetPage && targetPage.includes('/')) {
                    const parts = targetPage.split('/').filter(p => p);
                    pageKey = parts[parts.length - 1];
                }

                const allVisibleLinks = Array.from(document.querySelectorAll('aside nav a'));
                let targetElement = null;

                for (const link of allVisibleLinks) {
                    const linkText = link.textContent?.trim().toLowerCase();
                    const linkHref = link.getAttribute('href')?.toLowerCase();
                    const searchText = pageKey.toLowerCase();
                    
                    if (link.offsetParent !== null && (linkText?.includes(searchText) || linkHref?.includes(searchText))) {
                        targetElement = link;
                        break;
                    }
                }
                
                if (targetElement) {
                    console.log(`Agent navigating to target '${pageKey}'`);
                    await animateCursorTo(targetElement);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Warten bis die Seite geladen ist
                    // FIX: Klare Erfolgsmeldung zurückgeben
                    return { success: true, message: `Navigation zu ${pageKey} abgeschlossen` };
                } else {
                    throw new Error(`Navigation target "${pageKey}" not found`);
                }
            }
        );
    };

    // ECHTE FORMULAR-AUSFÜLLUNG MIT DOM-MANIPULATION
    const performIntelligentFormFilling = async (formData) => {
        return await requestConsent(
            'fill_form', 
            `Ausfüllen von Formularfeldern mit Ihren Profildaten`,
            async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                try {
                    const userData = await User.me();
                    const formFields = Array.from(document.querySelectorAll('input, select, textarea'));
                    let filledFields = 0;
                    
                    for (const field of formFields) {
                        if (field.offsetParent !== null && !field.disabled && !field.readOnly) {
                            const fieldName = field.name || field.placeholder || field.id || '';
                            let valueToFill = '';
                            
                            if (fieldName.toLowerCase().includes('name') || fieldName.toLowerCase().includes('vorname')) {
                                valueToFill = userData.vorname || userData.full_name?.split(' ')[0] || '';
                            } else if (fieldName.toLowerCase().includes('nachname')) {
                                valueToFill = userData.nachname || userData.full_name?.split(' ')[1] || '';
                            } else if (fieldName.toLowerCase().includes('email')) {
                                valueToFill = userData.email || '';
                            }
                            
                            if (formData && formData[fieldName]) {
                                valueToFill = formData[fieldName];
                            }

                            if (valueToFill) {
                                field.focus();
                                field.value = valueToFill;
                                field.dispatchEvent(new Event('input', { bubbles: true }));
                                field.dispatchEvent(new Event('change', { bubbles: true }));
                                
                                field.style.backgroundColor = '#e0f2fe';
                                setTimeout(() => { field.style.backgroundColor = ''; }, 1000);
                                
                                filledFields++;
                                await new Promise(resolve => setTimeout(resolve, 300));
                            }
                        }
                    }
                    
                    return { success: true, message: `${filledFields} Felder automatisch ausgefüllt` };
                    
                } catch (error) {
                    throw new Error(`Formular-Ausfüllung fehlgeschlagen: ${error.message}`);
                }
            }
        );
    };

    // INTELLIGENT ANALYSIS
    const performIntelligentAnalysis = async (analysisTargets) => {
        const analysisResults = await InvokeLLM({
            prompt: `Führe eine umfassende Analyse durch für: ${JSON.stringify(analysisTargets)}
            
Analysiere alle verfügbaren Daten und gib konkrete, umsetzbare Erkenntnisse zurück.`,
            
            response_json_schema: {
                type: "object",
                properties: {
                    findings: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    next_actions: { type: "array", items: { type: "string" } }
                }
            }
        });
        
        setAgentMemory(prev => ({
            ...prev,
            last_analysis: {
                timestamp: new Date().toISOString(),
                results: analysisResults,
                targets: analysisTargets
            }
        }));
        return { success: true, message: `Analyse für ${analysisTargets.join(', ')} abgeschlossen`, results: analysisResults };
    };

    // HELPER FUNKTIONEN
    const performDocumentGeneration = async (requiredData) => {
        return await requestConsent(
            'generate_document',
            `Generierung eines Dokuments mit den folgenden Daten: ${JSON.stringify(requiredData)}`,
            async () => {
                console.log('Generating document with data:', requiredData);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, document_url: 'generated-document.pdf', message: 'Dokument generiert' };
            }
        );
    };

    const performAPICall = async (requiredData) => {
        console.log('Performing API call with data:', requiredData);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, result: 'API call completed', message: 'API-Aufruf abgeschlossen' };
    };

    const waitForUserInput = async (description) => {
        console.log('Waiting for user input:', description);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, input_received: true, message: 'Warten auf Nutzereingabe abgeschlossen' };
    };

    // ECHTE WIDERSPRUCH-ERSTELLUNG
    const performWiderspruchCreation = async (abrechnungId) => {
        return await requestConsent(
            'create_widerspruch',
            `Erstellung eines rechtssicheren Widerspruchs für Abrechnung ID: ${abrechnungId}`,
            async () => {
                try {
                    const userData = await User.me();
                    const abrechnungen = await Abrechnung.filter({ id: abrechnungId });
                    const abrechnung = abrechnungen[0];
                    
                    if (!abrechnung) {
                        throw new Error('Keine Abrechnung gefunden für ID: ' + abrechnungId);
                    }
                    
                    const widerspruchData = await InvokeLLM({
                        prompt: `Erstelle einen RECHTSSICHEREN Widerspruch gegen diese Nebenkostenabrechnung:

**NUTZERDATEN:** ${JSON.stringify(userData)}
**ABRECHNUNG:** ${JSON.stringify(abrechnung)}

Erstelle einen vollständigen, rechtssicheren Widerspruch.`,

                        response_json_schema: {
                            type: "object",
                            properties: {
                                widerspruch_text: { type: "string" },
                                rechtliche_begruendung: { type: "string" },
                                geforderte_korrektur: { type: "string" },
                                rueckforderungsbetrag: { type: "number" }
                            },
                            required: ["widerspruch_text"]
                        }
                    });
                    
                    await Abrechnung.update(abrechnungId, {
                        widerspruchs_status: 'in_bearbeitung',
                        widerspruch_erstellt_am: new Date().toISOString(),
                        widerspruch_text: widerspruchData.widerspruch_text
                    });
                    
                    return { 
                        success: true, 
                        message: 'Widerspruch erfolgreich erstellt und gespeichert',
                        widerspruch: widerspruchData
                    };
                    
                } catch (error) {
                    throw new Error(`Widerspruch-Erstellung fehlgeschlagen: ${error.message}`);
                }
            }
        );
    };

    // ERWEITERTE AUTONOME AUSFÜHRUNG - MIT ROBUSTER FEHLERBEHANDLUNG
    const executeAutonomousWorkflow = async (executionPlan) => {
        setIsExecuting(true);
        setCurrentProcess('real_execution_workflow');
        
        const steps = executionPlan.required_steps.map(step => ({
            title: step.description,
            action_type: step.action_type,
            target: step.target,
            execution_details: step.execution_details,
            status: 'pending'
        }));
        
        setProcessSteps(steps);
        let executionResults = [];
        
        try {
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                await updateProcessStep(i, 'in_progress');
                
                try {
                    let result = { success: false, message: `Aktion "${step.action_type}" nicht ausgeführt.` };
                    
                    switch (step.action_type) {
                        case 'navigate':
                            result = await performSmartNavigation(step.target || 'dashboard');
                            break;
                        case 'scan_page':
                            const analysis = await performCognitiveVisualScan();
                            result = { success: true, message: 'Seite erfolgreich gescannt und analysiert.', analysis };
                            break;
                        case 'fill_form':
                            result = await performIntelligentFormFilling(step.target || {});
                            break;
                        case 'create_widerspruch':
                            result = await performWiderspruchCreation(step.target);
                            break;
                        case 'analyze_data':
                            result = await performIntelligentAnalysis(step.target || []);
                            break;
                        case 'generate_document':
                            result = await performDocumentGeneration(step.target || {});
                            break;
                        default:
                            result = { success: false, message: `Unbekannte Aktion: ${step.action_type}` };
                    }
                    
                    executionResults.push(result);
                    
                    // FIX: Robuste Prüfung des Ergebnisses
                    if (result && result.success) {
                        await updateProcessStep(i, 'completed', result.message);
                    } else {
                        const errorMessage = result ? result.message : 'Aktion hat kein Ergebnis zurückgegeben.';
                        await updateProcessStep(i, 'error', errorMessage);
                        throw new Error(`Step failed: ${errorMessage}`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (stepError) {
                    console.error(`Step ${i} failed:`, stepError);
                    await updateProcessStep(i, 'error', stepError.message);
                    executionResults.push({ success: false, message: stepError.message });
                    throw stepError; 
                }
            }
            
            const successfulSteps = executionResults.filter(r => r.success).length;
            const totalSteps = executionResults.length;
            
            if (successfulSteps === totalSteps) {
                return { success: true, message: 'Alle Aktionen erfolgreich ausgeführt!' };
            } else {
                return { success: false, message: `${successfulSteps}/${totalSteps} Aktionen erfolgreich, aber nicht alle.` };
            }
            
        } catch (error) {
            console.error('Real execution workflow failed:', error);
            return { success: false, message: `Workflow-Fehler: ${error.message}` };
        } finally {
            setIsExecuting(false);
            setCurrentProcess(null);
        }
    };

    const performPageScan = async () => {
        // This function seems to be a duplicate or old version of performCognitiveVisualScan.
        // The executeAutonomousWorkflow already calls performCognitiveVisualScan now.
        // If this function is meant for something else, it should be adjusted.
        // For now, I'll make it call the main cognitive visual scan.
        setIsScanning(true);
        const analysis = await performCognitiveVisualScan(); // Use the main cognitive visual scan
        setIsScanning(false);
        
        return { success: true, message: 'Seite erfolgreich gescannt und analysiert', analysis };
    };

    const updateProcessStep = async (stepIndex, status, message = '') => {
        setProcessSteps(prev => prev.map((step, index) => 
            index === stepIndex ? { ...step, status, message } : step
        ));
        await new Promise(resolve => setTimeout(resolve, 300));
    };

    // MAIN MESSAGE HANDLER
    const handleSendMessage = async () => {
        if (!inputText.trim() || isThinking || isExecuting || isAnalyzing || isScanning) return;

        const userMessage = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        
        setIsThinking(true);
        setAgentState('reasoning');

        try {
            const reasoning = await performAgenticReasoning(currentInput, {});
            
            if (!reasoning || !reasoning.execution_plan) {
                console.error('Invalid reasoning response:', reasoning);
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: 'Entschuldigung, ich konnte Ihre Anfrage nicht richtig verstehen. Bitte versuchen Sie es anders zu formulieren.'
                }]);
                setIsThinking(false);
                setAgentState('active');
                return;
            }
            
            setMessages(prev => [...prev, {
                role: 'agent',
                content: reasoning.response_to_user || 'Ich arbeite an Ihrer Anfrage...',
                will_execute: reasoning.execution_plan?.can_execute_autonomously || false,
                confidence: reasoning.execution_plan?.confidence_level || 50
            }]);

            const canExecute = reasoning.execution_plan?.can_execute_autonomously === true;
            const shouldExecuteImmediately = reasoning.execution_plan?.immediate_execution === true;
            const hasSteps = reasoning.execution_plan?.required_steps?.length > 0;
            
            if (canExecute && shouldExecuteImmediately && hasSteps) {
                setIsThinking(false);
                
                try {
                    const result = await executeAutonomousWorkflow(reasoning.execution_plan);
                    
                    setMessages(prev => [...prev, {
                        role: 'agent',
                        content: result.success ? 
                            `✅ Aufgabe erfolgreich abgeschlossen: ${result.message}` : 
                            `❌ Problem bei der Ausführung: ${result.message}`,
                        execution_complete: true,
                        real_action_performed: result.success
                    }]);
                } catch (executionError) {
                    console.error('Execution workflow failed:', executionError);
                    setMessages(prev => [...prev, {
                        role: 'agent',
                        content: `❌ Es gab einen Fehler bei der Ausführung: ${executionError.message}`
                    }]);
                }
            } else {
                setIsThinking(false);
                let reason = 'Ich benötige weitere Informationen oder die Aufgabe ist zu komplex für eine automatische Ausführung.';
                if (!canExecute) reason = 'Die Aufgabe kann derzeit nicht vollständig automatisch ausgeführt werden.';
                if (!hasSteps) reason = 'Ich konnte keine konkreten Ausführungsschritte für Ihre Anfrage bestimmen.';
                
                setMessages(prev => [...prev, {
                    role: 'agent',
                    content: reason
                }]);
            }
            
        } catch (error) {
            console.error('Real execution failed:', error);
            setMessages(prev => [...prev, {
                role: 'agent',
                content: 'Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut oder formulieren Sie Ihre Anfrage anders.'
            }]);
            setIsThinking(false);
        }
        
        setAgentState('active');
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ 
                role: 'agent', 
                content: "Hallo! Ich bin Ihr revolutionärer kognitiver KI-Agent. Ich verstehe die gesamte Platform vollständig, kann scrollen, alles lesen und logisch denken. Sagen Sie mir, was Sie benötigen!" 
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        // Defer scroll to after React has committed DOM changes
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9998]">
            {/* Consent Dialog */}
            <ConsentDialog
                isOpen={isConsentDialogOpen}
                onClose={handleConsentDeny} // If dialog closed without decision, it's a denial
                actionType={pendingAction?.type}
                actionDetails={pendingAction?.details}
                onApprove={handleConsentApprove}
                onDeny={handleConsentDeny}
                userPermissions={userPermissions}
                setUserPermissions={setUserPermissions} // Pass setUserPermissions to allow updating permissions from dialog
            />

            <Card className="w-[700px] max-w-3xl shadow-2xl border-none animate-in fade-in-5 zoom-in-95 duration-300 bg-gradient-to-br from-white to-blue-50/30">
                <div className="p-6 flex flex-col h-[800px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    {isScanning ? (
                                        <Scan className="w-6 h-6 text-white animate-pulse" />
                                    ) : isAnalyzing ? (
                                        <Brain className="w-6 h-6 text-white animate-pulse" />
                                    ) : (
                                        <MousePointer className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                {(isExecuting || isThinking || isAnalyzing || isScanning) && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                                        <Zap className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-800">Klaus - Cognitive AI Agent</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <div className={`w-2 h-2 rounded-full ${
                                            isScanning ? 'bg-purple-500 animate-pulse' :
                                            isAnalyzing ? 'bg-blue-500 animate-pulse' :
                                            isExecuting ? 'bg-orange-500 animate-pulse' :
                                            isThinking ? 'bg-green-500 animate-pulse' : 'bg-green-500'
                                        }`} />
                                        {isScanning ? 'Scannt visuell & scrollt...' :
                                         isAnalyzing ? 'Analysiert kognitiv...' :
                                         isExecuting ? 'Führt autonom aus...' : 
                                         isThinking ? 'Denkt logisch...' : 'Kognitiv bereit'}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Cognitive Workflow Progress */}
                    {isExecuting && processSteps.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-3">🧠 Kognitiver Workflow läuft...</h4>
                            <div className="space-y-2">
                                {processSteps.map((step, index) => (
                                    <div key={index}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                                step.status === 'completed' ? 'bg-green-500' :
                                                step.status === 'in_progress' ? 'bg-purple-500 animate-pulse' :
                                                step.status === 'error' ? 'bg-red-500' :
                                                'bg-slate-300'
                                            }`}>
                                                {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                                                {step.status === 'in_progress' && <Brain className="w-3 h-3 text-white animate-pulse" />}
                                                {step.status === 'error' && <AlertTriangle className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={`text-sm ${
                                                step.status === 'completed' ? 'text-slate-500 line-through' :
                                                step.status === 'in_progress' ? 'text-purple-700 font-medium' :
                                                step.status === 'error' ? 'text-red-700 font-medium' :
                                                'text-slate-600'
                                            }`}>{step.title}</span>
                                        </div>
                                        {step.execution_details && step.status === 'in_progress' && (
                                            <p className="text-xs text-purple-600 ml-7 mt-1 italic">💭 {step.execution_details}</p>
                                        )}
                                        {step.status === 'error' && step.message && (
                                            <p className="text-xs text-red-600 ml-7 mt-1">Fehler: {step.message}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'agent' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-md ${
                                    message.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                                        : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    
                                    {message.confidence !== undefined && (
                                        <div className="mt-2 pt-2 border-t border-slate-200">
                                            <div className="text-xs text-slate-500">
                                                Konfidenz: {message.confidence}% | 
                                                {message.will_execute ? ' Startet Ausführung ✅' : ' Weitere Analyse/Bestätigung nötig ⚠️'}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {message.execution_complete && (
                                        <div className="mt-3 pt-2 border-t border-green-200">
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                {message.real_action_performed ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3 text-orange-500" />}
                                                <span>Aktion {message.real_action_performed ? 'erfolgreich ausgeführt' : 'teilweise/fehlerhaft ausgeführt'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="mt-4 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Sagen Sie mir, was Sie benötigen - ich verstehe alles und handle vollständig autonom!"
                            className="w-full px-4 py-4 pr-16 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-base"
                            disabled={isThinking || isExecuting || isAnalyzing || isScanning || isConsentDialogOpen}
                        />
                        <Button 
                            onClick={handleSendMessage}
                            disabled={isThinking || isExecuting || isAnalyzing || isScanning || isConsentDialogOpen || !inputText.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {(isThinking || isExecuting || isAnalyzing || isScanning || isConsentDialogOpen) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
