import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Plus, X, Send, Copy, Trash2, Save } from "lucide-react";
import { api } from "../util/api";
import { useUserProfile } from "../context/UserProfileContext";
import ReactMarkdown from "react-markdown";
import { getStompClient } from "../util/ws";

const TABS = ["Overview", "Attributes", "Access Rules", "CVs", "Discussion"];

const PositionDetail = () => {
    const { id } = useParams();
    const { isRecruiter, isAdmin } = useUserProfile();
    const canManage = isRecruiter || isAdmin;

    const [position, setPosition] = useState(null);
    const [tab, setTab] = useState("Overview");
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        api.positions.getById(id).then((res) => setPosition(res.data)).finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="text-gray-400 p-6">Loading...</div>;
    if (!position) return <div className="text-gray-400 p-6">Position not found</div>;

    return (
        <div className="space-y-6">
            <PositionHeader position={position} canManage={canManage} onChange={load} />

            <div className="flex gap-1 border-b border-gray-200">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t
                            ? "border-amber-500 text-navy-900"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "Overview" && <OverviewTab position={position} canManage={canManage} onSaved={load} />}
            {tab === "Attributes" && <AttributesTab position={position} canManage={canManage} onSaved={load} />}
            {tab === "Access Rules" && <AccessRulesTab position={position} canManage={canManage} onSaved={load} />}
            {tab === "CVs" && canManage && <PositionCvsTab positionId={id} />}
            {tab === "Discussion" && <DiscussionTab positionId={id} />}
        </div>
    );
};

/* ---------- Header ---------- */

const PositionHeader = ({ position, canManage, onChange }) => {
    const handleDuplicate = async () => {
        await api.positions.duplicate(position.id);
        onChange();
    };
    const handleDelete = async () => {
        if (!confirm("Delete this position?")) return;
        await api.positions.delete(position.id);
        window.history.back();
    };

    return (
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-navy-900">{position.title}</h1>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${position.public ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-700"
                        }`}>
                        {position.public ? "Public" : "Restricted"}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mt-1 max-w-2xl">{position.shortDescription}</p>
            </div>

            {canManage && (
                <div className="flex gap-2 shrink-0">
                    <button onClick={handleDuplicate} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-navy-900 hover:bg-gray-50">
                        <Copy className="w-4 h-4" /> Duplicate
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

/* ---------- Overview: basic info + project tags/maxProjects ---------- */

const OverviewTab = ({ position, canManage, onSaved }) => {
    const [form, setForm] = useState({
        title: position.title,
        shortDescription: position.shortDescription || "",
        company: position.company || "",
        level: position.level || "",
        isPublic: position.public,
        maxProjects: position.maxProjects ?? 3,
    });
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState(position.relevantProjectTags || []);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await api.positions.update(position.id, { ...form, version: position.version });
            await api.positions.setProjectTags(position.id, { tags });
            onSaved();
        } catch (e) {
            if (e.response?.status === 409) alert("Someone else updated this position — refresh and retry.");
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        const v = tagInput.trim();
        if (v && !tags.includes(v)) setTags([...tags, v]);
        setTagInput("");
    };

    if (!canManage) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 grid grid-cols-2 gap-4 text-sm">
                <Field label="Company" value={position.company || "—"} />
                <Field label="Level" value={position.level || "—"} />
                <Field label="Max projects in CV" value={position.maxProjects} />
                <Field label="Tags" value={(position.projectTags || []).join(", ") || "—"} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 max-w-2xl">
            <LabeledInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <LabeledTextarea label="Short description" value={form.shortDescription} onChange={(v) => setForm({ ...form, shortDescription: v })} />
            <div className="grid grid-cols-2 gap-4">
                <LabeledInput label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Level</label>
                    <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                        <option value="">—</option>
                        {["Junior", "Middle", "Senior", "C-level"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                    Public position
                </label>
                <LabeledInput label="Max projects" type="number" value={form.maxProjects}
                    onChange={(v) => setForm({ ...form, maxProjects: Number(v) })} className="w-28" />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Project tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-peach-100 text-coral-600 text-xs font-medium">
                            {t}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))} />
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="Add tag and press Enter"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                </div>
            </div>

            <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </button>
        </div>
    );
};

const Field = ({ label, value }) => (
    <div>
        <div className="text-gray-400 text-xs mb-0.5">{label}</div>
        <div className="text-navy-900 font-medium">{value}</div>
    </div>
);
const LabeledInput = ({ label, className = "", ...props }) => (
    <div className={className}>
        <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
        <input {...props} onChange={(e) => props.onChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
    </div>
);
const LabeledTextarea = ({ label, ...props }) => (
    <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
        <textarea {...props} onChange={(e) => props.onChange(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
    </div>
);

/* ---------- Attributes: attach/detach from library ---------- */

const AttributesTab = ({ position, canManage, onSaved }) => {
    const [library, setLibrary] = useState([]);
    const [prefix, setPrefix] = useState("");
    const [selected, setSelected] = useState(() => {
        const map = new Map();
        (position.attributes || []).forEach((a) => map.set(a.attributeId, a.required));
        return map;
    });

    useEffect(() => {
        if (!canManage) return;
        const request = prefix ? api.attributes.search(null, prefix) : api.attributes.getAll();
        request.then((res) => setLibrary(res.data));
    }, [prefix, canManage]);

    const toggle = (attrId) => {
        setSelected((prev) => {
            const next = new Map(prev);
            next.has(attrId) ? next.delete(attrId) : next.set(attrId, false);
            return next;
        });
    };

    const toggleRequired = (attrId) => {
        setSelected((prev) => {
            const next = new Map(prev);
            next.set(attrId, !next.get(attrId));
            return next;
        });
    };

    const save = async () => {
        await api.positions.setAttributes(position.id, {
            attributes: Array.from(selected.entries()).map(([attributeId, required]) => ({
                attributeId,
                required,
            })),
        });
        onSaved();
    };

    if (!canManage) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-50">
                {(position.attributes || []).map((a) => (
                    <div key={a.attributeId} className="p-4 flex justify-between items-center text-sm">
                        <span className="text-navy-900 font-medium">{a.attributeName}</span>
                        <div className="flex items-center gap-2">
                            {a.required && (
                                <span className="text-xs text-coral-600 font-medium">Required</span>
                            )}
                            <span className="text-gray-400">{a.dataType}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="font-semibold text-navy-900 mb-3 text-sm">Attribute library</h3>
                <input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Search by prefix..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3" />
                <div className="max-h-96 overflow-y-auto space-y-1">
                    {library.map((a) => (
                        <label key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
                            <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                            {a.name} <span className="text-gray-400 text-xs">({a.dataType})</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <h3 className="font-semibold text-navy-900 mb-3 text-sm">Selected ({selected.size})</h3>
                <div className="space-y-1 mb-4">
                    {library
                        .filter((a) => selected.has(a.id))
                        .map((a) => (
                            <div key={a.id} className="flex items-center justify-between text-sm px-2 py-1.5">
                                <span>{a.name}</span>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-1 text-xs text-gray-500">
                                        <input
                                            type="checkbox"
                                            checked={selected.get(a.id) || false}
                                            onChange={() => toggleRequired(a.id)}
                                        />
                                        required
                                    </label>
                                    <X className="w-3.5 h-3.5 cursor-pointer text-gray-400" onClick={() => toggle(a.id)} />
                                </div>
                            </div>
                        ))}
                </div>
                <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                    <Save className="w-4 h-4" /> Save attributes
                </button>
            </div>
        </div>
    );
};

/* ---------- Access Rules ---------- */
const OPERATORS_BY_TYPE = {
    STRING: ["EQ", "NEQ"],
    TEXT: [],
    NUMERIC: ["GT", "GTE", "LT", "LTE", "EQ", "NEQ"],
    DATE: ["GT", "GTE", "LT", "LTE", "EQ"],
    PERIOD: [],
    BOOLEAN: ["IS_TRUE", "IS_FALSE"],
    ENUM: ["EQ", "NEQ", "IN"],
    IMAGE: [],
};

const AccessRulesTab = ({ position, canManage, onSaved }) => {
    const [rules, setRules] = useState(position.accessRules || []);
    const [attrs, setAttrs] = useState([]);

    useEffect(() => { api.attributes.getAll().then((res) => setAttrs(res.data)); }, []);

    const addRule = () => setRules([...rules, { attributeId: "", operator: "", value: "" }]);
    const updateRule = (i, patch) => setRules(rules.map((r, idx) => idx === i ? { ...r, ...patch } : r));
    const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));

    const save = async () => {
        await api.positions.setAccessRules(position.id, { rules });
        onSaved();
    };

    if (!canManage) {
        return <div className="text-sm text-gray-500">Access rules are managed by recruiters.</div>;
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 max-w-3xl">
            {rules.length === 0 && <p className="text-sm text-gray-400">No restrictions — position is fully public.</p>}
            {rules.map((rule, i) => {
                const attr = attrs.find((a) => a.id === rule.attributeId);
                const ops = OPERATORS_BY_TYPE[attr?.dataType] || [];
                return (
                    <div key={i} className="flex items-center gap-2">
                        <select value={rule.attributeId} onChange={(e) => updateRule(i, { attributeId: e.target.value, operator: "" })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1">
                            <option value="">Select attribute...</option>
                            {attrs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select value={rule.operator} onChange={(e) => updateRule(i, { operator: e.target.value })}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-40">
                            <option value="">Operator...</option>
                            {ops.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <input value={rule.value} onChange={(e) => updateRule(i, { value: e.target.value })}
                            placeholder="Value" className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-32" />
                        <X className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => removeRule(i)} />
                    </div>
                );
            })}
            <div className="flex gap-2 pt-2">
                <button onClick={addRule} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-navy-900 hover:bg-gray-50">
                    <Plus className="w-4 h-4" /> Add rule
                </button>
                <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                    <Save className="w-4 h-4" /> Save rules
                </button>
            </div>
        </div>
    );
};

/* ---------- CVs list for this position (Recruiter/Admin only) ---------- */

const PositionCvsTab = ({ positionId }) => {
    const [cvs, setCvs] = useState([]);
    useEffect(() => {
        api.positions.getById(positionId).then((res) => setCvs(res.data.cvs || []));
    }, [positionId]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                    <tr className="text-left">
                        <th className="p-4 font-medium">Candidate</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Likes</th>
                    </tr>
                </thead>
                <tbody>
                    {cvs.map((cv) => (
                        <tr key={cv.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                            <td className="p-4 font-medium text-navy-900">{cv.candidateName}</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cv.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {cv.published ? "Published" : "Draft"}
                                </span>
                            </td>
                            <td className="p-4 text-gray-500">{cv.likesCount}</td>
                        </tr>
                    ))}
                    {cvs.length === 0 && (
                        <tr><td colSpan={3} className="p-6 text-center text-gray-400">No CVs yet</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

/* ---------- Discussion (polling every 3s; swap to WS once endpoint confirmed) ---------- */

const DiscussionTab = ({ positionId }) => {
    const [posts, setPosts] = useState([]);
    const [text, setText] = useState("");
    const subRef = useRef(null);

    const load = useCallback(() => {
        api.discussions.list(positionId).then((res) => setPosts(res.data));
    }, [positionId]);

    useEffect(() => {
        load();

        const client = getStompClient();

        const subscribe = () => {
            subRef.current = client.subscribe(
                `/topic/positions/${positionId}/discussion`,
                (message) => {
                    const post = JSON.parse(message.body);
                    setPosts((prev) => [...prev, post]);
                }
            );
        };

        if (client.connected) {
            subscribe();
        } else {
            client.onConnect = subscribe;
        }

        return () => {
            subRef.current?.unsubscribe();
        };
    }, [positionId, load]);

    const send = async () => {
        if (!text.trim()) return;
        await api.discussions.post(positionId, text);
        setText("");
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 flex flex-col max-w-2xl">
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {posts.map((p) => (
                    <div key={p.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-navy-900">{p.authorName}</span>
                            <span className="text-gray-400 text-xs">{new Date(p.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 prose prose-sm max-w-none">
                            <ReactMarkdown>{p.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && <p className="text-gray-400 text-sm">No messages yet</p>}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Write a message... (Markdown supported)"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                <button onClick={send} className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PositionDetail;