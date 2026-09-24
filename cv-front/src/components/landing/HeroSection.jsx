import { ChevronDown, Globe, LayoutDashboard, Vegan, VeganIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const HeroSection = ({ openSignUp, openSignIn }) => {
    const { t, i18n } = useTranslation();
    const [isLangOpen, setIsLangOpen] = useState(false);
    
    const currentLang = i18n.resolvedLanguage?.toUpperCase() || 'EN';

    const handleLanguageChange = (lang) => {
        setIsLangOpen(false);
        i18n.changeLanguage(lang);
    };

    return (
        <>
            <div className="sm:py-0 flex items-center justify-between gap-5 backdrop-blur-[2px] p-4 sticky top-0 z-30 max-w-7xl mx-auto md:py-5 lg:py-10">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <Vegan className="text-amber-300" />
                        <span className="text-3xl font-bold text-black truncate">
                            {t('hero.logo', 'CV Management System')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 font-medium transition-colors focus:outline-none"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{currentLang}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isLangOpen && (
                            <div className="absolute top-full right-0 mt-3 w-32 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                                <button
                                    onClick={() => handleLanguageChange("en")}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${currentLang === "EN" ? "text-orange-500 font-bold bg-orange-50/50" : "text-gray-700"}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => handleLanguageChange("ru")}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${currentLang === "RU" ? "text-orange-500 font-bold bg-orange-50/50" : "text-gray-700"}`}
                                >
                                    Русский
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                        <button
                            onClick={openSignIn}
                            className="text-gray-600 font-medium px-2 py-2 hover:text-orange-500 transition-colors"
                        >
                            {t('login', 'Log in')}
                        </button>
                        <button
                            onClick={openSignUp}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 shadow-sm transition-all active:scale-95"
                        >
                            {t('signup', 'Sign up')}
                        </button>
                    </div>
                </div>
            </div>

            <section className="relative pt-32 pb-20 lg:pt-20 lg:pb-20 px-6 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
                <div className="flex-1 text-center lg:text-left z-10">
                    <h3 className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-4">
                        {t('hero.subtitle', 'Best ATS Platform')}
                    </h3>
                    <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 leading-tight mb-6">
                        {t('hero.title_1', 'Manage, filter')} <br className="hidden lg:block" />
                        {t('hero.title_2', 'and hire the')} <br className="hidden lg:block" />
                        {t('hero.title_3', 'best talent')}
                    </h1>
                    <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                        {t('hero.description', 'Built for recruiters and candidates. Streamline your hiring process, manage dynamic attributes, and find the perfect match faster than ever.')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                        <button
                            onClick={openSignUp}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-4 px-8 rounded-xl shadow-lg transition-all"
                        >
                            {t('hero.cta_button', 'Find out more')}
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <div className="w-full aspect-4/3 bg-white-50 rounded-[3rem] shadow-2xl border-4 border-white flex flex-col items-center justify-center overflow-hidden">
                        <VeganIcon className="w-50 h-50 text-amber-300 mb-4" />
                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroSection;