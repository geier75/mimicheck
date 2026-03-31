import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Users, Home, Flame, Loader2 } from "lucide-react";

const brennstoffOptions = [
    { value: 'heizoel', label: 'Heizöl', referenzpreis: 0.71 },
    { value: 'fluessiggas', label: 'Flüssiggas', referenzpreis: 0.85 },
    { value: 'holzpellets', label: 'Holzpellets', referenzpreis: 280 },
    { value: 'andere', label: 'Andere', referenzpreis: 0 }
];

export default function InputForm({ onSubmit, isCalculating }) {
    const [formData, setFormData] = useState({
        anzahlErwachsene: '',
        anzahlKinder: '',
        monatlichesEinkommen: '',
        kaltmiete: '',
        nebenkosten: '',
        heizungsart: '',
        brennstoff: '',
        rechnungsbetrag2022: '',
        bestellmenge: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const numericData = {
            ...formData,
            anzahlErwachsene: parseInt(formData.anzahlErwachsene) || 0,
            anzahlKinder: parseInt(formData.anzahlKinder) || 0,
            monatlichesEinkommen: parseFloat(formData.monatlichesEinkommen) || 0,
            kaltmiete: parseFloat(formData.kaltmiete) || 0,
            nebenkosten: parseFloat(formData.nebenkosten) || 0,
            rechnungsbetrag2022: parseFloat(formData.rechnungsbetrag2022) || 0,
            bestellmenge: parseFloat(formData.bestellmenge) || 0
        };
        onSubmit(numericData);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        return formData.anzahlErwachsene && formData.monatlichesEinkommen && formData.kaltmiete;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Haushaltsdaten */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                            Haushaltsdaten
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="erwachsene" className="text-slate-700 font-medium">Anzahl Erwachsene *</Label>
                                <Input
                                    id="erwachsene"
                                    type="number"
                                    min="1"
                                    value={formData.anzahlErwachsene}
                                    onChange={(e) => updateField('anzahlErwachsene', e.target.value)}
                                    className="bg-white/90"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="kinder" className="text-slate-700 font-medium">Anzahl Kinder</Label>
                                <Input
                                    id="kinder"
                                    type="number"
                                    min="0"
                                    value={formData.anzahlKinder}
                                    onChange={(e) => updateField('anzahlKinder', e.target.value)}
                                    className="bg-white/90"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="einkommen" className="text-slate-700 font-medium">Monatliches Gesamteinkommen (€) *</Label>
                            <Input
                                id="einkommen"
                                type="number"
                                step="0.01"
                                value={formData.monatlichesEinkommen}
                                onChange={(e) => updateField('monatlichesEinkommen', e.target.value)}
                                className="bg-white/90"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Wohndaten */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Home className="w-5 h-5 text-green-600" />
                            Wohndaten
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="kaltmiete" className="text-slate-700 font-medium">Kaltmiete (€) *</Label>
                                <Input
                                    id="kaltmiete"
                                    type="number"
                                    step="0.01"
                                    value={formData.kaltmiete}
                                    onChange={(e) => updateField('kaltmiete', e.target.value)}
                                    className="bg-white/90"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="nebenkosten" className="text-slate-700 font-medium">Nebenkosten (€)</Label>
                                <Input
                                    id="nebenkosten"
                                    type="number"
                                    step="0.01"
                                    value={formData.nebenkosten}
                                    onChange={(e) => updateField('nebenkosten', e.target.value)}
                                    className="bg-white/90"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="heizungsart" className="text-slate-700 font-medium">Heizungsart</Label>
                            <Select onValueChange={(value) => updateField('heizungsart', value)} value={formData.heizungsart}>
                                <SelectTrigger className="bg-white/90">
                                    <SelectValue placeholder="Heizungsart auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="leitungsgebunden">Leitungsgebunden (Gas, Fernwärme)</SelectItem>
                                    <SelectItem value="nicht-leitungsgebunden">Nicht leitungsgebunden</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Heizkostendaten - nur bei nicht leitungsgebundener Heizung */}
            {formData.heizungsart === 'nicht-leitungsgebunden' && (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Flame className="w-5 h-5 text-orange-600" />
                            Heizkostendaten 2022
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="brennstoff" className="text-slate-700 font-medium">Brennstoff</Label>
                                <Select onValueChange={(value) => updateField('brennstoff', value)} value={formData.brennstoff}>
                                    <SelectTrigger className="bg-white/90">
                                        <SelectValue placeholder="Brennstoff auswählen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brennstoffOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="rechnungsbetrag" className="text-slate-700 font-medium">Rechnungsbetrag 2022 (€)</Label>
                                <Input
                                    id="rechnungsbetrag"
                                    type="number"
                                    step="0.01"
                                    value={formData.rechnungsbetrag2022}
                                    onChange={(e) => updateField('rechnungsbetrag2022', e.target.value)}
                                    className="bg-white/90"
                                />
                            </div>
                            <div>
                                <Label htmlFor="bestellmenge" className="text-slate-700 font-medium">Bestellmenge</Label>
                                <Input
                                    id="bestellmenge"
                                    type="number"
                                    step="0.01"
                                    value={formData.bestellmenge}
                                    onChange={(e) => updateField('bestellmenge', e.target.value)}
                                    className="bg-white/90"
                                    placeholder="z.B. 1000 Liter"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
                <Button 
                    type="submit" 
                    disabled={!isFormValid() || isCalculating}
                    className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    size="lg"
                >
                    {isCalculating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Berechne...
                        </>
                    ) : (
                        <>
                            <Calculator className="w-5 h-5 mr-2" />
                            Förderansprüche prüfen
                        </>
                    )}
                </Button>
            </div>

            <p className="text-sm text-slate-600 text-center">
                * Pflichtfelder für die Grundberechnung
            </p>
        </form>
    );
}