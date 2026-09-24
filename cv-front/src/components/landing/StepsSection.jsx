import * as Icons from "lucide-react";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";

const StepsSection = ({ steps }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
      <div className="flex-1">
        <h3 className="text-gray-500 font-semibold uppercase tracking-widest text-sm mb-2">
          {t('steps.subtitle', 'Easy and Fast')}
        </h3>
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-10 max-w-md">
          {t('steps.title', 'Build Your Team In 3 Easy Steps')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const IconComponent = Icons[step.iconName] || Icons.HelpCircle;
            return (
              <div key={idx} className="flex flex-row gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-600">{t(step.title, step.title)}</h4>
                  <p className="text-gray-500 mt-1">{t(step.description, step.description)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;