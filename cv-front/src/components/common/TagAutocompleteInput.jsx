import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { api } from "../../util/api";

const TagAutocompleteInput = ({ tags, onChange }) => {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!input.trim()) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            api.projects
                .autocompleteTags(input.trim())
                .then((res) => setSuggestions(res.data || []))
                .catch(() => setSuggestions([]));
        }, 250);

        return () => clearTimeout(debounceRef.current);
    }, [input]);

    const addTag = (value) => {
        const v = value.trim();
        if (v && !tags.includes(v)) {
            onChange([...tags, v]);
        }
        setInput("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeTag = (tag) => {
        onChange(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
        }
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                    <span
                        key={t}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-peach-100 text-coral-600 text-xs font-medium"
                    >
                        {t}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(t)} />
                    </span>
                ))}
            </div>

            <input
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Type a tag and press Enter..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-amber-500"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    {suggestions
                        .filter((s) => !tags.includes(s))
                        .map((s) => (
                            <button
                                key={s}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addTag(s)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

export default TagAutocompleteInput;