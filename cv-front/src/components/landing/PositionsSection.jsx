import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const PositionsSection = ({ positions }) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h3 className="text-gray-500 font-semibold uppercase tracking-widest text-sm mb-2">
          {t('positions.subtitle', 'Top Trending')}
        </h3>
        <h2 className="text-4xl font-serif font-bold text-slate-900">
          {t('positions.title', 'Most Popular Positions')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {positions.map((pos, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-lg overflow-hidden pb-6 group cursor-pointer hover:-translate-y-2 transition-transform">
            <div className="h-64 overflow-hidden bg-gray-100">
              <img src={pos.image} alt={pos.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
            </div>
            <div className="px-6 pt-6 flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold text-slate-600 mb-2">{t(pos.title, pos.title)}</h4>
                <p className="text-gray-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {pos.company}
                </p>
              </div>
              <span className="text-indigo-900 font-bold bg-indigo-50 px-3 py-1 rounded-full text-sm">
                {pos.cvs}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PositionsSection;