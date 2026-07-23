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
        
        <div className="space-y-8">
          {steps.map((step, idx) => {
            const IconComponent = Icons[step.iconName] || Icons.HelpCircle;
            return (
              <div key={idx} className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-600">{t(step.title, step.title)}</h4>
                  <p className="text-gray-500 mt-1 max-w-xs">{t(step.description, step.description)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm mx-auto border border-gray-100">
          <div className="h-40 bg-indigo-100 rounded-2xl mb-6 flex items-center justify-center">
            <Icons.Layers className="w-16 h-16 text-indigo-300" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">{t('steps.mockup.role', 'Senior React Developer')}</h4>
          <p className="text-gray-500 mt-2 mb-4">{t('steps.mockup.posted', 'Posted today by HR Team')}</p>
          <div className="flex gap-4 items-center">
            <div className="bg-gray-100 p-3 rounded-full">
              <Bookmark className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('steps.mockup.status_label', 'Matching Status')}</p>
              <p className="text-sm font-bold text-slate-900">{t('steps.mockup.status_value', '85% Compatibility')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;