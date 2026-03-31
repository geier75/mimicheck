import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "@/api/entities";
import { supabase } from "@/api/supabaseClient";
import { createPageUrl } from "@/utils";
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    FileText,
    Upload as UploadIcon,
    FileCheck,
    Menu,
    X,
    LogOut,
    User as UserIcon,
    HelpCircle,
    Settings,
    Globe
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell.jsx";
import AIChatAssistant from "@/components/ui/AIChatAssistant";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }) {
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const location = useLocation();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        User.me().then(u => setUser(u)).catch(() => { });
    }, []);

    const handleLogout = useCallback(async () => {
        try { await supabase.auth.signOut(); } catch { }
        await User.logout('/');
    }, []);

    const navItems = [
        { name: t('layout.nav.profil', 'Profil'), icon: UserIcon, page: 'profilseite', external: true },
        { name: t('layout.nav.upload', 'Upload'), icon: UploadIcon, page: 'Upload' },
        { name: t('abrechnungen.title', 'Abrechnungen'), icon: FileText, page: 'Abrechnungen' },
        { name: t('layout.nav.antraege', 'Anträge'), icon: FileCheck, page: 'Antraege' },
        { name: t('layout.nav.contact', 'Kontakt'), icon: HelpCircle, page: 'Contact' },
    ];

    const currentPath = location.pathname;

    return (
        <div className="min-h-screen bg-slate-950 font-sans flex overflow-hidden selection:bg-emerald-500/30">
            {/* SIDEBAR - Dark Theme */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Logo Area - Klick führt zur Landing Page */}
                <div className="p-8">
                    <div className="flex items-center justify-between mb-1">
                        <a 
                            href={import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing'}
                            className="text-2xl font-heading font-bold text-white tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            MiMi<span className="text-emerald-400">Check</span>
                        </a>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <a 
                        href={import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing'}
                        className="text-sm text-slate-400 font-medium hover:text-slate-300 transition-colors cursor-pointer"
                    >
                        {t('layout.subtitle', 'Dein digitaler Antragshelfer')}
                    </a>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = currentPath === createPageUrl(item.page);
                        return (
                            <Link
                                key={item.name}
                                to={createPageUrl(item.page)}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium border border-transparent'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Footer */}
                <div className="p-4 mt-auto border-t border-white/5">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm border border-emerald-500/30">
                                        {user.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{user.full_name || 'Benutzer'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-900 border-white/10 text-slate-200" align="end">
                                <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer">
                                    <Link to={createPageUrl('Lebenslagen')}>
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        {t('layout.profile.edit', 'Profil bearbeiten')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('layout.profile.logout', 'Abmelden')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}

                    {/* KI Lotse Button - immer sichtbar */}
                    <div className="p-3 mt-2">
                        <button
                            onClick={() => setIsAIChatOpen(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <HelpCircle className="w-5 h-5" />
                            KI Lotse
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-300 uppercase transition-colors p-2 rounded hover:bg-white/5">
                                    <Globe className="w-4 h-4" />
                                    {i18n.language}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-900 border-white/10 text-slate-200 max-h-[300px] overflow-y-auto" align="start">
                                {[
                                    { code: 'de', label: 'Deutsch' },
                                    { code: 'en', label: 'English' },
                                    { code: 'tr', label: 'Türkçe' },
                                    { code: 'es', label: 'Español' },
                                    { code: 'pt', label: 'Português' },
                                    { code: 'it', label: 'Italiano' },
                                    { code: 'pl', label: 'Polski' },
                                    { code: 'ru', label: 'Русский' },
                                    { code: 'ar', label: 'العربية' }
                                ].map((lang) => (
                                    <DropdownMenuItem
                                        key={lang.code}
                                        onClick={() => i18n.changeLanguage(lang.code)}
                                        className={`cursor-pointer flex gap-3 ${i18n.language === lang.code ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5'}`}
                                    >
                                        <span className="uppercase font-bold text-xs w-6 text-slate-500">{lang.code}</span>
                                        <span>{lang.label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex gap-2">
                            <Link to={createPageUrl('Impressum')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t('layout.nav.impressum', 'Impressum')}</Link>
                        </div>
                        <NotificationBell />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER - Dark Theme Container */}
            <div className="flex-1 relative bg-slate-950 lg:py-3 lg:pr-3 h-screen overflow-hidden">
                <main className="h-full w-full bg-slate-900/50 lg:rounded-[2rem] shadow-2xl overflow-y-auto overflow-x-hidden relative scrollbar-hide border border-white/5 backdrop-blur-sm">

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden absolute top-4 left-4 z-50">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 bg-slate-800/80 backdrop-blur-md text-white rounded-lg border border-white/10"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Page Content */}
                    {children}

                    {/* Footer inside the dark area */}
                    <footer className="py-8 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
                        <p>{t('layout.footer', '© 2025 MiMiCheck. Made with ❤️ in DACH.')}</p>
                    </footer>
                </main>
            </div>

            {/* Global AI Assistant */}
            <AIChatAssistant isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
        </div>
    );
}
