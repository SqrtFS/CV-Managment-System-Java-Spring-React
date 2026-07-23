import { Mail, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTASection = ({ openSignUp }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="bg-indigo-50/50 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 border-30 border-indigo-100/50 rounded-full opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 border-40 border-indigo-100/50 rounded-full opacity-50"></div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-slate-600 mb-10 relative z-10 leading-tight">
          {t('cta.title_1', 'Subscribe to get latest')} <br className="hidden md:block"/> {t('cta.title_2', 'news and platform updates')}
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto relative z-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              placeholder={t('cta.placeholder', 'Your email')} 
              className="w-full pl-12 pr-4 py-5 rounded-xl border-none shadow-md focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
          <button 
            onClick={openSignUp}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-400 to-orange-500 text-white font-medium px-10 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {t('cta.button', 'Subscribe')}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;