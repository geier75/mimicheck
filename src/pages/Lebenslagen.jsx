
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, User as UserIcon, Home, Euro, Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ConsentDialog from "@/components/ui/ConsentDialog";
import { useUserProfile } from "@/components/UserProfileContext";
import ProfileProgress from "@/components/profile/ProfileProgress";
import { track, AREA } from "@/components/core/telemetry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DsgvoActions from "@/components/profile/DsgvoActions";

// Manuelle Validierungsfunktionen (statt zod)
const validateRequired = (value, fieldName, t) => {
    if (!value || value === '') {
        return t('lebenslagenPage.validation.required', { field: fieldName });
    }
    return null;
};

const validatePLZ = (value, t) => {
    if (!value) return null;
    if (!/^\d{5}$/.test(value)) {
        return t('lebenslagenPage.validation.zip');
    }
    return null;
};

const validateMinLength = (value, min, fieldName, t) => {
    if (!value) return null;
    if (value.length < min) {
        return t('lebenslagenPage.validation.minLength', { field: fieldName, min });
    }
    return null;
};

const validateNumber = (value, min, max, fieldName, t) => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (isNaN(num)) {
        return t('lebenslagenPage.validation.number', { field: fieldName });
    }
    if (min !== undefined && num < min) {
        return t('lebenslagenPage.validation.min', { field: fieldName, min });
    }
    if (max !== undefined && num > max) {
        return t('lebenslagenPage.validation.max', { field: fieldName, max });
    }
    return null;
};

// Vollständigkeits-Berechnung
const computeProfileCompletion = (userData) => {
    const fields = [
        'vorname',
        'nachname',
        'geburtsdatum',
        'lebenssituation.wohnadresse.plz',
        'lebenssituation.wohnadresse.ort',
        'lebenssituation.familienstand',
        'lebenssituation.beschaeftigungsstatus',
        'lebenssituation.monatliches_nettoeinkommen',
        'lebenssituation.wohnart',
    ];

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    let filledCount = 0;
    const missingFields = [];

    fields.forEach(field => {
        const value = getNestedValue(userData, field);
        if (value !== null && value !== undefined && value !== '') {
            filledCount++;
        } else {
            missingFields.push(field.split('.').pop());
        }
    });

    const score = Math.round((filledCount / fields.length) * 100);

    return {
        score,
        filledFields: filledCount,
        totalFields: fields.length,
        missingFields
    };
};

const FormSection = ({ title, icon: Icon, children }) => (
    <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/20 border-b border-slate-200/60 dark:border-slate-700/60">
            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">{children}</CardContent>
    </Card>
);

export default function Lebenslagen() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState("persoenlich");
    const [showConsent, setShowConsent] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [completionData, setCompletionData] = useState(null);

    const { control, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm({
        mode: 'onBlur'
    });

    const navigate = useNavigate();
    const { user: contextUser, updateUserProfile, profileVersion } = useUserProfile();

    const watchSchwerbehinderung = watch("lebenssituation.besondere_umstaende.schwerbehinderung");
    const watchPflegebeduerftig = watch("lebenssituation.besondere_umstaende.pflegebeduerftig");
    const watchWohnart = watch("lebenssituation.wohnart");

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = contextUser || await User.me();
                const formData = {
                    vorname: currentUser.vorname || '',
                    nachname: currentUser.nachname || '',
                    geburtsdatum: currentUser.geburtsdatum || '',
                    ki_automation_level: currentUser.ki_automation_level || 'assistiert',
                    lebenssituation: currentUser.lebenssituation || {}
                };

                // Delay reset to avoid React rendering crash
                setTimeout(() => {
                    reset(formData);
                }, 0);

                const completion = computeProfileCompletion(currentUser);
                setCompletionData(completion);

                if (!currentUser.lebenssituation?.vollmachten_einverstaendnis?.datenschutz_zustimmung) {
                    setShowConsent(true);
                }

                track('profile.loaded', AREA.PROFILE, {
                    completionScore: completion.score
                });
            } catch (e) {
                console.error("Fehler beim Laden:", e);
                navigate(createPageUrl('ProfilSeite'));
            }
            setIsLoading(false);
        };

        loadUserData();
    }, [reset, navigate, contextUser, profileVersion]);

    const handleConsent = async () => {
        try {
            await updateUserProfile({
                lebenssituation: {
                    vollmachten_einverstaendnis: {
                        datenschutz_zustimmung: true
                    }
                }
            });
            setShowConsent(false);
            track('profile.consent.accepted', AREA.PROFILE);
        } catch (error) {
            console.error("Fehler beim Speichern der Zustimmung:", error);
        }
    };

    const validateFormData = (data) => {
        const errors = {};

        // Basis-Validierung
        const vornameError = validateRequired(data.vorname, t('lebenslagenPage.sections.personal.firstName'), t) || validateMinLength(data.vorname, 2, t('lebenslagenPage.sections.personal.firstName'), t);
        if (vornameError) errors.vorname = vornameError;

        const nachnameError = validateRequired(data.nachname, t('lebenslagenPage.sections.personal.lastName'), t) || validateMinLength(data.nachname, 2, t('lebenslagenPage.sections.personal.lastName'), t);
        if (nachnameError) errors.nachname = nachnameError;

        // PLZ Validierung
        if (data.lebenssituation?.wohnadresse?.plz) {
            const plzError = validatePLZ(data.lebenssituation.wohnadresse.plz, t);
            if (plzError) errors['lebenssituation.wohnadresse.plz'] = plzError;
        }

        // Abhängige Validierungen
        if (data.lebenssituation?.besondere_umstaende?.grad_der_behinderung && !data.lebenssituation?.besondere_umstaende?.schwerbehinderung) {
            errors['lebenssituation.besondere_umstaende.grad_der_behinderung'] = t('lebenslagenPage.validation.onlyDisability');
        }

        if (data.lebenssituation?.besondere_umstaende?.pflegegrad && !data.lebenssituation?.besondere_umstaende?.pflegebeduerftig) {
            errors['lebenssituation.besondere_umstaende.pflegegrad'] = t('lebenslagenPage.validation.onlyCare');
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const onSubmit = async (data) => {
        const validation = validateFormData(data);

        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            track('profile.validation.failed', AREA.PROFILE, {
                errors: Object.keys(validation.errors)
            });
            return;
        }

        setValidationErrors({});
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const completion = computeProfileCompletion({ ...contextUser, ...data });

            await updateUserProfile({
                ...data,
                profile_completeness: completion.score
            });

            // Delay state updates to avoid React crash
            setTimeout(() => {
                setCompletionData(completion);
                setSaveSuccess(true);

                track('profile.saved', AREA.PROFILE, {
                    completionScore: completion.score
                });

                setTimeout(() => setSaveSuccess(false), 3000);
            }, 0);
        } catch (e) {
            console.error("Fehler beim Speichern:", e);
            track('profile.save.failed', AREA.PROFILE, {
                error: e.message
            });
        } finally {
            setTimeout(() => setIsSaving(false), 100);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-slate-700 dark:text-slate-300">{t('lebenslagenPage.loading')}</p>
            </div>
        </div>
    );

    return (
        <>
            <ConsentDialog
                isOpen={showConsent}
                onConfirm={handleConsent}
                onCancel={() => navigate(createPageUrl('ProfilSeite'))}
            />
            <div className={`${showConsent ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(createPageUrl("ProfilSeite"))}
                        className="shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white">{t('lebenslagenPage.title')}</h1>
                        <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mt-2">
                            {t('lebenslagenPage.subtitle')}
                        </p>
                    </div>
                </div>

                {completionData && (
                    <div className="mb-8">
                        <ProfileProgress completionData={completionData} />
                    </div>
                )}

                {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>{t('lebenslagenPage.validationErrorTitle')}</strong>
                            <ul className="mt-2 space-y-1">
                                {Object.values(validationErrors).map((error, idx) => (
                                    <li key={idx}>• {error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {t('lebenslagenPage.autoSave')}
                            </span>
                        </div>
                        <Button type="submit" disabled={isSaving || saveSuccess} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saveSuccess && <Check className="mr-2 h-4 w-4" />}
                            {isSaving ? t('lebenslagenPage.buttons.saving') : saveSuccess ? t('lebenslagenPage.buttons.saved') : t('lebenslagenPage.buttons.save')}
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <TabsTrigger value="persoenlich">{t('lebenslagenPage.tabs.personal')}</TabsTrigger>
                            <TabsTrigger value="wohnen">{t('lebenslagenPage.tabs.living')}</TabsTrigger>
                            <TabsTrigger value="finanzen">{t('lebenslagenPage.tabs.finance')}</TabsTrigger>
                            <TabsTrigger value="behoerden">{t('lebenslagenPage.tabs.authorities')}</TabsTrigger>
                            <TabsTrigger value="dsgvo">{t('lebenslagenPage.tabs.privacy')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="persoenlich" className="space-y-6 mt-8">
                            <FormSection title={t('lebenslagenPage.sections.personal.title')} icon={UserIcon}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Controller
                                        name="vorname"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.firstName')}</Label>
                                                <Input {...field} placeholder={t('lebenslagenPage.sections.personal.firstName')} />
                                                {validationErrors.vorname && <p className="text-red-500 text-sm mt-1">{validationErrors.vorname}</p>}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="nachname"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.lastName')}</Label>
                                                <Input {...field} placeholder={t('lebenslagenPage.sections.personal.lastName')} />
                                                {validationErrors.nachname && <p className="text-red-500 text-sm mt-1">{validationErrors.nachname}</p>}
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="geburtsdatum"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.birthDate')}</Label>
                                                <Input type="date" {...field} />
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="lebenssituation.familienstand"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value } }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.maritalStatus')}</Label>
                                                <NativeSelect
                                                    value={value || ''}
                                                    onChange={(e) => onChange(e.target.value)}
                                                    placeholder={t('lebenslagenPage.sections.personal.options.select')}
                                                    options={[
                                                        { value: "ledig", label: t('lebenslagenPage.sections.personal.options.single') },
                                                        { value: "verheiratet", label: t('lebenslagenPage.sections.personal.options.married') },
                                                        { value: "in_partnerschaft", label: t('lebenslagenPage.sections.personal.options.partnership') },
                                                        { value: "verwitwet", label: t('lebenslagenPage.sections.personal.options.widowed') },
                                                        { value: "geschieden", label: t('lebenslagenPage.sections.personal.options.divorced') }
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.beschaeftigungsstatus"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value } }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.employmentStatus')}</Label>
                                                <NativeSelect
                                                    value={value || ''}
                                                    onChange={(e) => onChange(e.target.value)}
                                                    placeholder={t('lebenslagenPage.sections.personal.options.select')}
                                                    options={[
                                                        { value: "angestellt", label: t('lebenslagenPage.sections.personal.options.employed') },
                                                        { value: "arbeitslos", label: t('lebenslagenPage.sections.personal.options.unemployed') },
                                                        { value: "selbststaendig", label: t('lebenslagenPage.sections.personal.options.selfEmployed') },
                                                        { value: "student", label: t('lebenslagenPage.sections.personal.options.student') },
                                                        { value: "rentner", label: t('lebenslagenPage.sections.personal.options.retired') },
                                                        { value: "elternzeit", label: t('lebenslagenPage.sections.personal.options.parentalLeave') },
                                                        { value: "arbeitsunfaehig", label: t('lebenslagenPage.sections.personal.options.incapacitated') }
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="lebenssituation.haushaltsmitglieder_anzahl"
                                        control={control}
                                        defaultValue={0}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.householdSize')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        const n = v === '' ? null : Math.max(0, parseInt(v, 10) || 0);
                                                        field.onChange(n);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.kinder_anzahl"
                                        control={control}
                                        defaultValue={0}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.childrenCount')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        const n = v === '' ? null : Math.max(0, parseInt(v, 10) || 0);
                                                        field.onChange(n);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">{t('lebenslagenPage.sections.personal.specialCircumstances')}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="lebenssituation.besondere_umstaende.alleinerziehend"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label>{t('lebenslagenPage.sections.personal.singleParent')}</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.besondere_umstaende.schwerbehinderung"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label>{t('lebenslagenPage.sections.personal.disability')}</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.besondere_umstaende.pflegebeduerftig"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label>{t('lebenslagenPage.sections.personal.careNeed')}</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.besondere_umstaende.student"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label>{t('lebenslagenPage.sections.personal.student')}</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.besondere_umstaende.chronische_krankheit"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label>{t('lebenslagenPage.sections.personal.chronicIllness')}</Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {watchSchwerbehinderung && (
                                    <Controller
                                        name="lebenssituation.besondere_umstaende.grad_der_behinderung"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.disabilityDegree')}</Label>
                                                <Input
                                                    type="number"
                                                    min="20"
                                                    max="100"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value) || null)}
                                                />
                                                {validationErrors['lebenssituation.besondere_umstaende.grad_der_behinderung'] && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors['lebenssituation.besondere_umstaende.grad_der_behinderung']}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                )}

                                {watchPflegebeduerftig && (
                                    <Controller
                                        name="lebenssituation.besondere_umstaende.pflegegrad"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.personal.careLevel')}</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value) || null)}
                                                />
                                                {validationErrors['lebenssituation.besondere_umstaende.pflegegrad'] && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors['lebenssituation.besondere_umstaende.pflegegrad']}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                )}
                            </FormSection>
                        </TabsContent>

                        <TabsContent value="wohnen" className="space-y-6 mt-8">
                            <FormSection title={t('lebenslagenPage.sections.living.title')} icon={Home}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Controller
                                        name="lebenssituation.wohnadresse.strasse"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.street')}</Label>
                                                <Input {...field} placeholder="Musterstraße" />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.wohnadresse.hausnummer"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.houseNumber')}</Label>
                                                <Input {...field} placeholder="12A" />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.wohnadresse.plz"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.zip')}</Label>
                                                <Input {...field} placeholder="10115" maxLength={5} />
                                                {validationErrors['lebenssituation.wohnadresse.plz'] && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {validationErrors['lebenssituation.wohnadresse.plz']}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="lebenssituation.wohnadresse.ort"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.city')}</Label>
                                                <Input {...field} placeholder="Berlin" />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.wohnadresse.bundesland"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value } }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.state')}</Label>
                                                <NativeSelect
                                                    value={value || ''}
                                                    onChange={(e) => onChange(e.target.value)}
                                                    placeholder={t('lebenslagenPage.sections.personal.options.select')}
                                                    options={[
                                                        { value: "BW", label: "Baden-Württemberg" },
                                                        { value: "BY", label: "Bayern" },
                                                        { value: "BE", label: "Berlin" },
                                                        { value: "BB", label: "Brandenburg" },
                                                        { value: "HB", label: "Bremen" },
                                                        { value: "HH", label: "Hamburg" },
                                                        { value: "HE", label: "Hessen" },
                                                        { value: "MV", label: "Mecklenburg-Vorpommern" },
                                                        { value: "NI", label: "Niedersachsen" },
                                                        { value: "NW", label: "Nordrhein-Westfalen" },
                                                        { value: "RP", label: "Rheinland-Pfalz" },
                                                        { value: "SL", label: "Saarland" },
                                                        { value: "SN", label: "Sachsen" },
                                                        { value: "ST", label: "Sachsen-Anhalt" },
                                                        { value: "SH", label: "Schleswig-Holstein" },
                                                        { value: "TH", label: "Thüringen" }
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="lebenssituation.wohnart"
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value } }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.type')}</Label>
                                                <NativeSelect
                                                    value={value || ''}
                                                    onChange={(e) => onChange(e.target.value)}
                                                    placeholder={t('lebenslagenPage.sections.personal.options.select')}
                                                    options={[
                                                        { value: "miete", label: t('lebenslagenPage.sections.living.options.rent') },
                                                        { value: "eigentum", label: t('lebenslagenPage.sections.living.options.ownPaid') },
                                                        { value: "wohneigentum_mit_kredit", label: t('lebenslagenPage.sections.living.options.ownCredit') },
                                                        { value: "sozialwohnung", label: t('lebenslagenPage.sections.living.options.socialHousing') }
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.wohnflaeche_qm"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.living.area')}</Label>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    placeholder="75"
                                                />
                                            </div>
                                        )}
                                    />
                                </div>

                                {(watchWohnart === 'miete' || watchWohnart === 'sozialwohnung') && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Controller
                                            name="lebenssituation.monatliche_miete_kalt"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.living.rentCold')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                        placeholder="800.00"
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.monatliche_nebenkosten"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.living.utilities')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                        placeholder="150.00"
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.monatliche_heizkosten"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.living.heating')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                        placeholder="100.00"
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
                            </FormSection>
                        </TabsContent>

                        <TabsContent value="finanzen" className="space-y-6 mt-8">
                            <FormSection title={t('lebenslagenPage.sections.finance.title')} icon={Euro}>
                                <Controller
                                    name="lebenssituation.monatliches_nettoeinkommen"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Label>{t('lebenslagenPage.sections.finance.netIncome')}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                placeholder="2500.00"
                                            />
                                        </div>
                                    )}
                                />

                                <div>
                                    <Label className="text-base font-semibold mb-3 block">{t('lebenslagenPage.sections.finance.detailsTitle')}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="lebenssituation.einkommen_details.gehalt_angestellt"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.salaryEmployed')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.einkommen_selbststaendig"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.incomeSelfEmployed')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.rente"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.pension')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.arbeitslosengeld"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.unemploymentBenefit')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.kindergeld"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.childBenefit')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.elterngeld"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.parentalBenefit')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.unterhalt"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.alimony')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.einkommen_details.sonstige"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.otherIncome')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Controller
                                    name="lebenssituation.vermoegen"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Label>{t('lebenslagenPage.sections.finance.assets')}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value) || null)}
                                                placeholder="10000.00"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {t('lebenslagenPage.sections.finance.assetsHint')}
                                            </p>
                                        </div>
                                    )}
                                />

                                <div>
                                    <Label className="text-base font-semibold mb-3 block">{t('lebenslagenPage.sections.finance.insuranceTitle')}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="lebenssituation.krankenversicherung.art"
                                            control={control}
                                            defaultValue=""
                                            render={({ field: { onChange, value } }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.insuranceType')}</Label>
                                                    <NativeSelect
                                                        value={value || ''}
                                                        onChange={(e) => onChange(e.target.value)}
                                                        placeholder={t('lebenslagenPage.sections.personal.options.select')}
                                                        options={[
                                                            { value: "gesetzlich", label: t('lebenslagenPage.sections.finance.options.public') },
                                                            { value: "privat", label: t('lebenslagenPage.sections.finance.options.private') },
                                                            { value: "keine", label: t('lebenslagenPage.sections.finance.options.none') }
                                                        ]}
                                                    />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.krankenversicherung.kasse_name"
                                            control={control}
                                            render={({ field }) => (
                                                <div>
                                                    <Label>{t('lebenslagenPage.sections.finance.insuranceName')}</Label>
                                                    <Input {...field} placeholder={t('lebenslagenPage.sections.finance.insurancePlaceholder')} />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </FormSection>
                        </TabsContent>

                        <TabsContent value="behoerden" className="space-y-6 mt-8">
                            <FormSection title={t('lebenslagenPage.sections.authorities.title')} icon={Shield}>
                                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                                        {t('lebenslagenPage.sections.authorities.alert')}
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name="lebenssituation.steuer_id"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.authorities.taxId')}</Label>
                                                <Input
                                                    {...field}
                                                    placeholder={t('lebenslagenPage.sections.authorities.taxIdPlaceholder')}
                                                    maxLength={11}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">{t('lebenslagenPage.sections.authorities.taxIdHint')}</p>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        name="lebenssituation.sozialversicherungsnummer"
                                        control={control}
                                        render={({ field }) => (
                                            <div>
                                                <Label>{t('lebenslagenPage.sections.authorities.socialSecurityNumber')}</Label>
                                                <Input
                                                    {...field}
                                                    placeholder={t('lebenslagenPage.sections.authorities.socialSecurityNumberPlaceholder')}
                                                    maxLength={12}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">{t('lebenslagenPage.sections.authorities.socialSecurityNumberHint')}</p>
                                            </div>
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="lebenssituation.iban"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Label>{t('lebenslagenPage.sections.authorities.iban')}</Label>
                                            <Input
                                                {...field}
                                                placeholder={t('lebenslagenPage.sections.authorities.ibanPlaceholder')}
                                                maxLength={34}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {t('lebenslagenPage.sections.authorities.ibanHint')}
                                            </p>
                                        </div>
                                    )}
                                />

                                <div>
                                    <Label className="text-base font-semibold mb-3 block">{t('lebenslagenPage.sections.authorities.consentTitle')}</Label>
                                    <div className="space-y-4">
                                        <Controller
                                            name="lebenssituation.vollmachten_einverstaendnis.automatische_antragsstellung"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-start space-x-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <Label className="font-medium">
                                                            {t('lebenslagenPage.sections.authorities.autoApply')}
                                                        </Label>
                                                        <p className="text-sm text-slate-500">
                                                            {t('lebenslagenPage.sections.authorities.autoApplyDesc')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name="lebenssituation.vollmachten_einverstaendnis.behoerden_vollmacht"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-start space-x-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                    <Checkbox
                                                        checked={field.value || false}
                                                        onCheckedChange={field.onChange}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <Label className="font-medium">
                                                            {t('lebenslagenPage.sections.authorities.authorityPower')}
                                                        </Label>
                                                        <p className="text-sm text-slate-500">
                                                            {t('lebenslagenPage.sections.authorities.authorityPowerDesc')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </FormSection>
                        </TabsContent>

                        <TabsContent value="dsgvo" className="space-y-6 mt-8">
                            <DsgvoActions />
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </>
    );
}
