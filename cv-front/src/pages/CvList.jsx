import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    FileText,
    Heart,
    Trash2,
    CheckCircle2,
    Clock,
    Sparkles,
    X,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { api } from "../util/api";
import { useUserProfile } from "../context/UserProfileContext";

const CvList = () => {
    const navigate = useNavigate();
    const { profile: user, isCandidate, isRecruiter, isAdmin } = useUserProfile();

    const canManageAll = isRecruiter || isAdmin;

    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadCvs = useCallback(async () => {
        if (canManageAll) return;
        setLoading(true);
        try {
            const res = await api.cvs.getMine();
            setCvs(res.data || []);
        } catch (e) {
            console.error("Failed to load CVs", e);
        } finally {
            setLoading(false);
        }
    }, [canManageAll]);

    useEffect(() => {
        loadCvs();
    }, [loadCvs]);

    const handleDelete = async (e, cvId) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this CV?")) return;
        try {
            await api.cvs.delete(cvId);
            setCvs((prev) => prev.filter((item) => item.id !== cvId));
        } catch (err) {
            alert("Failed to delete CV");
        }
    };

    const handleToggleLike = async (e, cv) => {
        e.stopPropagation();
        try {
            const res = cv.likedByMe ? await api.cvs.unlike(cv.id) : await api.cvs.like(cv.id);
            setCvs((prev) =>
                prev.map((c) =>
                    c.id === cv.id
                        ? { ...c, likesCount: res.data.likesCount, likedByMe: !c.likedByMe }
                        : c
                )
            );
        } catch (err) {
            console.error("Like toggle error", err);
        }
    };

    const filteredCvs = cvs.filter((cv) => {
        const matchesSearch = cv.positionTitle?.toLowerCase().includes(search.toLowerCase()) ||
            cv.candidateFullName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === "ALL" || cv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (canManageAll) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto">
                <FileText className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900">Use search to find CVs</h3>
                <p className="text-gray-400 text-sm mt-1">
                    As a recruiter/admin, browse CVs via a position's "CVs" tab or the header search.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Curriculum Vitae</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your tailored CVs for positions</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={!user?.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> Create CV
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by position or name..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                    {["ALL", "DRAFT", "PUBLISHED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                filterStatus === st
                                    ? "bg-white text-navy-900 shadow-xs"
                                    : "text-gray-500 hover:text-navy-900"
                            }`}
                        >
                            {st === "ALL" ? "All" : st === "DRAFT" ? "Drafts" : "Published"}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading CVs...</div>
            ) : filteredCvs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto">
                    <FileText className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                    <h3 className="font-semibold text-navy-900">No CVs found</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {search ? "Try adjusting your search criteria." : "Get started by creating your first CV."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCvs.map((cv) => (
                        <CvCard
                            key={cv.id}
                            cv={cv}
                            onOpen={() => navigate(`/dashboard/cvs/${cv.id}`)}
                            onDelete={(e) => handleDelete(e, cv.id)}
                        />
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateCvModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(newCvId) => navigate(`/dashboard/cvs/${newCvId}`)}
                />
            )}
        </div>
    );
};

const CvCard = ({ cv, onOpen, onDelete }) => {
    const isPublished = cv.status === "PUBLISHED";
    const requiredCount = cv.attributeValues?.filter((a) => a.required).length || 0;
    const filledRequiredCount = cv.attributeValues?.filter((a) => a.required && !a.empty).length || 0;
    const progressPct = requiredCount > 0 ? Math.round((filledRequiredCount / requiredCount) * 100) : 100;

    return (
        <div
            onClick={onOpen}
            className="group bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
        >
            <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}
                    >
                        {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-500">
                        <Heart className="w-3.5 h-3.5" /> {cv.likesCount || 0}
                    </span>
                </div>

                <h3 className="font-bold text-navy-900 text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
                    {cv.positionTitle || "Untitled Position"}
                </h3>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Required fields</span>
                        <span className="font-medium text-navy-900">
                            {filledRequiredCount} / {requiredCount}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${
                                progressPct === 100 ? "bg-green-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Updated {new Date(cv.updatedAt || Date.now()).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-gray-400 hover:text-coral-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete CV"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-navy-900 group-hover:translate-x-0.5 transition-transform font-medium flex items-center gap-0.5 ml-1">
                        Edit <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </div>
    );
};

const CreateCvModal = ({ onClose, onCreated }) => {
    const [positions, setPositions] = useState([]);
    const [selectedPositionId, setSelectedPositionId] = useState("");
    const [loadingPositions, setLoadingPositions] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.positions.getAll()
            .then((res) => setPositions(res.data?.content || res.data || []))
            .catch(() => setError("Failed to load positions list"))
            .finally(() => setLoadingPositions(false));
    }, []);

    const handleCreate = async () => {
        if (!selectedPositionId) return;
        setCreating(true);
        setError("");
        try {
            const res = await api.cvs.create(Number(selectedPositionId));
            onCreated(res.data.id);
        } catch (err) {
            const msg = err.response?.data?.message || "Cannot create CV for this position.";
            setError(msg);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" /> Choose Position for CV
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-coral-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Target Position</label>
                    {loadingPositions ? (
                        <div className="text-xs text-gray-400 py-3">Loading open positions...</div>
                    ) : (
                        <select
                            value={selectedPositionId}
                            onChange={(e) => setSelectedPositionId(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                        >
                            <option value="">-- Select position --</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} {p.company ? `(${p.company})` : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!selectedPositionId || creating}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50 transition-all"
                    >
                        {creating ? "Creating..." : "Start CV"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CvList;