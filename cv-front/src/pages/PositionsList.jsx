import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Copy } from "lucide-react";
import { api } from "../util/api";
import { useUserProfile } from "../context/UserProfileContext";

const PositionsList = () => {
  const [positions, setPositions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const { isRecruiter, isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const canManage = isRecruiter || isAdmin;

  const load = () => {
    api.positions.getAll({ page: 0, size: 50 }).then((res) => setPositions(res.data.content || []));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    const res = await api.positions.create({ title: "New Position", isPublic: true, maxProjects: 3 });
    navigate(`/dashboard/positions/${res.data.id}`);
  };

  const handleDuplicate = async () => {
    const [id] = selected;
    if (!id) return;
    await api.positions.duplicate(id);
    setSelected(new Set());
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Positions</h1>

        {canManage && (
          <div className="flex gap-2">
            {selected.size === 1 && (
              <button
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-slate-700 hover:bg-gray-50 text-sm font-medium"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
            )}
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> New Position
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr className="text-left">
              {canManage && <th className="p-4 w-10"></th>}
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium">Level</th>
              <th className="p-4 font-medium">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                {canManage && (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                )}
                <td className="p-4">
                  <Link to={`/dashboard/positions/${p.id}`} className="font-medium text-slate-900 hover:text-orange-500">
                    {p.title}
                  </Link>
                </td>
                <td className="p-4 text-gray-500">{p.company || "—"}</td>
                <td className="p-4 text-gray-500">{p.level || "—"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.public ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {p.public ? "Public" : "Restricted"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsList;