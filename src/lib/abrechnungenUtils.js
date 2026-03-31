export function filterAbrechnungen(list, { status = 'alle', minPotential = 0 } = {}) {
  if (!Array.isArray(list)) return [];
  return list.filter((a) => {
    const statusOk = status === 'alle' || (a?.analyse_status === status);
    const pot = Number(a?.rueckforderung_potential || 0);
    const potentialOk = pot >= (Number(minPotential) || 0);
    return statusOk && potentialOk;
  });
}

export function sortAbrechnungen(list, { sortBy = 'created_date', order = 'desc' } = {}) {
  if (!Array.isArray(list)) return [];
  const arr = [...list];
  const dir = order === 'asc' ? 1 : -1;
  return arr.sort((a, b) => {
    if (sortBy === 'rueckforderung_potential') {
      const av = Number(a?.rueckforderung_potential || 0);
      const bv = Number(b?.rueckforderung_potential || 0);
      return dir * (av - bv);
    }
    const at = new Date(a?.created_date || 0).getTime();
    const bt = new Date(b?.created_date || 0).getTime();
    return dir * (at - bt);
  });
}

export function filterAndSortAbrechnungen(list, opts = {}) {
  const filtered = filterAbrechnungen(list, opts);
  return sortAbrechnungen(filtered, opts);
}
