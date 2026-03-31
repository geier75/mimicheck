import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({ 
    currentPage = 1, 
    totalPages = 1, 
    onPageChange,
    isLoading = false 
}) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (page !== currentPage && !isLoading) {
            onPageChange(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push('...');
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push('...');
            }
            
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1 || isLoading}
                className="border-slate-300 dark:border-slate-600"
            >
                <ChevronLeft className="w-4 h-4" />
                Zurück
            </Button>

            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-1 text-slate-500">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageClick(page)}
                            disabled={isLoading}
                            className={`
                                ${currentPage === page 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                    : 'border-slate-300 dark:border-slate-600'
                                }
                            `}
                        >
                            {page}
                        </Button>
                    )
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages || isLoading}
                className="border-slate-300 dark:border-slate-600"
            >
                Weiter
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}