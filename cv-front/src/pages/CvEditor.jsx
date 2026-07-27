import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Send,
    CheckCircle2,
    AlertTriangle,
    Plus,
    X,
    Calendar,
    Briefcase,
    Check,
    FolderPlus,
    Sparkles,
    Trash2
} from "lucide-react";
import { api } from "../util/api";
import { useUserProfile } from "../context/UserProfileContext";

const CvEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile: user, isRecruiter, isAdmin } = useUserProfile();
    const canManageAll = isRecruiter || isAdmin;

    const [cv, setCv] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [availableProjects, setAvailableProjects] = useState([]);

    const loadCv = useCallback(async () => {
        if (!user?.id) return;

        try {
            const res = await api.cvs.getById(id);
            setCv(res.data);
        } catch (e) {
            setErrorMsg("Failed to load CV or access denied.");
        } finally {
            setLoading(false);
        }
    }, [id, user?.id, canManageAll]);

    useEffect(() => {
        loadCv();
    }, [loadCv]);

    const handleAttributeChange = async (attributeId, payload) => {
        try {
            const res = await api.cvs.editAttribute(cv.id, attributeId, payload);
            setCv(res.data);
        } catch (e) {
            alert("Failed to update attribute value.");
        }
    };

    const handlePublish = async () => {
        setPublishing(true);
        setErrorMsg("");
        try {
            const res = await api.cvs.publish(cv.id);
            setCv(res.data);
        } catch (e) {
            const msg = e.response?.data?.message || "Failed to publish CV. Check required fields.";
            setErrorMsg(msg);
        } finally {
            setPublishing(false);
        }
    };

    const handleOpenProjectsModal = async () => {
        try {
            const res = await api.projects.getMyProjects(cv.candidateId);
            setAvailableProjects(res.data || []);
            setShowProjectsModal(true);
        } catch (e) {
            alert("Could not fetch user projects.");
        }
    };

    const handleSaveProjects = async (selectedIds) => {
        try {
            const res = await api.cvs.setProjects(cv.id, selectedIds);
            setCv(res.data);
            setShowProjectsModal(false);
        } catch (e) {
            alert("Failed to update projects list.");
        }
    };

    if (loading) return <div className="p-8 text-gray-400">Loading CV details...</div>;
    if (!cv) return <div className="p-8 text-gray-400">{errorMsg || "CV not found"}</div>;

    const isPublished = cv.status === "PUBLISHED";
    const requiredAttrs = cv.attributeValues?.filter((a) => a.required) || [];
    const missingRequired = requiredAttrs.filter((a) => a.empty);
    const isReadyToPublish = missingRequired.length === 0;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/dashboard/cvs")}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to CVs
                </button>

                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                            }`}
                    >
                        {isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {isPublished ? "Published" : "Draft Mode"}
                    </span>

                    {!canManageAll && !isPublished && (
                        <button
                            onClick={handlePublish}
                            disabled={publishing || !isReadyToPublish}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-40 transition-all shadow-xs"
                        >
                            <Send className="w-4 h-4" /> {publishing ? "Publishing..." : "Publish CV"}
                        </button>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-coral-600 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <X className="w-4 h-4 cursor-pointer" onClick={() => setErrorMsg("")} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
                        <h1 className="text-2xl font-bold text-navy-900">{cv.positionTitle}</h1>
                        <p className="text-sm text-gray-500">
                            Candidate: <span className="font-medium text-navy-900">{cv.candidateFullName}</span>
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h2 className="text-lg font-bold text-navy-900">Position Attributes</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Fill in attributes required for this specific role. Changes are saved automatically.
                            </p>
                        </div>

                        <div className="space-y-5 divide-y divide-gray-50">
                            {cv.attributeValues?.map((attrVal) => (
                                <AttributeFieldRow
                                    key={attrVal.attributeId}
                                    attrVal={attrVal}
                                    disabled={canManageAll}
                                    onChange={(payload) => handleAttributeChange(attrVal.attributeId, payload)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">Attached Projects</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Showcase relevant experience for this role.
                                </p>
                            </div>

                            {/* {!canManageAll && (
                                <button
                                    onClick={handleOpenProjectsModal}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-navy-900 hover:bg-gray-50"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" /> Manage Projects
                                </button>
                            )} */}
                        </div>

                        <div className="space-y-3">
                            {cv.projects?.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center">No projects attached yet.</p>
                            ) : (
                                cv.projects?.map((proj) => (
                                    <div
                                        key={proj.projectId}
                                        className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-2"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-navy-900 text-sm">{proj.name}</h4>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {proj.periodStart} — {proj.periodEnd || "Present"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{proj.description}</p>

                                        {proj.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {proj.tags.map((t) => (
                                                    <span
                                                        key={t}
                                                        className="px-2 py-0.5 rounded-full bg-peach-100 text-coral-600 text-[10px] font-medium"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 sticky top-6">
                        <h3 className="font-bold text-navy-900 text-base">Publish Requirements</h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-gray-500">Required fields</span>
                                <span className="font-semibold text-navy-900">
                                    {requiredAttrs.length - missingRequired.length} / {requiredAttrs.length}
                                </span>
                            </div>

                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-amber-500 h-full transition-all duration-300"
                                    style={{
                                        width: `${requiredAttrs.length
                                                ? Math.round(
                                                    ((requiredAttrs.length - missingRequired.length) /
                                                        requiredAttrs.length) *
                                                    100
                                                )
                                                : 100
                                            }%`
                                    }}
                                />
                            </div>
                        </div>

                        {missingRequired.length > 0 ? (
                            <div className="pt-2 space-y-2">
                                <p className="text-xs font-semibold text-coral-600">Missing required attributes:</p>
                                <ul className="space-y-1">
                                    {missingRequired.map((m) => (
                                        <li key={m.attributeId} className="text-xs text-gray-500 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-coral-600 shrink-0" />
                                            {m.attributeName}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-3 bg-green-50 rounded-xl text-green-700 text-xs flex items-center gap-2">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>All required attributes filled! You can publish your CV.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showProjectsModal && (
                <ProjectsSelectorModal
                    attachedProjectIds={cv.projects?.map((p) => p.projectId) || []}
                    availableProjects={availableProjects}
                    onClose={() => setShowProjectsModal(false)}
                    onSave={handleSaveProjects}
                />
            )}
        </div>
    );
};

const AttributeFieldRow = ({ attrVal, disabled, onChange }) => {
    const [val, setVal] = useState(() => ({
        stringValue: attrVal.stringValue || "",
        numericValue: attrVal.numericValue ?? "",
        dateValue: attrVal.dateValue || "",
        periodStart: attrVal.periodStart || "",
        periodEnd: attrVal.periodEnd || "",
        booleanValue: attrVal.booleanValue ?? false,
        optionId: attrVal.optionId ?? ""
    }));

    const triggerSave = (patch) => {
        const next = { ...val, ...patch };
        setVal(next);

        onChange({
            stringValue: next.stringValue || null,
            numericValue: next.numericValue !== "" ? Number(next.numericValue) : null,
            dateValue: next.dateValue || null,
            periodStart: next.periodStart || null,
            periodEnd: next.periodEnd || null,
            booleanValue: next.booleanValue ?? null,
            optionId: next.optionId ? Number(next.optionId) : null
        });
    };

    return (
        <div className="pt-4 first:pt-0 space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-navy-900 flex items-center gap-1">
                    {attrVal.attributeName}
                    {attrVal.required && <span className="text-coral-600">*</span>}
                </label>
                <span className="text-[10px] font-mono text-gray-400 uppercase">{attrVal.dataType}</span>
            </div>

            {attrVal.dataType === "STRING" && (
                <input
                    disabled={disabled}
                    value={val.stringValue}
                    onChange={(e) => setVal({ ...val, stringValue: e.target.value })}
                    onBlur={() => triggerSave({})}
                    placeholder="Enter value..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                />
            )}

            {attrVal.dataType === "TEXT" && (
                <textarea
                    disabled={disabled}
                    rows={3}
                    value={val.stringValue}
                    onChange={(e) => setVal({ ...val, stringValue: e.target.value })}
                    onBlur={() => triggerSave({})}
                    placeholder="Enter details..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 resize-none disabled:bg-gray-50"
                />
            )}

            {attrVal.dataType === "NUMERIC" && (
                <input
                    type="number"
                    disabled={disabled}
                    value={val.numericValue}
                    onChange={(e) => setVal({ ...val, numericValue: e.target.value })}
                    onBlur={() => triggerSave({})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                />
            )}

            {attrVal.dataType === "DATE" && (
                <input
                    type="date"
                    disabled={disabled}
                    value={val.dateValue}
                    onChange={(e) => triggerSave({ dateValue: e.target.value })}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                />
            )}

            {attrVal.dataType === "PERIOD" && (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        disabled={disabled}
                        value={val.periodStart}
                        onChange={(e) => triggerSave({ periodStart: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                        type="date"
                        disabled={disabled}
                        value={val.periodEnd}
                        onChange={(e) => triggerSave({ periodEnd: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                    />
                </div>
            )}

            {attrVal.dataType === "BOOLEAN" && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                        type="checkbox"
                        disabled={disabled}
                        checked={val.booleanValue}
                        onChange={(e) => triggerSave({ booleanValue: e.target.checked })}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    Yes / Enabled
                </label>
            )}

            {attrVal.dataType === "ENUM" && (
                <select
                    disabled={disabled}
                    value={val.optionId}
                    onChange={(e) => triggerSave({ optionId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                >
                    <option value="">-- Select option --</option>
                    {attrVal.options?.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.value}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

const ProjectsSelectorModal = ({ attachedProjectIds, availableProjects, onClose, onSave }) => {
    const [selected, setSelected] = useState(attachedProjectIds);

    const toggle = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    return (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-navy-900">Select Projects for CV</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {availableProjects.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No projects in candidate profile.</p>
                    ) : (
                        availableProjects.map((p) => (
                            <label
                                key={p.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selected.includes(p.id)
                                        ? "border-amber-500/50 bg-amber-50/30"
                                        : "border-gray-100 hover:bg-gray-50"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(p.id)}
                                    onChange={() => toggle(p.id)}
                                    className="mt-1"
                                />
                                <div className="text-xs space-y-0.5">
                                    <div className="font-semibold text-navy-900">{p.name}</div>
                                    <div className="text-gray-500 line-clamp-2">{p.description}</div>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(selected)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all"
                    >
                        Save Selection ({selected.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CvEditor;