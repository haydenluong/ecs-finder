'use client';

import { useState, useRef, useEffect } from 'react';
import { POSITIONS } from '@/data/tagData';

interface PositionsDropdownProps {
    value: string[];
    onChange: (positions: string[]) => void;
}

export default function PositionsDropdown({ value, onChange }: PositionsDropdownProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    function toggle(pos: string) {
        const checked = value.includes(pos);
        onChange(checked ? value.filter(p => p !== pos) : [...value, pos]);
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2 bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-left text-[14px] text-text"
            >
                <span className={value.length === 0 ? 'text-text-faint' : 'text-text'}>
                    {value.length === 0 ? 'Chọn vị trí tuyển...' : value.join(' · ')}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="var(--color-text-dim)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {open && (
                <div className="absolute z-10 mt-1.5 w-full bg-glass border border-border-bright rounded-2xl shadow-[0_10px_26px_rgba(20,44,68,0.09)] p-1.5 max-h-[280px] overflow-y-auto">
                    {POSITIONS.map(pos => {
                        const checked = value.includes(pos);
                        return (
                            <div
                                key={pos}
                                role="checkbox"
                                tabIndex={0}
                                aria-checked={checked}
                                aria-label={pos}
                                onClick={() => toggle(pos)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(pos); } }}
                                className={`flex items-center gap-[9px] py-[7px] px-[9px] rounded-[9px] cursor-pointer select-none min-h-[44px] transition-[background-color] duration-150 ${
                                    checked ? 'bg-[rgba(26,111,208,0.08)]' : 'bg-transparent'
                                }`}
                            >
                                <div className={`w-[17px] h-[17px] rounded-[5px] shrink-0 border-2 cursor-pointer flex items-center justify-center box-border transition-[background-color,border-color] duration-150 ${
                                    checked ? 'border-primary bg-primary' : 'border-text-faint bg-transparent'
                                }`}>
                                    {checked && (
                                        <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-[13px] ${checked ? 'text-primary font-semibold' : 'text-text-dim font-normal'}`}>{pos}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
