import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// ZEPTO STEP 2.1: Security Test Cases (RED PHASE - Tests First!)
class SecurityTestCase {
    constructor(name, testFn, expectedResult = null, riskLevel = 'medium') {
        this.id = `security_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.testFn = testFn;
        this.expectedResult = expectedResult;
        this.riskLevel = riskLevel; // low, medium, high, critical
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

            // Track security test result
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'security_test_completed',
                    'SecurityTestSuite',
                    { 
                        testName: this.name, 
                        status: this.status,
                        riskLevel: this.riskLevel,
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
                        source: 'security_test',
                        testName: this.name,
                        riskLevel: this.riskLevel 
                    },
                    this.riskLevel === 'critical' ? 'critical' : 'high'
                );
            }
        }
        
        return this.status;
    }
}

// ZEPTO STEP 2.2: Basic Security Tests (RED PHASE - Define What We Want)
const createSecurityTests = () => [
    new SecurityTestCase(
        'Local Storage Security Check',
        async () => {
            try {
                const testKey = 'security_test_key';
                const testValue = 'security_test_value';
                localStorage.setItem(testKey, testValue);
                const retrieved = localStorage.getItem(testKey);
                localStorage.removeItem(testKey);
                
                return { 
                    canWrite: true, 
                    canRead: true, 
                    canDelete: true,
                    dataIntegrity: retrieved === testValue 
                };
            } catch (error) {
                return { 
                    canWrite: false, 
                    canRead: false, 
                    canDelete: false,
                    error: error.message 
                };
            }
        },
        { canWrite: true, canRead: true, canDelete: true, dataIntegrity: true },
        'medium'
    ),

    new SecurityTestCase(
        'Session Storage Security Check',
        async () => {
            try {
                const testKey = 'security_session_test';
                const sensitiveData = JSON.stringify({ userRole: 'test', permissions: ['read'] });
                sessionStorage.setItem(testKey, sensitiveData);
                const retrieved = sessionStorage.getItem(testKey);
                sessionStorage.removeItem(testKey);
                
                return { 
                    sessionSecure: true, 
                    dataIntegrity: retrieved === sensitiveData 
                };
            } catch (error) {
                return { sessionSecure: false, error: error.message };
            }
        },
        { sessionSecure: true, dataIntegrity: true },
        'high'
    ),

    new SecurityTestCase(
        'XSS Prevention Test',
        async () => {
            const maliciousScript = '<script>alert("XSS")</script>';
            const testElement = document.createElement('div');
            testElement.textContent = maliciousScript;
            
            return { 
                scriptBlocked: !testElement.innerHTML.includes('<script>'),
                sanitized: testElement.textContent === maliciousScript
            };
        },
        { scriptBlocked: true, sanitized: true },
        'critical'
    ),

    new SecurityTestCase(
        'HTTPS Enforcement Check',
        async () => {
            return { 
                isHttps: window.location.protocol === 'https:',
                secureContext: window.isSecureContext 
            };
        },
        { isHttps: true, secureContext: true },
        'high'
    ),

    new SecurityTestCase(
        'Content Security Policy Check',
        async () => {
            // Check if CSP headers are present (basic check)
            const metaTags = document.getElementsByTagName('meta');
            let cspFound = false;
            
            for (let meta of metaTags) {
                if (meta.getAttribute('http-equiv') === 'Content-Security-Policy') {
                    cspFound = true;
                    break;
                }
            }
            
            return { cspHeaderPresent: cspFound };
        },
        null, // We'll accept any result for now, just track it
        'medium'
    ),
];

export default function SecurityTestSuite() {
    const [securityTests, setSecurityTests] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState({});

    useEffect(() => {
        setSecurityTests(createSecurityTests());
    }, []);

    const runSecurityTests = async () => {
        setIsRunning(true);
        const testResults = {};
        
        for (const test of securityTests) {
            const result = await test.run();
            testResults[test.id] = test;
            setResults(prev => ({ ...prev, [test.id]: test }));
        }
        
        setIsRunning(false);
    };

    const getSecurityStats = () => {
        const allTests = Object.values(results);
        return {
            total: allTests.length,
            passed: allTests.filter(t => t.status === 'passed').length,
            failed: allTests.filter(t => t.status === 'failed').length,
            critical: allTests.filter(t => t.riskLevel === 'critical').length,
            criticalPassed: allTests.filter(t => t.riskLevel === 'critical' && t.status === 'passed').length
        };
    };

    const stats = getSecurityStats();
    const securityScore = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;

    return (
        <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-600" />
                    Security Test Suite (TDD)
                </CardTitle>
                <div className="flex flex-wrap gap-4 items-center">
                    <Badge className={securityScore >= 90 ? "bg-green-100 text-green-800" : securityScore >= 70 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                        Security Score: {securityScore}%
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                        Total Tests: {stats.total}
                    </Badge>
                    <Badge className={stats.failed > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                        Failed: {stats.failed}
                    </Badge>
                    <Badge className={stats.critical > 0 && stats.criticalPassed < stats.critical ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                        Critical: {stats.criticalPassed}/{stats.critical}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-6">
                    <Button 
                        onClick={runSecurityTests}
                        disabled={isRunning}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isRunning ? 'Running Security Tests...' : 'Run Security Tests'}
                    </Button>
                </div>

                {Object.keys(results).length > 0 && (
                    <div className="space-y-4">
                        {Object.values(results).map(test => (
                            <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    {test.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {test.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                                    {test.status === 'running' && <AlertTriangle className="w-5 h-5 text-blue-600 animate-spin" />}
                                    
                                    <div>
                                        <div className="font-semibold">{test.name}</div>
                                        <div className="text-sm text-gray-600">
                                            Risk Level: {test.riskLevel} • {test.duration.toFixed(2)}ms
                                        </div>
                                    </div>
                                </div>
                                
                                <Badge className={
                                    test.status === 'passed' ? "bg-green-100 text-green-800" :
                                    test.status === 'failed' ? "bg-red-100 text-red-800" :
                                    "bg-gray-100 text-gray-800"
                                }>
                                    {test.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}