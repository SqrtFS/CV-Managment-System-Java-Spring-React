import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Briefcase, FileText, Heart } from "lucide-react";
import { api } from "../util/api";
import { useUserProfile } from "../context/UserProfileContext";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const { isRecruiter, isAdmin } = useUserProfile();
    const canSearchCvs = isRecruiter || isAdmin;

    const [positions, setPositions] = useState([]);
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query.trim()) {
            setPositions([]);
            setCvs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const requests = [api.search.positions(query)];
        if (canSearchCvs) requests.push(api.search.cvs(query));

        Promise.allSettled(requests).then(([posRes, cvRes]) => {
            setPositions(posRes.status === "fulfilled" ? posRes.value.data || [] : []);
            if (cvRes) setCvs(cvRes.status === "fulfilled" ? cvRes.value.data || [] : []);
            setLoading(false);
        });
    }, [query, canSearchCvs]);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-navy-900">Search results</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {query ? (
                        <>Showing results for <span className="font-medium text-navy-900">"{query}"</span></>
                    ) : (
                        "Enter a search term in the header above"
                    )}
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Searching...</div>
            ) : (
                <>
                    <section className="space-y-3">
                        <h2 className="font-semibold text-navy-900 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-amber-500" /> Positions ({positions.length})
                        </h2>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr className="text-left">
                                        <th className="p-4 font-medium">Title</th>
                                        <th className="p-4 font-medium">Company</th>
                                        <th className="p-4 font-medium">Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map((p) => (
                                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <Link
                                                    to={`/dashboard/positions/${p.id}`}
                                                    className="font-medium text-navy-900 hover:text-amber-600"
                                                >
                                                    {p.title}
                                                </Link>
                                            </td>
                                            <td className="p-4 text-gray-500">{p.company || "—"}</td>
                                            <td className="p-4 text-gray-500">{p.level || "—"}</td>
                                        </tr>
                                    ))}
                                    {positions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-6 text-center text-gray-400">
                                                No positions match your search
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {canSearchCvs && (
                        <section className="space-y-3">
                            <h2 className="font-semibold text-navy-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-500" /> CVs ({cvs.length})
                            </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr className="text-left">
                                            <th className="p-4 font-medium">Candidate</th>
                                            <th className="p-4 font-medium">Position</th>
                                            <th className="p-4 font-medium">Likes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cvs.map((cv) => (
                                            <tr key={cv.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                                <td className="p-4">
                                                    <Link
                                                        to={`/dashboard/cvs/${cv.id}`}
                                                        className="font-medium text-navy-900 hover:text-amber-600"
                                                    >
                                                        {cv.candidateFullName}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-gray-500">{cv.positionTitle}</td>
                                                <td className="p-4 text-gray-500 flex items-center gap-1">
                                                    <Heart className="w-3.5 h-3.5" /> {cv.likesCount || 0}
                                                </td>
                                            </tr>
                                        ))}
                                        {cvs.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-6 text-center text-gray-400">
                                                    No CVs match your search
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;