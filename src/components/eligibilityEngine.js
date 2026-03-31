import { empfehlungsEngine } from './foerderung/IntelligenteEmpfehlungsEngine.jsx';

const buildProfil = (user) => {
  const ls = user?.lebenssituation || {};
  return {
    familienstand: empfehlungsEngine.klassifiziereFamilienstand(ls),
    einkommensklasse: empfehlungsEngine.klassifiziereEinkommen(ls.monatliches_nettoeinkommen),
    altersgruppe: empfehlungsEngine.klassifiziereAlter(user?.age),
    hatKinder: (ls.kinder_anzahl || 0) > 0,
    kinderAnzahl: ls.kinder_anzahl || 0,
    istMieter: ls.wohnart === 'miete',
    einkommen: ls.monatliches_nettoeinkommen || 0,
    miete: ls.monatliche_miete_kalt || 0,
    haushaltGroesse: ls.haushaltsmitglieder_anzahl || 1,
  };
};

export const checkEligibility = (foerderleistung, user) => {
  const profil = buildProfil(user);
  const kriterien = foerderleistung?.pruefkriterien || {};

  const details = [];
  const missingData = [];
  let fails = 0;
  let unknowns = 0;
  let passes = 0;

  const needIncome = !!kriterien.einkommensgrenzen;
  const needFamily = !!kriterien.familienkriterien;
  const needWohn = !!kriterien.wohnkriterien;

  if (needIncome && (user?.lebenssituation?.monatliches_nettoeinkommen == null)) {
    missingData.push('Monatliches Nettoeinkommen');
  }
  if (needFamily) {
    if (user?.lebenssituation?.kinder_anzahl == null) missingData.push('Anzahl Kinder');
    if (user?.lebenssituation?.familienstand == null) missingData.push('Familienstand');
  }
  if (needWohn && (user?.lebenssituation?.wohnart == null)) {
    missingData.push('Wohnart');
  }

  const incomeOk = kriterien.einkommensgrenzen == null
    ? true
    : empfehlungsEngine.pruefeEinkommensgrenzen(kriterien.einkommensgrenzen, profil);
  if (kriterien.einkommensgrenzen) {
    if (user?.lebenssituation?.monatliches_nettoeinkommen == null) {
      unknowns++;
      details.push({ reason: 'Einkommensgrenzen können nicht geprüft werden (Einkommen fehlt).', missingData: ['Monatliches Nettoeinkommen'] });
    } else if (incomeOk) {
      passes++;
      details.push({ reason: 'Einkommensgrenzen erfüllt.' });
    } else {
      fails++;
      details.push({ reason: 'Einkommensgrenzen überschritten.' });
    }
  }

  const familyOk = kriterien.familienkriterien == null
    ? true
    : empfehlungsEngine.pruefeFamilienkriterien(kriterien.familienkriterien, profil);
  if (kriterien.familienkriterien) {
    const m = [];
    if (user?.lebenssituation?.kinder_anzahl == null) m.push('Anzahl Kinder');
    if (user?.lebenssituation?.familienstand == null) m.push('Familienstand');
    if (m.length > 0) {
      unknowns++;
      details.push({ reason: 'Familienkriterien unklar (Daten fehlen).', missingData: m });
    } else if (familyOk) {
      passes++;
      details.push({ reason: 'Familienkriterien erfüllt.' });
    } else {
      fails++;
      details.push({ reason: 'Familienkriterien nicht erfüllt.' });
    }
  }

  const wohnOk = kriterien.wohnkriterien == null
    ? true
    : empfehlungsEngine.pruefeWohnkriterien(kriterien.wohnkriterien, profil);
  if (kriterien.wohnkriterien) {
    if (user?.lebenssituation?.wohnart == null) {
      unknowns++;
      details.push({ reason: 'Wohnkriterien unklar (Wohnart fehlt).', missingData: ['Wohnart'] });
    } else if (wohnOk) {
      passes++;
      details.push({ reason: 'Wohnkriterien erfüllt.' });
    } else {
      fails++;
      details.push({ reason: 'Wohnkriterien nicht erfüllt.' });
    }
  }

  let eligible;
  if (fails > 0) eligible = false;
  else if (unknowns > 0) eligible = undefined;
  else eligible = true;

  const totalChecks = (needIncome ? 1 : 0) + (needFamily ? 1 : 0) + (needWohn ? 1 : 0);
  const effectiveChecks = Math.max(1, totalChecks);
  const confidence = Math.max(0, Math.min(1, (passes + 0.5 * (effectiveChecks - passes - fails)) / effectiveChecks));

  const reason = eligible === true
    ? 'Kriterien erfüllt.'
    : eligible === false
      ? 'Eine oder mehrere Kriterien nicht erfüllt.'
      : 'Weitere Daten erforderlich für eine genaue Prüfung.';

  const amount = foerderleistung?.monatlicher_betrag || foerderleistung?.betrag || 0;

  return {
    eligible,
    amount,
    reason,
    confidence,
    details,
    missingData: missingData.length > 0 ? missingData : undefined,
  };
};

export const checkMultipleEligibility = (leistungen, user) => {
  if (!Array.isArray(leistungen)) return [];
  return leistungen.map((l) => {
    const eligibilityResult = checkEligibility(l, user);
    return {
      id: l?.id,
      typ: l?.typ,
      titel: l?.titel || l?.name || l?.typ || 'Unbekannte Leistung',
      prioritaet: l?.prioritaet || 0,
      eligibilityResult,
    };
  });
};
