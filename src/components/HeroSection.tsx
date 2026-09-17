import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import SearchBar from './SearchBar';
import { topicSet, accentVars, topicLabel } from '../data/tagData';
import { useLang } from '@/i18n/LangProvider';
import type { TopicFilter, Tag } from '../types';

interface ChipPosition {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    animDelay: string;
    animDur: string;
}

interface HeroSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    topicFilters: TopicFilter;
    onTagClick: (tag: Tag) => void;
}

const MAG_TRANSFORMS = [
    'translate(-64px,-46px) rotate(-14deg) scale(1.05)',
    'translate(66px,-14px) rotate(12deg) scale(1.05)',
    'translate(-38px,64px) rotate(-10deg) scale(1.05)',
] as const;


const CHIP_POSITIONS: ChipPosition[] = [
    { top: 30,  left: 2,   animDelay: '0s',   animDur: '5s' },
    { top: 70,  right: -6, animDelay: '0.5s', animDur: '6.2s' },
    { bottom: 40, left: 34, animDelay: '0.9s', animDur: '5.6s' },
];

function pickSlotTopics(exclude: string[] = []): string[] {
    const all = topicSet.map(t => t.name);
    const pool = all.filter(name => !exclude.includes(name));
    if (pool.length < 3) pool.push(...all.filter(name => !pool.includes(name)));
    const out: string[] = [];
    for (let i = 0; i < 3; i++) {
        out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out;
}

function HeroSection({ searchQuery, onSearchChange, topicFilters, onTagClick }: HeroSectionProps) {
    const { t, lang } = useLang();
    const [hoverTag, setHoverTag] = useState<number | null>(null);
    const [slotTopics, setSlotTopics] = useState<string[]>(() => topicSet.slice(0, 3).map(t => t.name));
    const [animKey, setAnimKey] = useState<number>(0);
    const [typedWord, setTypedWord] = useState<string>('');

    const selectedTag = slotTopics.findIndex(name => topicFilters.topics.includes(name));
    const leanTag = hoverTag ?? (selectedTag === -1 ? null : selectedTag);

    // typing animation — restarts on a language change, since the word differs
    const fullTypedWord = t('hero.title.typed');
    useEffect(() => {
        let i = 0;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before retyping the new language's word
        setTypedWord('');
        const id = setInterval(() => {
            i++;
            setTypedWord(fullTypedWord.slice(0, i));
            if (i >= fullTypedWord.length) clearInterval(id);
        }, 55);
        return () => clearInterval(id);
    }, [fullTypedWord]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- randomize only after hydration, so server and client HTML match
        setSlotTopics(pickSlotTopics());
    }, []);

    function randomizeTags(): void {
        setSlotTopics(pickSlotTopics(slotTopics));
        setAnimKey(k => k + 1);
    }

    return (
        <section className="max-w-[1320px] mx-auto pt-12 px-[18px] pb-[30px] sm2:px-[22px] hero:pt-11 hero:px-10">
            <div className="grid grid-cols-1 gap-x-11 gap-y-5 items-center hero:grid-cols-[minmax(0,1fr)_minmax(0,330px)] rail:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
                {/* Headline block */}
                <div className="flex flex-col gap-5 hero:col-start-1 hero:row-start-1">
                    <h1 className={`font-heading font-extrabold leading-[1.08] tracking-[-0.015em] text-text m-0 whitespace-pre-line animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_60ms_both] ${
                        lang === 'EN'
                            ? 'text-[clamp(20px,6.2vw,40px)] hero:text-[clamp(28px,3.1vw,46px)] max-w-[16em]'
                            : 'text-[clamp(23px,7.2vw,42px)] hero:text-[clamp(30px,3.6vw,50px)] max-w-[14em]'
                    }`}>
                        {t('hero.title.before')}{' '}
                        <span className="text-primary mr-[0.25em]">
                            {typedWord}
                            <span aria-hidden="true" className="inline-block w-0 font-normal animate-[blink_0.9s_step-end_infinite]">|</span>
                            <span className="invisible">{fullTypedWord.slice(typedWord.length)}</span>
                        </span>
                        {' '}{t('hero.title.after')}
                    </h1>

                    <p className="font-normal text-[16.5px] leading-[1.6] text-text-dim max-w-[48ch] m-0 animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_120ms_both]">
                        {t('hero.subtitle')}
                    </p>
                </div>

                {/* Visual column — sits between the headline and the search bar on mobile,
                    and spans both rows of the second column above the hero breakpoint */}
                <div className="relative flex items-center justify-center w-full max-w-[340px] min-h-[250px] mx-auto hero:max-w-none hero:min-h-0 hero:mx-0 hero:col-start-2 hero:row-start-1 hero:row-span-2 hero:self-center">
                    <div className="absolute w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.38)_45%,transparent_72%)] z-0 pointer-events-none translate-x-[-22px] translate-y-[-18px]" />

                    <div
                        style={{ transform: leanTag !== null ? MAG_TRANSFORMS[leanTag] : 'translate(0,0) rotate(0deg) scale(1)' }}
                        className="transition-transform duration-[550ms] ease-[cubic-bezier(0.34,1.4,0.4,1)]"
                    >
                        <svg
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="relative z-[1] w-[178px] h-auto opacity-72 drop-shadow-[0_16px_24px_rgba(26,111,208,0.14)] animate-float-mag hero:w-[248px]"
                        >
                            {/* magnifying glass draw */}
                            <defs>
                                <radialGradient id="lensGrad" cx="40%" cy="35%" r="65%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.55"/>
                                    <stop offset="55%" stopColor="#a8d5f5" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                                </radialGradient>
                                <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#dceefa" stopOpacity="0.9"/>
                                    <stop offset="50%" stopColor="#a8d5f5" stopOpacity="0.7"/>
                                    <stop offset="100%" stopColor="#69aeea" stopOpacity="0.5"/>
                                </linearGradient>
                                <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#90c8f5"/>
                                    <stop offset="55%" stopColor="#5aaee0"/>
                                    <stop offset="100%" stopColor="#2f86c8"/>
                                </linearGradient>
                            </defs>
                            <circle cx="82" cy="82" r="58" fill="url(#lensGrad)"/>
                            <circle cx="82" cy="82" r="58" stroke="url(#rimGrad)" strokeWidth="19" fill="none"/>
                            <circle cx="82" cy="82" r="67.5" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"/>
                            <circle cx="82" cy="82" r="48.5" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none"/>
                            <line x1="125" y1="125" x2="168" y2="168" stroke="url(#handleGrad)" strokeWidth="24" strokeLinecap="round"/>
                            <line x1="126" y1="124" x2="165" y2="163" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.35"/>
                            <path d="M 48 55 A 42 42 0 0 1 80 42" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.45" fill="none"/>
                            <circle cx="56" cy="52" r="3.2" fill="white" opacity="0.4"/>
                        </svg>
                    </div>

                    {/* Floating topic chips */}
                    {CHIP_POSITIONS.map((pos, i) => {
                        const isActive = topicFilters.topics.includes(slotTopics[i]);
                        return (
                            <button
                                type="button"
                                key={`${slotTopics[i]}-${animKey}`}
                                onClick={() => onTagClick({ type: 'topic', label: slotTopics[i] })}
                                onPointerEnter={e => { if (e.pointerType === 'mouse') setHoverTag(i); }}
                                onPointerLeave={e => { if (e.pointerType === 'mouse') setHoverTag(null); }}
                                style={{
                                    ...accentVars(slotTopics[i]),
                                    top: pos.top,
                                    left: pos.left,
                                    right: pos.right,
                                    bottom: pos.bottom,
                                    animation: animKey > 0
                                        ? `tagPop 0.35s cubic-bezier(0.34,1.4,0.4,1) both, floaty ${pos.animDur} ${pos.animDelay} ease-in-out infinite`
                                        : `floaty ${pos.animDur} ${pos.animDelay} ease-in-out infinite`,
                                } as CSSProperties}
                                className={`absolute flex items-center gap-[7px] bg-glass rounded-full py-[7px] pr-[13px] pl-[11px] font-semibold text-[12.5px] text-text cursor-pointer z-[2] border transition-[border-color,box-shadow] duration-[180ms] ${
                                    isActive
                                        ? 'border-primary shadow-[0_16px_30px_rgba(20,44,68,0.22)]'
                                        : 'border-border shadow-[0_12px_26px_rgba(20,44,68,0.15)]'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-[var(--topic)] inline-block shrink-0" />
                                {topicLabel(slotTopics[i], lang)}
                            </button>
                        );
                    })}

                    {/* Randomizer button */}
                    <button
                        type="button"
                        aria-label={t('hero.randomTopic')}
                        onClick={randomizeTags}
                        className="group absolute left-[-16px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer z-[3]"
                    >
                        <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center border border-border shadow-[0_12px_26px_rgba(20,44,68,0.15)] scale-100 transition-[transform,box-shadow,border-color] duration-[180ms] group-hover:border-primary group-hover:shadow-[0_12px_26px_rgba(20,44,68,0.22)] group-hover:scale-[1.08]">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <g stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2.5 6H5l8 8h4.5"/>
                                    <path d="M2.5 14H5l2.6-2.6"/>
                                    <path d="M10.4 8.6 13 6h4.5"/>
                                    <path d="m15 3.5 2.5 2.5-2.5 2.5"/>
                                    <path d="m15 11.5 2.5 2.5-2.5 2.5"/>
                                </g>
                            </svg>
                        </span>
                        <span className="font-semibold text-[12px] text-text-dim">{t('hero.random')}</span>
                    </button>
                </div>

                <div className="animate-[fadeUp_0.8s_cubic-bezier(0.16,1,0.3,1)_180ms_both] hero:col-start-1 hero:row-start-2">
                    <SearchBar searchQuery={searchQuery} onChange={onSearchChange} />
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
