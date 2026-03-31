import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { track, AREA } from '@/components/core/telemetry';

// Debounce helper (lodash nicht verfügbar)
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export default function SearchAndFilter({ onSearchChange, onFilterChange, totalCount = 0 }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [sortBy, setSortBy] = useState('-created_date');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const debouncedSearch = useCallback(
        debounce((term) => {
            onSearchChange(term);
            track('abrechnungen.search', AREA.BILLING, {
                searchTerm: term,
                resultsCount: totalCount
            });
        }, 300),
        [onSearchChange, totalCount]
    );

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        onSearchChange('');
        track('abrechnungen.search.cleared', AREA.BILLING);
    };

    const handleStatusChange = (value) => {
        setStatusFilter(value);
        onFilterChange({ status: value, year: yearFilter, sortBy });
        track('abrechnungen.filter.status', AREA.BILLING, { status: value });
    };

    const handleYearChange = (value) => {
        setYearFilter(value);
        onFilterChange({ status: statusFilter, year: value, sortBy });
        track('abrechnungen.filter.year', AREA.BILLING, { year: value });
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        onFilterChange({ status: statusFilter, year: yearFilter, sortBy: value });
        track('abrechnungen.sort', AREA.BILLING, { sortBy: value });
    };

    const activeFiltersCount = [
        statusFilter !== 'all',
        yearFilter !== 'all',
        sortBy !== '-created_date'
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setStatusFilter('all');
        setYearFilter('all');
        setSortBy('-created_date');
        onFilterChange({ status: 'all', year: 'all', sortBy: '-created_date' });
        track('abrechnungen.filter.reset', AREA.BILLING);
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-4">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Suchen Sie nach Titel, Verwalter oder Adresse..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="border-slate-300 dark:border-slate-600"
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filter
                    {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white px-2 py-0.5 text-xs">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {showAdvanced && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Status
                            </label>
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Alle Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Alle Status</SelectItem>
                                    <SelectItem value="wartend">Wartend</SelectItem>
                                    <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                                    <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                                    <SelectItem value="fehler">Fehler</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Jahr
                            </label>
                            <Select value={yearFilter} onValueChange={handleYearChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Alle Jahre" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Alle Jahre</SelectItem>
                                    {yearOptions.map(year => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Sortierung
                            </label>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sortieren nach" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-created_date">Neueste zuerst</SelectItem>
                                    <SelectItem value="created_date">Älteste zuerst</SelectItem>
                                    <SelectItem value="-gesamtkosten">Höchste Kosten</SelectItem>
                                    <SelectItem value="gesamtkosten">Niedrigste Kosten</SelectItem>
                                    <SelectItem value="-rueckforderung_potential">Höchstes Potential</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {activeFiltersCount > 0 && (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Filter zurücksetzen
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}