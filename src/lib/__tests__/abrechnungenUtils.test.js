import { describe, it, expect } from 'vitest';
import { filterAbrechnungen, sortAbrechnungen, filterAndSortAbrechnungen } from '../abrechnungenUtils.js';

const mk = (over = {}) => ({
  id: String(Math.random()),
  analyse_status: 'abgeschlossen',
  rueckforderung_potential: 0,
  created_date: new Date().toISOString(),
  ...over,
});

describe('abrechnungenUtils', () => {
  it('filters by status and minimum potential', () => {
    const list = [
      mk({ analyse_status: 'abgeschlossen', rueckforderung_potential: 100 }),
      mk({ analyse_status: 'wartend', rueckforderung_potential: 50 }),
      mk({ analyse_status: 'fehler', rueckforderung_potential: 10 }),
    ];
    const out = filterAbrechnungen(list, { status: 'abgeschlossen', minPotential: 80 });
    expect(out).toHaveLength(1);
    expect(out[0].analyse_status).toBe('abgeschlossen');
    expect(out[0].rueckforderung_potential).toBe(100);
  });

  it('sorts by created_date desc by default', () => {
    const list = [
      mk({ created_date: '2024-01-01T00:00:00Z' }),
      mk({ created_date: '2024-02-01T00:00:00Z' }),
    ];
    const out = sortAbrechnungen(list);
    expect(out[0].created_date).toBe('2024-02-01T00:00:00Z');
  });

  it('sorts by potential asc', () => {
    const list = [
      mk({ rueckforderung_potential: 200 }),
      mk({ rueckforderung_potential: 10 }),
      mk({ rueckforderung_potential: 100 }),
    ];
    const out = sortAbrechnungen(list, { sortBy: 'rueckforderung_potential', order: 'asc' });
    expect(out.map(a => a.rueckforderung_potential)).toEqual([10, 100, 200]);
  });

  it('filterAndSort chains correctly', () => {
    const list = [
      mk({ analyse_status: 'abgeschlossen', rueckforderung_potential: 100, created_date: '2024-01-02T00:00:00Z' }),
      mk({ analyse_status: 'abgeschlossen', rueckforderung_potential: 50, created_date: '2024-01-03T00:00:00Z' }),
      mk({ analyse_status: 'fehler', rueckforderung_potential: 500, created_date: '2024-01-01T00:00:00Z' }),
    ];
    const out = filterAndSortAbrechnungen(list, { status: 'abgeschlossen', minPotential: 60, sortBy: 'created_date', order: 'desc' });
    expect(out).toHaveLength(1);
    expect(out[0].rueckforderung_potential).toBe(100);
  });
});
