import React from 'react';
import { FormField, SelectField, InfoBox } from './FormField';

const ANREDE_OPTIONS = [
  { value: 'Herr', label: 'Herr' },
  { value: 'Frau', label: 'Frau' },
  { value: 'Divers', label: 'Divers' }
];

export default function PersoenlichesDatenSection({ profil, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectField
          label="Anrede"
          value={profil.anrede}
          onChange={handleChange('anrede')}
          options={ANREDE_OPTIONS}
        />
        <FormField
          label="Vorname"
          required
          value={profil.vorname}
          onChange={handleChange('vorname')}
        />
        <FormField
          label="Nachname"
          required
          value={profil.nachname}
          onChange={handleChange('nachname')}
        />
        <FormField
          label="Geburtsdatum"
          required
          type="date"
          value={profil.geburtsdatum}
          onChange={handleChange('geburtsdatum')}
        />
        <FormField
          label="Steuer-ID"
          required
          value={profil.steuer_id}
          onChange={handleChange('steuer_id')}
          placeholder="11-stellig"
        />
      </div>

      <InfoBox title="Identifikationsnummern (wichtig für Anträge!)" icon="🔢">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Steuer-Identifikationsnummer"
            required
            value={profil.steuer_id}
            onChange={handleChange('steuer_id')}
            placeholder="11-stellig"
            hint="Pflicht für Kindergeld seit 2016"
          />
          <FormField
            label="Sozialversicherungsnummer"
            value={profil.sozialversicherungsnummer}
            onChange={handleChange('sozialversicherungsnummer')}
            placeholder="12-stellig"
            hint="Für Jobcenter & Krankenkasse"
          />
        </div>
      </InfoBox>
    </div>
  );
}
