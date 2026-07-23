import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const FooterSection = () => {
    const { t } = useTranslation();

    return (
        <footer className="py-16 px-6 max-w-7xl mx-auto border-t border-gray-100 mt-10 ">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12 lg:flex justify-center lg:gap-70">
                <div className="md:col-span-2">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tighter">{t('footer.logo', 'CV.System')}</h2>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                        {t('footer.description', 'Manage your candidates in minutes, get full control over the hiring process.')}
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">{t('footer.platform', 'Platform')}</h4>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.for_recruiters', 'For Recruiters')}</a></li>
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.for_candidates', 'For Candidates')}</a></li>
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.pricing', 'Pricing')}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-lg">{t('footer.company', 'Company')}</h4>
                    <ul className="space-y-3 text-gray-500 text-sm">
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.about_us', 'About Us')}</a></li>
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.careers', 'Careers')}</a></li>
                        <li><a href="#" className="hover:text-orange-500 transition-colors">{t('footer.contact', 'Contact')}</a></li>
                    </ul>
                </div>

            </div>
            <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-100">
                {t('footer.rights', 'All rights reserved © 2026 CV Management System')}
            </div>
        </footer>
    );
};

export default FooterSection;