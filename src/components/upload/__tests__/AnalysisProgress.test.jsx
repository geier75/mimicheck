import { render, screen } from '@testing-library/react';
import AnalysisProgress from '../AnalysisProgress.jsx';

const steps = [
  { title: 'Dokument hochladen', description: 'Datei wird gespeichert' },
  { title: 'OCR-Texterkennung', description: 'Text wird extrahiert' },
  { title: 'Datenextraktion', description: 'Relevante Informationen werden identifiziert' },
  { title: 'Rechtliche Prüfung', description: 'Abrechnung wird geprüft' },
  { title: 'Bericht erstellen', description: 'Ergebnisse werden zusammengefasst' },
];

function widthPerc(el) {
  const style = el.getAttribute('style') || '';
  const m = style.match(/width:\s*([0-9.]+)%/);
  return m ? parseFloat(m[1]) : 0;
}

describe('AnalysisProgress', () => {
  it('shows fractional progress for upload step based on uploadProgress', () => {
    render(<AnalysisProgress steps={steps} currentStep={1} fileName="test.pdf" uploadProgress={50} />);
    const fill = screen.getByTestId('overall-progress-fill');
    // step 1/5 with 50% fractional => 10%
    expect(Math.round(widthPerc(fill))).toBe(10);
  });

  it('ignores uploadProgress after step 1 and advances per step', () => {
    render(<AnalysisProgress steps={steps} currentStep={2} fileName="test.pdf" uploadProgress={90} />);
    const fill = screen.getByTestId('overall-progress-fill');
    // step 2/5 => 20%
    expect(Math.round(widthPerc(fill))).toBe(20);
  });
});
