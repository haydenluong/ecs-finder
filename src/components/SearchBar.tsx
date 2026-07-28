interface SearchBarProps {
  searchQuery: string;
  onChange: (query: string) => void;
  resultCount?: number;
}

function SearchBar({ searchQuery, onChange, resultCount }: SearchBarProps) {
    return (
        <div className="flex justify-start w-full max-w-[560px]">
            <div className="flex items-center gap-2.5 w-full bg-glass rounded-[14px] py-[7px] pr-2 pl-[18px] shadow-[0_10px_26px_rgba(20,44,68,0.09)]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <circle cx="9" cy="9" r="6" stroke="var(--color-primary)" strokeWidth="1.8"/>
                    <path d="M14 14L18 18" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>

                <input
                    type="text"
                    aria-label="Tìm kiếm hoạt động"
                    placeholder="Tìm câu lạc bộ, cuộc thi, dự án, sự kiện..."
                    value={searchQuery}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 border-none outline-none bg-transparent text-[16px] text-text"
                />

                {resultCount !== undefined && (
                    <span className="font-semibold text-[12.5px] text-text-dim whitespace-nowrap px-2.5 py-1 bg-glass-2 rounded-[7px] border border-border">
                        {resultCount} kết quả
                    </span>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
