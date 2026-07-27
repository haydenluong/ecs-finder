import { useEffect } from 'react';
import type { DeadlineFilter, TopicFilter } from '../types';
import FilterSections from './FilterSections';

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    resultCount: number;
    categoryFilter: string;
    onCategoryChange: (cat: string) => void;
    deadlineFilter: DeadlineFilter;
    onDeadlineChange: (d: DeadlineFilter) => void;
    topicFilters: TopicFilter;
    setTopicFilters: (f: TopicFilter) => void;
    positionFilters: string[];
    onPositionFilterChange: (p: string[]) => void;
    onClearAll: () => void;
}

function FilterDrawer({
    isOpen, onClose, resultCount,
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
    onClearAll,
}: FilterDrawerProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            function onKey(e: KeyboardEvent): void { if (e.key === 'Escape') onClose(); }
            window.addEventListener('keydown', onKey);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', onKey);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const hasAnyFilter = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0;

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(18,40,62,0.5)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--glass)',
                    borderRadius: '22px 22px 0 0',
                    maxHeight: '82vh',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                    <div style={{
                        width: 36, height: 4, borderRadius: 999,
                        background: 'rgba(20,52,80,0.18)',
                    }} />
                </div>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 20px 12px',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: 16,
                        color: 'var(--text)',
                    }}>Bộ lọc</span>
                    {hasAnyFilter && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            style={{
                                fontFamily: 'Be Vietnam Pro, sans-serif',
                                fontSize: 13,
                                color: 'var(--primary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0,
                            }}
                        >Xoá tất cả</button>
                    )}
                </div>

                {/* Scrollable filter content */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
                    <FilterSections
                        categoryFilter={categoryFilter}
                        onCategoryChange={onCategoryChange}
                        deadlineFilter={deadlineFilter}
                        onDeadlineChange={onDeadlineChange}
                        topicFilters={topicFilters}
                        setTopicFilters={setTopicFilters}
                        positionFilters={positionFilters}
                        onPositionFilterChange={onPositionFilterChange}
                    />
                </div>

                {/* Sticky footer */}
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--glass)',
                    flexShrink: 0,
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            borderRadius: 999,
                            border: 'none',
                            background: 'var(--primary)',
                            color: 'white',
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            boxShadow: '0 6px 20px rgba(26,111,208,0.28)',
                        }}
                    >
                        Xem {resultCount} kết quả
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterDrawer;
