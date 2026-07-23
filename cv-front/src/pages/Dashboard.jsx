import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../util/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    api.mainPage.stats().then((res) => setStats(res.data));
    api.mainPage.latestPositions().then((res) => setLatest(res.data));
    api.mainPage.popularPositions().then((res) => setPopular(res.data));
    api.mainPage.tagCloud().then((res) => setTags(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="CVs (24h)" value={stats.cvsLast24h} />
          <StatCard label="Positions" value={stats.totalPositions} />
          <StatCard label="Candidates" value={stats.totalCandidates} />
          <StatCard label="Recruiters" value={stats.totalRecruiters} />
          <StatCard label="Total CVs" value={stats.totalCvsSubmitted} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <PositionsTable title="Latest Positions" positions={latest} />
        <PositionsTable title="Most Popular" positions={popular} />
      </div>

      {tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Tag Cloud</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.tagName}
                className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-sm font-medium"
                style={{ fontSize: `${Math.min(1 + t.usageCount * 0.1, 1.6)}rem` }}
              >
                {t.tagName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const PositionsTable = ({ title, positions }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h2 className="font-semibold text-slate-900 mb-4">{title}</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-100">
          <th className="pb-2 font-medium">Title</th>
          <th className="pb-2 font-medium">Company</th>
          <th className="pb-2 font-medium">Level</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((p) => (
          <tr key={p.id} className="border-b border-gray-50 last:border-0">
            <td className="py-2.5">
              <Link to={`/dashboard/positions/${p.id}`} className="text-slate-900 hover:text-orange-500 font-medium">
                {p.title}
              </Link>
            </td>
            <td className="py-2.5 text-gray-500">{p.company || "—"}</td>
            <td className="py-2.5 text-gray-500">{p.level || "—"}</td>
          </tr>
        ))}
        {positions.length === 0 && (
          <tr>
            <td colSpan={3} className="py-4 text-gray-400 text-center">No positions yet</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default Dashboard;