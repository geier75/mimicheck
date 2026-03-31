import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SuccessToast({ message, isVisible, onClose, duration = 3000 }) {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="fixed top-4 right-4 z-50"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-green-200 dark:border-green-800 p-4 flex items-center gap-3 max-w-md">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="flex-1 text-slate-800 dark:text-white font-medium">
                            {message}
                        </p>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}