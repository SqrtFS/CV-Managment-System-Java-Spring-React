
import { useEffect, useState, useCallback } from "react";
import { Plus, X, Trash2, Edit2, Clock, FolderTree, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../util/api";

const DATA_TYPES = ["STRING", "TEXT", "IMAGE", "NUMERIC", "DATE", "PERIOD", "BOOLEAN", "ENUM"];

const AttributeLibrary = () => {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [recentlyUsed, setRecentlyUsed] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);

    const [showAttrModal, setShowAttrModal] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState("");

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, recentRes] = await Promise.all([
                api.attributes.getCategories(),
                api.attributes.recentlyUsed(5),
            ]);
            setCategories(catRes.data || []);
            setRecentlyUsed(recentRes.data || []);
            await loadAttributes(selectedCategoryId, prefix);
        } catch (e) {
            toast.error("Failed to load attribute library");
        } finally {
            setLoading(false);
        }
    
    }, []);

    const loadAttributes = async (categoryId, prefixValue) => {
        const res = categoryId || prefixValue
            ? await api.attributes.search(categoryId || null, prefixValue || null)
            : await api.attributes.getAll();
        setAttributes(res.data || []);
    };

    useEffect(() => { loadAll(); }, [loadAll]);
    useEffect(() => { loadAttributes(selectedCategoryId, prefix); }, [selectedCategoryId, prefix]);

    const openCategoryModal = (cat = null) => {
        setEditingCategory(cat);
        setCategoryName(cat?.name || "");
        setShowCategoryModal(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.attributes.updateCategory(editingCategory.id, { name: categoryName });
                toast.success("Category updated");
            } else {
                await api.attributes.createCategory({ name: categoryName });
                toast.success("Category created");
            }
            setShowCategoryModal(false);
            const res = await api.attributes.getCategories();
            setCategories(res.data || []);
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to save category");
        }
    };

    const deleteCategory = async (id) => {
        if (!confirm("Delete this category? (only possible if it has no attributes)")) return;
        try {
            await api.attributes.deleteCategory(id);
            toast.success("Category deleted");
            setCategories((prev) => prev.filter((c) => c.id !== id));
            if (selectedCategoryId === id) setSelectedCategoryId(null);
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to delete category (it may still have attributes)");
        }
    };


    const openAttrModal = (attr = null) => {
        setEditingAttr(attr);
        setShowAttrModal(true);
    };

    const handleSavedAttribute = async () => {
        setShowAttrModal(false);
        await loadAttributes(selectedCategoryId, prefix);
    };

    const deleteAttribute = async (id) => {
        if (!confirm("Delete this attribute? It will be removed from all positions/profiles using it.")) return;
        try {
            await api.attributes.delete(id);
            toast.success("Attribute deleted");
            setAttributes((prev) => prev.filter((a) => a.id !== id));
        } catch (e) {
            toast.error("Failed to delete attribute");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Attribute Library</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Reusable fields shared across positions, profiles, and CVs.
                    </p>
                </div>
                <button
                    onClick={() => openAttrModal()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all shadow-xs"
                >
                    <Plus className="w-4 h-4" /> New Attribute
                </button>
            </div>

            {recentlyUsed.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5" /> Recently used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {recentlyUsed.map((a) => (
                            <span key={a.id} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                                {a.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Категории */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 h-fit">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-1.5">
                            <FolderTree className="w-4 h-4 text-amber-500" /> Categories
                        </h3>
                        <button onClick={() => openCategoryModal()} className="text-gray-400 hover:text-navy-900">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedCategoryId(null)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                            selectedCategoryId === null ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                        All categories
                    </button>

                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors group ${
                                selectedCategoryId === c.id ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-gray-50 text-gray-600"
                            }`}
                        >
                            <button onClick={() => setSelectedCategoryId(c.id)} className="flex-1 text-left">
                                {c.name}
                            </button>
                            <div className="hidden group-hover:flex items-center gap-1">
                                <Edit2 className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-navy-900" onClick={() => openCategoryModal(c)} />
                                <Trash2 className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-red-600" onClick={() => deleteCategory(c.id)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Атрибуты */}
                <div className="lg:col-span-3 space-y-3">
                    <input
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="Search attributes by prefix..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                    />

                    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                        ) : attributes.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No attributes found</div>
                        ) : (
                            attributes.map((a) => (
                                <div key={a.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-navy-900 text-sm">{a.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{a.description}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400 uppercase">{a.dataType}</span>
                                        <button onClick={() => openAttrModal(a)} className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-50 rounded-lg">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteAttribute(a.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showCategoryModal && (
                <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-navy-900">{editingCategory ? "Edit Category" : "New Category"}</h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={saveCategory} className="space-y-4">
                            <input
                                required
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Soft Skills"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCategoryModal(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAttrModal && (
                <AttributeModal
                    attribute={editingAttr}
                    categories={categories}
                    onClose={() => setShowAttrModal(false)}
                    onSaved={handleSavedAttribute}
                />
            )}
        </div>
    );
};

const AttributeModal = ({ attribute, categories, onClose, onSaved }) => {
    const isEdit = !!attribute;
    const [form, setForm] = useState({
        name: attribute?.name || "",
        description: attribute?.description || "",
        categoryId: attribute?.categoryId || (categories[0]?.id ?? ""),
        dataType: attribute?.dataType || "STRING",
        version: attribute?.version,
    });
    const [options, setOptions] = useState(attribute?.options?.map((o) => o.value) || []);
    const [optionInput, setOptionInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const addOption = () => {
        const v = optionInput.trim();
        if (v && !options.includes(v)) setOptions([...options, v]);
        setOptionInput("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = {
                name: form.name,
                description: form.description,
                categoryId: Number(form.categoryId),
                dataType: form.dataType,
                options: form.dataType === "ENUM" ? options.map((v) => ({ value: v })) : [],
            };

            if (isEdit) {
                await api.attributes.update(attribute.id, { ...payload, version: form.version });
            } else {
                await api.attributes.create(payload);
            }
            onSaved();
        } catch (err) {
            if (err.response?.status === 409) {
                setError("This attribute was changed by someone else. Reload and try again.");
            } else {
                setError(err.response?.data?.message || "Failed to save attribute");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-navy-900 text-lg">{isEdit ? "Edit Attribute" : "New Attribute"}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-coral-600 text-xs">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-navy-900 mb-1">Name *</label>
                        <input
                            required
                            disabled={isEdit}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 disabled:bg-gray-50"
                            placeholder="e.g. English Level"
                        />
                        {isEdit && <p className="text-[11px] text-gray-400 mt-1">Name cannot be changed after creation.</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-navy-900 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-navy-900 mb-1">Category *</label>
                            <select
                                required
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 bg-white"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-navy-900 mb-1">Data Type *</label>
                            <select
                                disabled={isEdit}
                                value={form.dataType}
                                onChange={(e) => setForm({ ...form, dataType: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 bg-white disabled:bg-gray-50"
                            >
                                {DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {form.dataType === "ENUM" && (
                        <div>
                            <label className="block text-xs font-semibold text-navy-900 mb-1">Options</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {options.map((o) => (
                                    <span key={o} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-peach-100 text-coral-600 text-xs font-medium">
                                        {o}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setOptions(options.filter((x) => x !== o))} />
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={optionInput}
                                    onChange={(e) => setOptionInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                                    placeholder="Add option and press Enter"
                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50">
                            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttributeLibrary;