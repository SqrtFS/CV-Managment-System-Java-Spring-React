import { useEffect, useState, useCallback } from "react";
import {
    Mail,
    Shield,
    Save,
    Calendar,
    Trash2,
    Edit2,
    Plus,
    X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../util/api";
import TagAutocompleteInput from "../components/common/TagAutocompleteInput";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("projects");
    const [userData, setUserData] = useState({ firstName: "", lastName: "", email: "" });
    const [savingUser, setSavingUser] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectForm, setProjectForm] = useState({
        name: "", description: "", periodStart: "", periodEnd: "", tags: []
    });

    const [profileValues, setProfileValues] = useState([]);
    const [allAttributes, setAllAttributes] = useState([]);
    const [newValAttributeId, setNewValAttributeId] = useState("");
    const [newValValue, setNewValValue] = useState("");

    const selectedAttr = allAttributes.find((a) => a.id === Number(newValAttributeId));


    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const userRes = await api.users.me();
            const userDataObj = userRes.data;
            setUser(userDataObj);
            setUserData({
                firstName: userDataObj.firstName || "",
                lastName: userDataObj.lastName || "",
                email: userDataObj.email || ""
            });


            if (userDataObj.clerkId) {
                const [pvRes, projRes, attrRes] = await Promise.allSettled([
                    api.profileValues.getByClerkId(userDataObj.clerkId),
                    api.projects.getMine(),
                    api.attributes.getAll()
                ]);

                if (pvRes.status === "fulfilled") setProfileValues(pvRes.value.data || []);
                if (projRes.status === "fulfilled") setProjects(projRes.value.data || []);
                if (attrRes.status === "fulfilled") setAllAttributes(attrRes.value.data || []);
            }
        } catch (e) {
            toast.error("Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);


    const handleSavePersonal = async (e) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            await api.users.update(user.clerkId, userData);
            toast.success("Profile details updated successfully!");
        } catch (e) {
            toast.error("Failed to update profile details.");
            console.log(user.clerkId)
            console.log(userData)
        } finally {
            setSavingUser(false);
        }
    };


    const handleOpenProjectModal = (proj = null) => {
        if (proj) {
            setEditingProject(proj);
            setProjectForm({
                name: proj.name || "",
                description: proj.description || "",
                periodStart: proj.periodStart || "",
                periodEnd: proj.periodEnd || "",
                tags: proj.tags || [],
                version: proj.version,
            });
        } else {
            setEditingProject(null);
            setProjectForm({ name: "", description: "", periodStart: "", periodEnd: "", tags: [] });
        }
        setShowProjectModal(true);
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();
        const payload = { ...projectForm };
        try {
            if (editingProject) {
                await api.projects.update(editingProject.id, payload);
                toast.success("Project updated!");
            } else {
                await api.projects.create(payload);
                toast.success("Project created!");
            }
            setShowProjectModal(false);
            const projRes = await api.projects.getMine();
            setProjects(projRes.data || []);
        } catch (e) {
            if (e.response?.status === 409) {
                toast.error("This project was updated elsewhere — refresh and try again.");
            } else {
                toast.error("Failed to save project.");
            }
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.projects.delete(id);
            toast.success("Project deleted.");
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            toast.error("Failed to delete project.");
        }
    };


    const handleAddProfileValue = async (e) => {
        e.preventDefault();
        if (!newValAttributeId || !newValValue) {
            toast.error("Please select an attribute and enter a value.");
            return;
        }

        const attr = allAttributes.find((a) => a.id === Number(newValAttributeId));
        if (!attr) return;

        const basePayload = { attributeId: Number(newValAttributeId) };
        let payload;

        switch (attr.dataType) {
            case "ENUM":
                payload = { ...basePayload, optionId: Number(newValValue) };
                break;
            case "NUMERIC":
                payload = { ...basePayload, numericValue: Number(newValValue) };
                break;
            case "BOOLEAN":
                payload = { ...basePayload, booleanValue: newValValue === "true" };
                break;
            case "DATE":
                payload = { ...basePayload, dateValue: newValValue };
                break;
            default:
                payload = { ...basePayload, stringValue: newValValue };
        }

        try {
            await api.profileValues.save(user.clerkId, payload);
            toast.success("Profile value saved!");
            setNewValAttributeId("");
            setNewValValue("");
            const pvRes = await api.profileValues.getByClerkId(user.clerkId);
            setProfileValues(pvRes.data || []);
        } catch (e) {
            toast.error(e.response?.data || "Failed to save profile value.");
        }
    };

    const handleRemoveProfileValue = async (attributeId) => {
        try {
            await api.profileValues.remove(user.clerkId, attributeId);
            toast.success("Profile value removed.");
            setProfileValues((prev) => prev.filter((pv) => pv.attributeId !== attributeId));
        } catch (e) {
            toast.error("Failed to remove profile value.");
        }
    };

    if (loading) return <div className="p-8 text-gray-400">Loading profile...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-2xl">
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-navy-900">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                            <Mail className="w-3.5 h-3.5" /> {user?.email}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-900/5 text-navy-900 border border-navy-900/10 flex items-center gap-1.5 uppercase tracking-wide">
                        <Shield className="w-3.5 h-3.5 text-amber-500" /> {user?.role || "CANDIDATE"}
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 space-x-6 text-sm font-medium">
                {/* <button
                    onClick={() => setActiveTab("general")}
                    className={`pb-3 transition-all ${activeTab === "general"
                        ? "border-b-2 border-amber-500 text-amber-600 font-semibold"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Personal Details
                </button> */}
                <button
                    onClick={() => setActiveTab("projects")}
                    className={`pb-3 transition-all ${activeTab === "projects"
                        ? "border-b-2 border-amber-500 text-amber-600 font-semibold"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    My Projects ({projects.length})
                </button>
                <button
                    onClick={() => setActiveTab("attributes")}
                    className={`pb-3 transition-all ${activeTab === "attributes"
                        ? "border-b-2 border-amber-500 text-amber-600 font-semibold"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Profile Values ({profileValues.length})
                </button>
            </div>

            {/* TAB 1: GENERAL DETAILS
            {activeTab === "general" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <h2 className="text-lg font-bold text-navy-900 border-b border-gray-100 pb-3">Basic Information</h2>
                    <form onSubmit={handleSavePersonal} className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={userData.firstName}
                                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={userData.lastName}
                                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-navy-900 mb-1">Email Address</label>
                            <input
                                type="email"
                                disabled
                                value={userData.email}
                                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Managed via Clerk authentication.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={savingUser}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all shadow-xs"
                        >
                            <Save className="w-4 h-4" /> {savingUser ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            )} */}

            {/* TAB 2: MY PROJECTS */}
            {activeTab === "projects" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-navy-900">Portfolio Projects</h2>
                            <p className="text-xs text-gray-400">Add projects to attach to your CVs later.</p>
                        </div>
                        <button
                            onClick={() => handleOpenProjectModal()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Project
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.length === 0 ? (
                            <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
                                No projects added yet. Click "Add Project" to get started.
                            </div>
                        ) : (
                            projects.map((proj) => (
                                <div
                                    key={proj.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 relative group"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-navy-900 text-base">{proj.name}</h3>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleOpenProjectModal(proj)}
                                                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy-900"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProject(proj.id)}
                                                className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600 leading-relaxed">{proj.description}</p>

                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            {proj.periodStart} — {proj.periodEnd || "Present"}
                                        </span>
                                    </div>

                                    {proj.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {proj.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: PROFILE VALUES */}
            {activeTab === "attributes" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-navy-900">Global Profile Values</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Set defaults for attributes that automatically pre-fill in your CVs.
                        </p>
                    </div>

                    <form onSubmit={handleAddProfileValue} className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-navy-900">Select Attribute</label>
                            <select
                                value={newValAttributeId}
                                onChange={(e) => { setNewValAttributeId(e.target.value); setNewValValue(""); }}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 bg-white"
                            >
                                <option value="">-- Choose attribute --</option>
                                {allAttributes.map((attr) => (
                                    <option key={attr.id} value={attr.id}>
                                        {attr.name} ({attr.dataType})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-navy-900">Value</label>
                            {!selectedAttr ? (
                                <input disabled placeholder="Select an attribute first"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-400" />
                            ) : selectedAttr.dataType === "ENUM" ? (
                                <select value={newValValue} onChange={(e) => setNewValValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                                    <option value="">-- Select value --</option>
                                    {selectedAttr.options?.map((o) => (
                                        <option key={o.id} value={o.id}>{o.value}</option>
                                    ))}
                                </select>
                            ) : selectedAttr.dataType === "BOOLEAN" ? (
                                <select value={newValValue} onChange={(e) => setNewValValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                                    <option value="">-- Select --</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            ) : selectedAttr.dataType === "NUMERIC" ? (
                                <input type="number" value={newValValue} onChange={(e) => setNewValValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                            ) : selectedAttr.dataType === "DATE" ? (
                                <input type="date" value={newValValue} onChange={(e) => setNewValValue(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                            ) : (
                                <input type="text" value={newValValue} onChange={(e) => setNewValValue(e.target.value)}
                                    placeholder="Value..."
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                            )}
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-medium transition-all"
                        >
                            Save Value
                        </button>
                    </form>

                    <div className="space-y-2 divide-y divide-gray-100">
                        {profileValues.length === 0 ? (
                            <p className="text-xs text-gray-400 py-4 text-center">No profile values set yet.</p>
                        ) : (
                            profileValues.map((pv) => {
                                const displayValue =
                                    pv.stringValue ??
                                    pv.optionValue ??
                                    pv.numericValue ??
                                    (pv.booleanValue !== null && pv.booleanValue !== undefined
                                        ? (pv.booleanValue ? "Yes" : "No")
                                        : null) ??
                                    pv.dateValue ??
                                    (pv.periodStart ? `${pv.periodStart} — ${pv.periodEnd || "Present"}` : null) ??
                                    pv.imageUrl ??
                                    "N/A";

                                return (
                                    <div key={pv.attributeId} className="pt-3 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-semibold text-navy-900">
                                                {pv.attributeName || `Attribute #${pv.attributeId}`}
                                            </div>
                                            <div className="text-sm text-gray-700">{displayValue}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveProfileValue(pv.attributeId)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* PROJECT MODAL */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-navy-900 text-lg">
                                {editingProject ? "Edit Project" : "Add New Project"}
                            </h3>
                            <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Project Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    placeholder="e.g. E-Commerce Platform"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 resize-none"
                                    placeholder="Short summary of your contributions..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-navy-900 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.periodStart}
                                        onChange={(e) => setProjectForm({ ...projectForm, periodStart: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-900 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.periodEnd}
                                        onChange={(e) => setProjectForm({ ...projectForm, periodEnd: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Tags</label>
                                <TagAutocompleteInput
                                    tags={projectForm.tags}
                                    onChange={(tags) => setProjectForm({ ...projectForm, tags })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all"
                                >
                                    Save Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 