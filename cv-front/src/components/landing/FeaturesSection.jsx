import * as Icons from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = ({ features }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto text-center">
      <h3 className="text-gray-500 font-semibold uppercase tracking-widest text-sm mb-2">
        {t('features.subtitle', 'Category')}
      </h3>
      <h2 className="text-4xl font-serif font-bold text-slate-900 mb-16">
        {t('features.title', 'We Offer Best Features')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, idx) => {
          const IconComponent = Icons[feature.iconName] || Icons.HelpCircle;
          
          return (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] transition-shadow group flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-100 transition-colors">
                <IconComponent className={`w-10 h-10 ${feature.iconColor}`} />
              </div>

              <h4 className="text-xl font-bold text-slate-900 mb-3">{t(feature.title, feature.title)}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{t(feature.description, feature.description)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;