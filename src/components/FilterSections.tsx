import { useState, useEffect, useMemo } from 'react';
import { topicSet, categorySet, TOPIC_ACCENTS } from '../data/tagData';
import { mockActivities } from '../data/Activities';
import type { DeadlineFilter, TopicFilter } from '../types';

const groupStyle: React.CSSProperties = { padding: '14px 4px' };

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

function hexRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

interface SectionLabelProps {
    icon: React.ReactNode;
    children: React.ReactNode;
}

interface RadioRowProps {
    label: string;
    value?: string;
    selected: string;
    onSelect: () => void;
    count?: number;
}

interface FilterSectionsProps {
    categoryFilter: string;
    onCategoryChange: (cat: string) => void;
    deadlineFilter: DeadlineFilter;
    onDeadlineChange: (d: DeadlineFilter) => void;
    topicFilters: TopicFilter;
    setTopicFilters: (f: TopicFilter) => void;
    positionFilters: string[];
    onPositionFilterChange: (p: string[]) => void;
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

function RadioRow({ label, value = label, selected, onSelect, count }: RadioRowProps) {
    const isSelected = selected === value
    ;
    return (
        <div
            role="radio"
            tabIndex={0}
            aria-checked={isSelected}
            aria-label={label}
            onClick={onSelect}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                background: isSelected ? 'rgba(26,111,208,0.08)' : 'transparent',
                transition: 'background 0.15s',
                userSelect: 'none',
                minHeight: 40,
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(26,111,208,0.05)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        >
            {/* Radio ring + center-dot */}
            <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                flexShrink: 0,
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-faint)'}`,
                background: isSelected
                    ? 'radial-gradient(circle, var(--primary) 0px, var(--primary) 4px, transparent 5px)'
                    : 'transparent',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, background 0.15s',
            }} />
            <span style={{
                flex: 1,
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontSize: 13.5,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? 'var(--text)' : 'var(--text-dim)',
            }}>{label}</span>
            {count !== undefined && (
                <span style={{
                    fontFamily: 'Be Vietnam Pro, sans-serif',
                    fontSize: 12,
                    fontWeight: 500,
                    color: isSelected ? 'var(--primary)' : 'var(--text-faint)',
                    minWidth: 16,
                    textAlign: 'right',
                }}>{count}</span>
            )}
        </div>
    );
}

function FilterSections({
    categoryFilter, onCategoryChange,
    deadlineFilter, onDeadlineChange,
    topicFilters, setTopicFilters,
    positionFilters, onPositionFilterChange,
}: FilterSectionsProps) {
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (topicFilters.topics.length > 0) {
            // only one topic can be selected now, expand just that one, collapsing any other.
            setExpandedTopics({ [topicFilters.topics[0]]: true });
        }
    }, [topicFilters.topics]);

    function toggleExpand(name: string): void {
        setExpandedTopics(prev => ({ ...prev, [name]: !prev[name] }));
    }

    function handleTopicCheck(name: string, checked: boolean): void {
        if (checked) {
            setTopicFilters({topics:[name], subtopics:[]});
            setExpandedTopics({ [name]: true });
        } else {
            setTopicFilters({topics:[], subtopics:[]});
            setExpandedTopics({});   // unchecking the topic also collapses it
        }
    }


    function handleSubtopicCheck(parent: string, sub: string, checked: boolean): void {
       if (checked) {
        const switchingTopic = !topicFilters.topics.includes(parent);
        const keep = switchingTopic ? [] : topicFilters.subtopics;   // drop old topic's subtopics
        if (switchingTopic) setExpandedTopics({ [parent]: true });   // collapse the old topic
        setTopicFilters({ topics: [parent], subtopics: [...keep, { parent, subtopic: sub }] });
    } else {
        setTopicFilters({
            topics: topicFilters.topics,
            subtopics: topicFilters.subtopics.filter(s => !(s.parent === parent && s.subtopic === sub)),
        });
    }
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

    // Set lookups instead of Array.includes inside the topic/position maps below.
    const selectedTopics = new Set(topicFilters.topics);
    const selectedPositions = new Set(positionFilters);

    // mockActivities is a build-time constant, so these counts never change.
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const a of mockActivities) {
            counts[a.category] = (counts[a.category] ?? 0) + 1;
        }
        return counts;
    }, []);

    return (
        <>
            {/* Category */}
            <div style={groupStyle}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <line x1="2" y1="4" x2="14" y2="4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="8" x2="14" y2="8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="12" x2="10" y2="12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Loại hình</SectionLabel>
                <RadioRow label="Tất cả" value="" selected={categoryFilter} onSelect={() => onCategoryChange('')} count={mockActivities.length} />
                {categorySet.map(c => (
                    <RadioRow key={c.label} label={c.label} value={c.label} selected={categoryFilter}
                        onSelect={() => onCategoryChange(categoryFilter === c.label ? '' : c.label)}
                        count={categoryCounts[c.label] ?? 0} />
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
                    <RadioRow key={opt.value} label={opt.label} value={opt.value} selected={deadlineFilter}
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
                    const isChecked = selectedTopics.has(topic.name);
                    const isExpanded = expandedTopics[topic.name] ?? false;
                    return (
                        <div key={topic.name} style={{ marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', minHeight: 44 }}>
                                {/* Colored topic checkbox + name — one focusable checkbox control */}
                                <div
                                    role="checkbox"
                                    tabIndex={0}
                                    aria-checked={isChecked}
                                    aria-label={topic.name}
                                    onClick={() => handleTopicCheck(topic.name, !isChecked)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTopicCheck(topic.name, !isChecked); } }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer' }}
                                >
                                    <div
                                        style={{
                                            width: 17,
                                            height: 17,
                                            borderRadius: 5,
                                            flexShrink: 0,
                                            border: `2px solid ${isChecked ? accent : 'var(--text-faint)'}`,
                                            background: isChecked ? accent : 'transparent',
                                            boxShadow: isChecked ? `0 0 9px ${hexRgba(accent, 0.6)}` : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxSizing: 'border-box',
                                            transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
                                        }}
                                    >
                                        {isChecked && (
                                            <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span
                                        style={{
                                            flex: 1,
                                            fontFamily: 'Be Vietnam Pro, sans-serif',
                                            fontWeight: 600,
                                            fontSize: 13.5,
                                            color: isChecked ? accent : 'var(--text)',
                                        }}
                                    >{topic.name}</span>
                                </div>
                                {topic.subtopics.length > 0 && (
                                    <button
                                        type="button"
                                        aria-label={isExpanded ? `Thu gọn ${topic.name}` : `Mở rộng ${topic.name}`}
                                        aria-expanded={isExpanded}
                                        onClick={() => toggleExpand(topic.name)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '2px 4px', borderRadius: 5, lineHeight: 1,
                                            color: 'var(--text-faint)',
                                            fontSize: 11,
                                            minWidth: 24,
                                            minHeight: 24,
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
                                            <div key={sub}
                                                role="checkbox"
                                                tabIndex={0}
                                                aria-checked={subSelected}
                                                aria-label={sub}
                                                onClick={() => handleSubtopicCheck(topic.name, sub, !subSelected)}
                                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSubtopicCheck(topic.name, sub, !subSelected); } }}
                                                style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '5px 6px', borderRadius: 7, cursor: 'pointer',
                                                background: subSelected ? hexRgba(accent, 0.08) : 'transparent',
                                                transition: 'background 0.15s',
                                                minHeight: 44,
                                            }}>
                                                {/* CHECKBOX for subtopics */}
                                                <div
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        borderRadius: 4,
                                                        flexShrink: 0,
                                                        border: `2px solid ${subSelected ? hexRgba(accent, 0.7) : 'var(--text-faint)'}`,
                                                        background: subSelected ? hexRgba(accent, 0.75) : 'transparent',
                                                        boxShadow: subSelected ? `0 0 9px ${hexRgba(accent, 0.4)}` : 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxSizing: 'border-box',
                                                        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
                                                    }}
                                                >
                                                    {subSelected && (
                                                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontFamily: 'Be Vietnam Pro, sans-serif',
                                                    fontSize: 12.5,
                                                    color: subSelected ? accent : 'var(--text-dim)',
                                                    fontWeight: subSelected ? 600 : 400,
                                                }}>{sub}</span>
                                            </div>
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
                    const checked = selectedPositions.has(pos);
                    return (
                        <div key={pos}
                            role="checkbox"
                            tabIndex={0}
                            aria-checked={checked}
                            aria-label={pos}
                            onClick={() => handlePositionCheck(pos, !checked)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePositionCheck(pos, !checked); } }}
                            style={{
                            display: 'flex', alignItems: 'center', gap: 9,
                            padding: '7px 9px', borderRadius: 9, cursor: 'pointer',
                            background: checked ? 'rgba(26,111,208,0.08)' : 'transparent',
                            transition: 'background 0.15s',
                            userSelect: 'none',
                            minHeight: 44,
                        }}>
                            
                            <div
                                style={{
                                    width: 17,
                                    height: 17,
                                    borderRadius: 5,
                                    flexShrink: 0,
                                    border: `2px solid ${checked ? 'var(--primary)' : 'var(--text-faint)'}`,
                                    background: checked ? 'var(--primary)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    transition: 'background 0.15s, border-color 0.15s',
                                }}
                            >
                                {checked && (
                                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span style={{
                                fontFamily: 'Be Vietnam Pro, sans-serif',
                                fontSize: 13,
                                color: checked ? 'var(--primary)' : 'var(--text-dim)',
                                fontWeight: checked ? 600 : 400,
                            }}>{pos}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default FilterSections;
