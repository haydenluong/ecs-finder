import { useState, useEffect, useMemo } from 'react';
import { topicSet, categorySet, accentVars, POSITIONS } from '../data/tagData';
import type { Activity, DeadlineFilter, TopicFilter } from '../types';

const GROUP = 'py-3.5 px-1';

const DEADLINE_OPTIONS: { label: string; value: DeadlineFilter }[] = [
    { label: 'Tất cả',          value: '' },
    { label: 'Trong tuần này',  value: 'week' },
    { label: 'Trong tháng này', value: 'month' },
];

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
    activities: Activity[];
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
        <div className="flex items-center gap-[7px] mb-2.5">
            {icon}
            <span className="font-bold text-[12px] tracking-[0.07em] text-text-dim uppercase">{children}</span>
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
            className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[10px] cursor-pointer select-none min-h-10 transition-[background-color] duration-150 ${
                isSelected
                    ? 'bg-[rgba(26,111,208,0.08)]'
                    : 'bg-transparent hover:bg-[rgba(26,111,208,0.05)]'
            }`}
        >
            {/* Radio ring + center-dot */}
            <div className={`w-4 h-4 rounded-full shrink-0 border-2 box-border transition-[border-color,background-color] duration-150 ${
                isSelected
                    ? 'border-primary bg-[radial-gradient(circle,var(--color-primary)_0px,var(--color-primary)_4px,transparent_5px)]'
                    : 'border-text-faint bg-transparent'
            }`} />
            <span className={`flex-1 text-[13.5px] ${
                isSelected ? 'font-semibold text-text' : 'font-normal text-text-dim'
            }`}>{label}</span>
            {count !== undefined && (
                <span className={`text-[12px] font-medium min-w-4 text-right ${
                    isSelected ? 'text-primary' : 'text-text-faint'
                }`}>{count}</span>
            )}
        </div>
    );
}

function FilterSections({
    activities,
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

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const a of activities) {
            counts[a.category] = (counts[a.category] ?? 0) + 1;
        }
        return counts;
    }, [activities]);

    return (
        <>
            {/* Category */}
            <div className={GROUP}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <line x1="2" y1="4" x2="14" y2="4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="8" x2="14" y2="8" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="2" y1="12" x2="10" y2="12" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Loại hình</SectionLabel>
                <RadioRow label="Tất cả" value="" selected={categoryFilter} onSelect={() => onCategoryChange('')} count={activities.length} />
                {categorySet.map(c => (
                    <RadioRow key={c.label} label={c.label} value={c.label} selected={categoryFilter}
                        onSelect={() => onCategoryChange(categoryFilter === c.label ? '' : c.label)}
                        count={categoryCounts[c.label] ?? 0} />
                ))}
            </div>

            {/* Deadline */}
            <div className={GROUP}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="var(--color-primary)" strokeWidth="1.5"/>
                        <path d="M8 5v3l2 2" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                }>Hạn đăng ký</SectionLabel>
                {DEADLINE_OPTIONS.map(opt => (
                    <RadioRow key={opt.value} label={opt.label} value={opt.value} selected={deadlineFilter}
                        onSelect={() => onDeadlineChange(deadlineFilter === opt.value ? '' : opt.value)} />
                ))}
            </div>

            {/* Topics */}
            <div className={GROUP}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" stroke="var(--color-primary)" strokeWidth="1.5" fill="none"/>
                        <circle cx="8" cy="8" r="2" fill="var(--color-primary)"/>
                    </svg>
                }>Chủ đề</SectionLabel>
                {topicSet.map(topic => {
                    const isChecked = selectedTopics.has(topic.name);
                    const isExpanded = expandedTopics[topic.name] ?? false;
                    return (
                        <div key={topic.name} style={accentVars(topic.name)} className="mb-1">
                            <div className="flex items-center gap-2 py-[7px] min-h-[44px]">
                                {/* Colored topic checkbox + name — one focusable checkbox control */}
                                <div
                                    role="checkbox"
                                    tabIndex={0}
                                    aria-checked={isChecked}
                                    aria-label={topic.name}
                                    onClick={() => handleTopicCheck(topic.name, !isChecked)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTopicCheck(topic.name, !isChecked); } }}
                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                >
                                    <div className={`w-[17px] h-[17px] rounded-[5px] shrink-0 border-2 flex items-center justify-center box-border transition-[background-color,border-color,box-shadow] duration-150 ${
                                        isChecked
                                            ? 'border-[var(--topic)] bg-[var(--topic)] shadow-[0_0_9px_var(--topic-60)]'
                                            : 'border-text-faint bg-transparent shadow-none'
                                    }`}>
                                        {isChecked && (
                                            <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`flex-1 font-semibold text-[13.5px] ${
                                        isChecked ? 'text-[var(--topic)]' : 'text-text'
                                    }`}>{topic.name}</span>
                                </div>
                                {topic.subtopics.length > 0 && (
                                    <button
                                        type="button"
                                        aria-label={isExpanded ? `Thu gọn ${topic.name}` : `Mở rộng ${topic.name}`}
                                        aria-expanded={isExpanded}
                                        onClick={() => toggleExpand(topic.name)}
                                        className="bg-transparent border-none cursor-pointer py-0.5 px-1 rounded-[5px] leading-none text-text-faint text-[11px] min-w-6 min-h-6"
                                    >
                                        {isExpanded ? '▾' : '▸'}
                                    </button>
                                )}
                            </div>
                            {isExpanded && topic.subtopics.length > 0 && (
                                <div className="pl-7 flex flex-col gap-0.5 mb-1">
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
                                                className={`flex items-center gap-2 py-[5px] px-1.5 rounded-[7px] cursor-pointer min-h-[44px] transition-[background-color] duration-150 ${
                                                    subSelected ? 'bg-[var(--topic-08)]' : 'bg-transparent'
                                                }`}>
                                                {/* CHECKBOX for subtopics */}
                                                <div className={`w-3.5 h-3.5 rounded-[4px] shrink-0 border-2 cursor-pointer flex items-center justify-center box-border transition-[background-color,border-color,box-shadow] duration-150 ${
                                                    subSelected
                                                        ? 'border-[var(--topic-70)] bg-[var(--topic-75)] shadow-[0_0_9px_var(--topic-40)]'
                                                        : 'border-text-faint bg-transparent shadow-none'
                                                }`}>
                                                    {subSelected && (
                                                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                                                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={`text-[12.5px] ${
                                                    subSelected ? 'text-[var(--topic)] font-semibold' : 'text-text-dim font-normal'
                                                }`}>{sub}</span>
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
            <div className={GROUP}>
                <SectionLabel icon={
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="5" r="3" stroke="var(--color-primary)" strokeWidth="1.5"/>
                        <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
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
                            className={`flex items-center gap-[9px] py-[7px] px-[9px] rounded-[9px] cursor-pointer select-none min-h-[44px] transition-[background-color] duration-150 ${
                                checked ? 'bg-[rgba(26,111,208,0.08)]' : 'bg-transparent'
                            }`}>

                            <div className={`w-[17px] h-[17px] rounded-[5px] shrink-0 border-2 cursor-pointer flex items-center justify-center box-border transition-[background-color,border-color] duration-150 ${
                                checked ? 'border-primary bg-primary' : 'border-text-faint bg-transparent'
                            }`}>
                                {checked && (
                                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <span className={`text-[13px] ${
                                checked ? 'text-primary font-semibold' : 'text-text-dim font-normal'
                            }`}>{pos}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default FilterSections;
