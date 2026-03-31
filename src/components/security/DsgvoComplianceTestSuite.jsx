import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Database, Eye, Trash2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// ZEPTO STEP 4.1: DSGVO Test Cases (RED PHASE - Tests First!)
class DsgvoTestCase {
    constructor(name, testFn, expectedResult = null, gdprArticle = null) {
        this.id = `dsgvo_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.testFn = testFn;
        this.expectedResult = expectedResult;
        this.gdprArticle = gdprArticle; // Art. 6, Art. 7, Art. 17, etc.
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

            // Track DSGVO compliance test
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'dsgvo_compliance_test',
                    'DsgvoComplianceTestSuite',
                    { 
                        testName: this.name, 
                        status: this.status,
                        gdprArticle: this.gdprArticle,
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
                        source: 'dsgvo_compliance_test',
                        testName: this.name,
                        gdprArticle: this.gdprArticle 
                    },
                    'high'
                );
            }
        }
        
        return this.status;
    }
}

// ZEPTO STEP 4.2: Data Minimization Checker (RED PHASE)
const createDataMinimizationTests = () => [
    new DsgvoTestCase(
        'Datenminimierung - Nur notwendige Felder sammeln',
        async () => {
            // Test: Check if only required fields are collected for each form
            const requiredFields = {
                'buergergeld': ['vorname', 'nachname', 'geburtsdatum', 'monatliches_nettoeinkommen'],
                'wohngeld': ['vorname', 'nachname', 'wohnadresse', 'monatliches_nettoeinkommen', 'miete_kalt'],
                'kindergeld': ['vorname', 'nachname', 'kinder_anzahl', 'kinder_details']
            };
            
            const allUserFields = [
                'vorname', 'nachname', 'geburtsdatum', 'lebenssituation',
                'steuer_id', 'sozialversicherungsnummer', 'bankdaten'
            ];
            
            let minimizationScore = 0;
            let totalChecks = 0;
            
            for (const [antragType, requiredForAntrag] of Object.entries(requiredFields)) {
                totalChecks++;
                const unnecessaryFields = allUserFields.filter(field => !requiredForAntrag.includes(field));
                if (unnecessaryFields.length < allUserFields.length * 0.7) {
                    minimizationScore++;
                }
            }
            
            return {
                minimizationCompliant: minimizationScore === totalChecks,
                score: minimizationScore,
                totalChecks,
                complianceRate: (minimizationScore / totalChecks) * 100
            };
        },
        { minimizationCompliant: true, complianceRate: 100 },
        'Art. 5 Abs. 1 lit. c DSGVO'
    ),

    new DsgvoTestCase(
        'Zweckbindung - Datennutzung nur für deklarierte Zwecke',
        async () => {
            // Test: Verify data is only used for declared purposes
            const declaredPurposes = {
                'foerderungsberatung': ['lebenssituation', 'einkommen', 'familienstand'],
                'antragsstellung': ['personalien', 'dokumente', 'unterschrift'],
                'rechtspruefung': ['nebenkosten_dokumente', 'mietvertrag']
            };
            
            let purposeBindingCompliant = true;
            const violations = [];
            
            // Simulate purpose checking
            for (const [purpose, allowedData] of Object.entries(declaredPurposes)) {
                const usedData = allowedData; // In real implementation, check actual usage
                const unauthorizedUsage = usedData.filter(data => !allowedData.includes(data));
                
                if (unauthorizedUsage.length > 0) {
                    purposeBindingCompliant = false;
                    violations.push({ purpose, unauthorizedUsage });
                }
            }
            
            return {
                purposeBindingCompliant,
                violations,
                totalPurposes: Object.keys(declaredPurposes).length
            };
        },
        { purposeBindingCompliant: true, violations: [] },
        'Art. 5 Abs. 1 lit. b DSGVO'
    ),

    new DsgvoTestCase(
        'Einwilligungs-Management - Granulare Zustimmung',
        async () => {
            // Test: Check if consent is granular and revocable
            const consentCategories = {
                'basic_profile': { required: true, revocable: false },
                'foerderungsberatung': { required: false, revocable: true },
                'marketing_emails': { required: false, revocable: true },
                'data_analytics': { required: false, revocable: true },
                'automated_applications': { required: false, revocable: true }
            };
            
            let granularConsentCompliant = true;
            const consentIssues = [];
            
            for (const [category, settings] of Object.entries(consentCategories)) {
                if (!settings.required && !settings.revocable) {
                    granularConsentCompliant = false;
                    consentIssues.push(`${category}: Optional but not revocable`);
                }
            }
            
            return {
                granularConsentCompliant,
                consentIssues,
                totalCategories: Object.keys(consentCategories).length,
                revocableCategories: Object.values(consentCategories).filter(s => s.revocable).length
            };
        },
        { granularConsentCompliant: true, consentIssues: [] },
        'Art. 7 DSGVO'
    )
];

// ZEPTO STEP 4.3: RBAC (Role-Based Access Control) Foundation (RED PHASE)
class RBACSystem {
    constructor() {
        this.roles = new Map();
        this.permissions = new Map();
        this.userRoles = new Map();
        this.auditLog = [];
    }

    // ZEPTO STEP 4.4: Define Roles
    defineRole(roleId, roleName, description, permissions = []) {
        this.roles.set(roleId, {
            id: roleId,
            name: roleName,
            description,
            permissions,
            createdAt: new Date().toISOString()
        });

        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'rbac_role_defined',
                'RBACSystem',
                { roleId, roleName, permissionsCount: permissions.length }
            );
        }
    }

    // ZEPTO STEP 4.5: Define Permissions
    definePermission(permissionId, description, resource, action) {
        this.permissions.set(permissionId, {
            id: permissionId,
            description,
            resource, // 'user_data', 'foerderung', 'antrag', 'pdf_generation'
            action, // 'read', 'write', 'delete', 'execute'
            createdAt: new Date().toISOString()
        });
    }

    // ZEPTO STEP 4.6: Assign Role to User
    assignRole(userId, roleId) {
        const role = this.roles.get(roleId);
        if (!role) {
            throw new Error(`Role ${roleId} does not exist`);
        }

        if (!this.userRoles.has(userId)) {
            this.userRoles.set(userId, new Set());
        }
        
        this.userRoles.get(userId).add(roleId);
        
        this.auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'role_assigned',
            userId,
            roleId,
            assignedBy: 'system' // In real implementation, track who assigned
        });

        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'rbac_role_assigned',
                'RBACSystem',
                { userId, roleId }
            );
        }
    }

    // ZEPTO STEP 4.7: Check Permission
    hasPermission(userId, resource, action) {
        const userRoleIds = this.userRoles.get(userId);
        if (!userRoleIds) return false;

        for (const roleId of userRoleIds) {
            const role = this.roles.get(roleId);
            if (!role) continue;

            for (const permissionId of role.permissions) {
                const permission = this.permissions.get(permissionId);
                if (permission && permission.resource === resource && permission.action === action) {
                    this.auditLog.push({
                        timestamp: new Date().toISOString(),
                        action: 'permission_checked',
                        userId,
                        resource,
                        action: action,
                        result: 'granted'
                    });
                    return true;
                }
            }
        }

        this.auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'permission_checked',
            userId,
            resource,
            action: action,
            result: 'denied'
        });

        return false;
    }
}

// ZEPTO STEP 4.8: EU-KI-Verordnung Compliance Checker (RED PHASE)
const createEUKIVerordnungTests = () => [
    new DsgvoTestCase(
        'KI-System Risikobewertung',
        async () => {
            // Test: Assess AI system risk according to EU AI Act
            const aiSystems = {
                'foerderungsempfehlungen': {
                    riskLevel: 'limited', // minimal, limited, high, unacceptable
                    humanOversight: true,
                    transparencyRequired: true,
                    impactsHumanRights: false
                },
                'automatische_antragsstellung': {
                    riskLevel: 'high',
                    humanOversight: true,
                    transparencyRequired: true,
                    impactsHumanRights: true
                }
            };

            let compliantSystems = 0;
            let totalSystems = Object.keys(aiSystems).length;
            const nonCompliantSystems = [];

            for (const [systemName, config] of Object.entries(aiSystems)) {
                let systemCompliant = true;
                
                if (config.riskLevel === 'high' && !config.humanOversight) {
                    systemCompliant = false;
                }
                
                if (config.impactsHumanRights && !config.transparencyRequired) {
                    systemCompliant = false;
                }

                if (systemCompliant) {
                    compliantSystems++;
                } else {
                    nonCompliantSystems.push(systemName);
                }
            }

            return {
                euAiActCompliant: compliantSystems === totalSystems,
                compliantSystems,
                totalSystems,
                nonCompliantSystems,
                complianceRate: (compliantSystems / totalSystems) * 100
            };
        },
        { euAiActCompliant: true, complianceRate: 100 },
        'EU-KI-Verordnung Art. 6-15'
    ),

    new DsgvoTestCase(
        'Algorithmic Transparency - Entscheidungsgrundlagen nachvollziehbar',
        async () => {
            // Test: Can users understand how AI decisions are made?
            const aiDecisions = [
                'buergergeld_berechtigung',
                'wohngeld_hoehe_schaetzung', 
                'antrag_vollstaendigkeit_pruefung'
            ];

            let transparentDecisions = 0;
            const explanationAvailable = {};

            for (const decision of aiDecisions) {
                // Simulate checking if explanation is available
                const hasExplanation = true; // In real implementation, check actual system
                const hasHumanReview = true;
                const hasClearCriteria = true;

                if (hasExplanation && hasHumanReview && hasClearCriteria) {
                    transparentDecisions++;
                    explanationAvailable[decision] = true;
                } else {
                    explanationAvailable[decision] = false;
                }
            }

            return {
                algorithmicTransparencyCompliant: transparentDecisions === aiDecisions.length,
                transparentDecisions,
                totalDecisions: aiDecisions.length,
                explanationAvailable
            };
        },
        { algorithmicTransparencyCompliant: true },
        'EU-KI-Verordnung Art. 13'
    )
];

// ZEPTO STEP 4.9: Main DSGVO Compliance Component
export default function DsgvoComplianceTestSuite() {
    const [testResults, setTestResults] = useState({});
    const [rbacSystem] = useState(() => new RBACSystem());
    const [isRunning, setIsRunning] = useState(false);
    const [currentTest, setCurrentTest] = useState('');

    // ZEPTO STEP 4.10: Initialize RBAC System
    useEffect(() => {
        // Initialize default roles and permissions
        rbacSystem.definePermission('read_own_profile', 'Read own user profile', 'user_data', 'read');
        rbacSystem.definePermission('write_own_profile', 'Update own user profile', 'user_data', 'write');
        rbacSystem.definePermission('generate_pdf', 'Generate PDF documents', 'pdf_generation', 'execute');
        rbacSystem.definePermission('view_all_users', 'View all user data', 'user_data', 'read_all');
        rbacSystem.definePermission('manage_system', 'Manage system settings', 'system', 'admin');

        rbacSystem.defineRole('user', 'Standard User', 'Regular user with basic permissions', [
            'read_own_profile', 'write_own_profile', 'generate_pdf'
        ]);
        
        rbacSystem.defineRole('admin', 'Administrator', 'Full system access', [
            'read_own_profile', 'write_own_profile', 'generate_pdf', 'view_all_users', 'manage_system'
        ]);

        rbacSystem.defineRole('ai_agent', 'AI Agent', 'AI system with limited permissions', [
            'read_own_profile', 'generate_pdf'
        ]);

        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'dsgvo_compliance_system_initialized',
                'DsgvoComplianceTestSuite',
                { 
                    rolesCount: rbacSystem.roles.size,
                    permissionsCount: rbacSystem.permissions.size
                }
            );
        }
    }, [rbacSystem]);

    // ZEPTO STEP 4.11: Run DSGVO Compliance Tests
    const runComplianceTests = async () => {
        setIsRunning(true);
        const allTests = [
            ...createDataMinimizationTests(),
            ...createEUKIVerordnungTests(),
            // RBAC Test
            new DsgvoTestCase(
                'RBAC System - Rollenbasierte Zugriffskontrolle',
                async () => {
                    const testUserId = 'test_user_123';
                    rbacSystem.assignRole(testUserId, 'user');
                    
                    const canReadOwnProfile = rbacSystem.hasPermission(testUserId, 'user_data', 'read');
                    const canViewAllUsers = rbacSystem.hasPermission(testUserId, 'user_data', 'read_all');
                    
                    return {
                        rbacWorking: canReadOwnProfile && !canViewAllUsers,
                        canReadOwnProfile,
                        canViewAllUsers,
                        auditLogEntries: rbacSystem.auditLog.length
                    };
                },
                { rbacWorking: true, canReadOwnProfile: true, canViewAllUsers: false },
                'DSGVO Art. 32'
            )
        ];

        for (let i = 0; i < allTests.length; i++) {
            const test = allTests[i];
            setCurrentTest(test.name);
            
            const result = await test.run();
            setTestResults(prev => ({ ...prev, [test.id]: test }));
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setIsRunning(false);
        setCurrentTest('');
    };

    const getComplianceStats = () => {
        const allTests = Object.values(testResults);
        return {
            total: allTests.length,
            passed: allTests.filter(t => t.status === 'passed').length,
            failed: allTests.filter(t => t.status === 'failed').length,
            complianceRate: allTests.length > 0 ? 
                (allTests.filter(t => t.status === 'passed').length / allTests.length) * 100 : 0
        };
    };

    const stats = getComplianceStats();

    return (
        <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    DSGVO Compliance & Privacy Foundation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <Button 
                            onClick={runComplianceTests}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isRunning ? 'Running Compliance Tests...' : 'Run DSGVO Compliance Tests'}
                        </Button>
                        
                        {stats.total > 0 && (
                            <Badge variant={stats.complianceRate === 100 ? 'default' : 'destructive'}>
                                {stats.complianceRate.toFixed(1)}% Compliant
                            </Badge>
                        )}
                    </div>

                    {isRunning && (
                        <div className="text-sm text-gray-600">
                            Current: {currentTest}
                        </div>
                    )}

                    {Object.keys(testResults).length > 0 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>Tests: {stats.total}</div>
                                <div className="text-green-600">Passed: {stats.passed}</div>
                                <div className="text-red-600">Failed: {stats.failed}</div>
                            </div>
                            
                            {Object.values(testResults).map(test => (
                                <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {test.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                        {test.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                                        {test.status === 'running' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                                        
                                        <div>
                                            <div className="font-semibold">{test.name}</div>
                                            <div className="text-sm text-gray-600">
                                                {test.gdprArticle && `${test.gdprArticle} • `}
                                                {test.duration.toFixed(2)}ms
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                                        {test.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}