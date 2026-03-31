import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

export default function PdfExportButton({ abrechnung }) {
    const handleExport = () => {
        window.print();
    };

    return (
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Als PDF speichern
        </Button>
    );
}