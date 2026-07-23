import { useEffect, useState, useCallback } from "react";
import {
    Users,
    UserPlus,
    Search,
    Shield,
    Lock,
    Unlock,
    Trash2,
    Mail,
    X,
    Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../util/api"; 

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newUser, setNewUser] = useState({
        email: "",
        firstName: "",
        lastName: "",
        role: "CANDIDATE"
    });

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.users.getAll();
            setUsers(res.data || []);
        } catch (e) {
            toast.error("Failed to fetch users list.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleRoleChange = async (clerkId, newRole) => {
        try {
            await api.users.changeRole(clerkId, newRole);
            toast.success("Role updated successfully!");
            setUsers((prev) =>
                prev.map((u) => (u.clerkId === clerkId ? { ...u, role: newRole } : u))
            );
        } catch (e) {
            toast.error("Failed to change user role.");
        }
    };

    const handleToggleBlock = async (user) => {
        const isBlocked = user.blocked;
        try {
            if (isBlocked) {
                await api.users.unblock(user.clerkId);
                toast.success("User unblocked!");
            } else {
                await api.users.block(user.clerkId);
                toast.success("User blocked!");
            }
            setUsers((prev) =>
                prev.map((u) => (u.clerkId === user.clerkId ? { ...u, blocked: !isBlocked } : u))
            );
        } catch (e) {
            toast.error("Failed to update user block status.");
        }
    };

    const handleDeleteUser = async (clerkId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.users.delete(clerkId);
            toast.success("User deleted.");
            setUsers((prev) => prev.filter((u) => u.clerkId !== clerkId));
        } catch (e) {
            toast.error("Failed to delete user.");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.users.create(newUser);
            toast.success("User created successfully!");
            setShowCreateModal(false);
            setNewUser({ email: "", firstName: "", lastName: "", role: "CANDIDATE" });
            loadUsers();
        } catch (e) {
            toast.error("Failed to create user.");
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-amber-500" /> User Management
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Manage user roles, access control, and blocked status across the platform.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all shadow-xs"
                >
                    <UserPlus className="w-4 h-4" /> Create User
                </button>
            </div>

            {/* Search & Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-amber-500"
                    />
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                    Total: <span className="font-bold text-navy-900">{filteredUsers.length}</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="p-4">User</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredUsers.map((u) => (
                                    <tr key={u.clerkId || u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-semibold text-navy-900">
                                            {u.firstName} {u.lastName}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-gray-400" /> {u.email}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={u.role || "CANDIDATE"}
                                                onChange={(e) => handleRoleChange(u.clerkId, e.target.value)}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium focus:border-amber-500 bg-white"
                                            >
                                                <option value="CANDIDATE">CANDIDATE</option>
                                                <option value="RECRUITER">RECRUITER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                                    u.blocked
                                                        ? "bg-red-50 text-red-700"
                                                        : "bg-green-50 text-green-700"
                                                }`}
                                            >
                                                {u.blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleToggleBlock(u)}
                                                    title={u.blocked ? "Unblock User" : "Block User"}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        u.blocked
                                                            ? "text-green-600 hover:bg-green-50"
                                                            : "text-amber-600 hover:bg-amber-50"
                                                    }`}
                                                >
                                                    {u.blocked ? (
                                                        <Unlock className="w-4 h-4" />
                                                    ) : (
                                                        <Lock className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.clerkId)}
                                                    title="Delete User"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE USER MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-navy-900 text-lg">Create User</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Email *</label>
                                <input
                                    required
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-navy-900 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-900 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-navy-900 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500 bg-white"
                                >
                                    <option value="CANDIDATE">CANDIDATE</option>
                                    <option value="RECRUITER">RECRUITER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-all"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;