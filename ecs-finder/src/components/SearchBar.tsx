interface SearchBarProps {
  searchQuery: string;
  onChange: (query: string) => void;
  resultCount?: number;
}

function SearchBar({ searchQuery, onChange, resultCount }: SearchBarProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', maxWidth: 560 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--glass)',
                borderRadius: 14,
                padding: '7px 8px 7px 18px',
                boxShadow: '0 10px 26px rgba(20,44,68,0.09)',
                width: '100%',
            }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="9" cy="9" r="6" stroke="var(--primary)" strokeWidth="1.8"/>
                    <path d="M14 14L18 18" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>

                <input
                    type="text"
                    placeholder="Tìm câu lạc bộ, cuộc thi, dự án, sự kiện..."
                    value={searchQuery}
                    onChange={e => onChange(e.target.value)}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontSize: 16,
                        color: 'var(--text)',
                    }}
                />

                {resultCount !== undefined && (
                    <span style={{
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontWeight: 600,
                        fontSize: 12.5,
                        color: 'var(--text-dim)',
                        whiteSpace: 'nowrap',
                        padding: '4px 10px',
                        background: 'var(--glass-2)',
                        borderRadius: 7,
                        border: '1px solid var(--border)',
                    }}>
                        {resultCount} kết quả
                    </span>
                )}
            </div>
        </div>
    );
}

export default SearchBar;
