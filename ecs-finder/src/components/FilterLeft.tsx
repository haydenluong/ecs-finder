import { useState, useEffect } from 'react';
import { topicSet, categorySet } from '../data/tagData';
import type { DeadlineFilter, TopicFilter } from '../types';

const TOPIC_ACCENTS: Record<string, string> = {
    'STEM':                     '#12a6c9',
    'Xã hội':                   '#0db87a',
    'Môi trường':               '#0dba45',
    'Kinh tế':                  '#0d7aba',
    'Nghệ thuật & Sáng tạo':   '#7a5cff',
    'Ngôn ngữ & Giao tiếp':    '#3d5cff',
    'Sức khỏe':                 '#c933e6',
};

const DEADLINE_OPTIONS: { label: string; value: DeadlineFilter }[] = [
    { label: 'Tất cả',          value: '' },
    { label: 'Trong tuần này',  value: 'week' },
    { label: 'Trong tháng này', value: 'month' },
];

const POSITIONS = [
    'Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung',
    'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại',
    'CTV Truyền Thông', 'Tình nguyện viên', 'Khác',
];

interface SectionLabelProps {
    icon: React.ReactNode;
    children: React.ReactNode;
}

interface RadioRowProps {
    label: string;
    selected: string;
    onSelect: () => void;
}

interface FilterRailProps {
    categoryFilter: string;
    onCategoryChange: (cat: string) => void;
    deadlineFilter: DeadlineFilter;
    onDeadlineChange: (d: DeadlineFilter) => void;
    topicFilters: TopicFilter;
    setTopicFilters: (f: TopicFilter) => void;
    positionFilters: string[];
    onPositionFilterChange: (p: string[]) => void;
    onClearAll: () => void;
    isHorizontal?: boolean;
}

function SectionLabel({ icon, children }: SectionLabelProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            {icon}
            <span style={{
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.07em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
            }}>{children}</span>
        </div>
    );
}

function RadioRow({ label, selected, onSelect }: RadioRowProps) {
    const isSelected = selected === label || (label === 'Tất cả' && !selected);
    return (
        <div
            onClick={onSelect}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '9px 11px',
                borderRadius: 10,
                cursor: 'pointer',
                background: isSelected ? 'rgba(47,123,255,0.13)' : 'transparent',
                transition: 'background 0.15s',
                userSelect: 'none',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(47,123,255,0.08)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        >
            <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                border: isSelected ? '4.5px solid var(--primary)' : '1.5px solid var(--border-bright)',
                background: 'var(--glass)',
                boxSizing: 'border-box',
            }} />
            <span style={{
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontSize: 13.5,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--text)' : 'var(--text-dim)',
            }}>{label}</span>
        </div>
    );
}

function FilterRail({
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
    onClearAll,
    isHorizontal = false,
}: FilterRailProps) {
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (topicFilters.topics.length > 0) {
            setExpandedTopics(prev => {
                const next = { ...prev };
                topicFilters.topics.forEach(t => { next[t] = true; });
                return next;
            });
        }
    }, [topicFilters.topics]);

    function toggleExpand(name: string): void {
        setExpandedTopics(prev => ({ ...prev, [name]: !prev[name] }));
    }

    function handleTopicCheck(name: string, checked: boolean): void {
        const newTopics = checked
            ? [...topicFilters.topics, name]
            : topicFilters.topics.filter(t => t !== name);
        const newSubtopics = checked
            ? topicFilters.subtopics
            : topicFilters.subtopics.filter(s => s.parent !== name);
        setTopicFilters({ topics: newTopics, subtopics: newSubtopics });
        if (checked) setExpandedTopics(prev => ({ ...prev, [name]: true }));
    }

    function handleSubtopicCheck(parent: string, sub: string, checked: boolean): void {
        const newSubtopics = checked
            ? [...topicFilters.subtopics, { parent, subtopic: sub }]
            : topicFilters.subtopics.filter(s => !(s.parent === parent && s.subtopic === sub));
        setTopicFilters({ topics: topicFilters.topics, subtopics: newSubtopics });
    }

    function isSubSelected(parent: string, sub: string): boolean {
        return topicFilters.subtopics.some(s => s.parent === parent && s.subtopic === sub);
    }

    function handlePositionCheck(pos: string, checked: boolean): void {
        const next = checked
            ? [...positionFilters, pos]
            : positionFilters.filter(p => p !== pos);
        onPositionFilterChange(next);
    }

    const hasAnyFilter = categoryFilter || deadlineFilter ||
        topicFilters.topics.length > 0 || positionFilters.length > 0;

    const railStyle: React.CSSProperties = isHorizontal ? {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        padding: '16px 0 8px',
    } : {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        position: 'sticky',
        top: 82,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        width: 238,
        paddingRight: 4,
    };

    const groupStyle: React.CSSProperties = isHorizontal
        ? { flex: '1 1 240px', padding: '14px 4px' }
        : { padding: '14px 4px' };

    return (
        <div style={railStyle}>
            {!isHorizontal && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Bộ lọc</span>
                    {hasAnyFilter && (
                        <button onClick={onClearAll} style={{
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontSize: 13,
                            color: 'var(--primary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                        }}>Xoá tất cả</button>
                    )}
                </div>
            )}

            {/* Category */}
            <div style={groupStyle}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <line x1="2" y1="4" x2="14" y2="4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="8" x2="14" y2="8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="12" x2="10" y2="12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Loại hình</SectionLabel>
                <RadioRow label="Tất cả" selected={categoryFilter} onSelect={() => onCategoryChange('')} />
                {categorySet.map(c => (
                    <RadioRow key={c.label} label={c.label} selected={categoryFilter}
                        onSelect={() => onCategoryChange(categoryFilter === c.label ? '' : c.label)} />
                ))}
            </div>

            {/* Deadline */}
            <div style={groupStyle}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="var(--primary)" strokeWidth="1.5"/>
                        <path d="M8 5v3l2 2" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Hạn đăng ký</SectionLabel>
                {DEADLINE_OPTIONS.map(opt => (
                    <RadioRow key={opt.value} label={opt.label} selected={deadlineFilter}
                        onSelect={() => onDeadlineChange(deadlineFilter === opt.value ? '' : opt.value)} />
                ))}
            </div>

            {/* Topics */}
            <div style={groupStyle}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" stroke="var(--primary)" strokeWidth="1.5" fill="none"/>
                        <circle cx="8" cy="8" r="2" fill="var(--primary)"/>
                    </svg>
                }>Chủ đề</SectionLabel>
                {topicSet.map(topic => {
                    const accent = TOPIC_ACCENTS[topic.name] ?? 'var(--primary)';
                    const isChecked = topicFilters.topics.includes(topic.name);
                    const isExpanded = expandedTopics[topic.name] ?? false;
                    return (
                        <div key={topic.name} style={{ marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                                <div
                                    onClick={() => handleTopicCheck(topic.name, !isChecked)}
                                    style={{
                                        width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                                        border: isChecked ? `2px solid ${accent}` : '1.5px solid var(--border-bright)',
                                        background: isChecked ? accent : 'var(--glass)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.15s, border-color 0.15s',
                                    }}
                                >
                                    {isChecked && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span
                                    onClick={() => handleTopicCheck(topic.name, !isChecked)}
                                    style={{
                                        flex: 1,
                                        fontFamily: 'Be Vietnam Pro, sans-serif',
                                        fontWeight: 600,
                                        fontSize: 13.5,
                                        color: isChecked ? accent : 'var(--text)',
                                        cursor: 'pointer',
                                    }}
                                >{topic.name}</span>
                                {topic.subtopics.length > 0 && (
                                    <button
                                        onClick={() => toggleExpand(topic.name)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '2px 4px', borderRadius: 5, lineHeight: 1,
                                            color: 'var(--text-faint)',
                                            fontSize: 11,
                                        }}
                                    >
                                        {isExpanded ? '▾' : '▸'}
                                    </button>
                                )}
                            </div>
                            {isExpanded && topic.subtopics.length > 0 && (
                                <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4 }}>
                                    {topic.subtopics.map(sub => {
                                        const subSelected = isSubSelected(topic.name, sub);
                                        return (
                                            <label key={sub} style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '5px 6px', borderRadius: 7, cursor: 'pointer',
                                                background: subSelected ? `${accent}18` : 'transparent',
                                                transition: 'background 0.15s',
                                            }}>
                                                <div
                                                    onClick={() => handleSubtopicCheck(topic.name, sub, !subSelected)}
                                                    style={{
                                                        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                                                        border: subSelected ? `2px solid ${accent}` : '1.5px solid var(--border-bright)',
                                                        background: subSelected ? accent : 'var(--glass)',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >
                                                    {subSelected && (
                                                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontFamily: 'Be Vietnam Pro, sans-serif',
                                                    fontSize: 12.5,
                                                    color: subSelected ? accent : 'var(--text-dim)',
                                                    fontWeight: subSelected ? 600 : 400,
                                                }}>{sub}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Positions */}
            <div style={groupStyle}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="5" r="3" stroke="var(--primary)" strokeWidth="1.5"/>
                        <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Vị trí tuyển</SectionLabel>
                {POSITIONS.map(pos => {
                    const checked = positionFilters.includes(pos);
                    return (
                        <label key={pos} style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '7px 9px', borderRadius: 9, cursor: 'pointer',
                            background: checked ? 'rgba(47,123,255,0.1)' : 'transparent',
                            transition: 'background 0.15s',
                            userSelect: 'none',
                        }}>
                            <div
                                onClick={() => handlePositionCheck(pos, !checked)}
                                style={{
                                    width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                                    border: checked ? '2px solid var(--primary)' : '1.5px solid var(--border-bright)',
                                    background: checked ? 'var(--primary)' : 'var(--glass)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                {checked && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span style={{
                                fontFamily: 'Be Vietnam Pro, sans-serif',
                                fontSize: 13,
                                color: checked ? 'var(--primary)' : 'var(--text-dim)',
                                fontWeight: checked ? 600 : 400,
                            }}>{pos}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

export default FilterRail;
