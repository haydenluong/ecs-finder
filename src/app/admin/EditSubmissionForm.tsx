import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { topicSet, categorySet, POSITIONS } from '@/data/tagData';
import { useLang } from '@/i18n/LangProvider';
import { isStringKey } from '@/i18n/strings';
import type { Activity } from '@/types';

interface EditSubmissionFormProps {
    activity: Activity;
    onCancel: () => void;
    onSaved: () => void;
}

interface Draft {
    name: string;
    category: string;
    topic: string;
    subtopic: string | null;
    location: string;
    deadline: string;
    desc: string;
    link: string;
    positions: string[];
}

const FIELD = 'w-full bg-glass border border-border rounded-[10px] py-2 px-3 text-[13.5px] text-text outline-none focus:border-primary transition-colors duration-150';
const LABEL = 'text-[12px] font-medium text-text-faint mb-1 block';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block min-w-0">
            <span className={LABEL}>{label}</span>
            {children}
        </label>
    );
}

export default function EditSubmissionForm({ activity, onCancel, onSaved }: EditSubmissionFormProps) {
    const router = useRouter();
    const { t } = useLang();
    const [draft, setDraft] = useState<Draft>({
        name: activity.name,
        category: activity.category,
        topic: activity.topic,
        subtopic: activity.subtopic,
        location: activity.location,
        deadline: activity.deadline,
        desc: activity.desc,
        link: activity.link,
        positions: activity.positions,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const subtopics = topicSet.find(topic => topic.name === draft.topic)?.subtopics ?? [];

    function set<K extends keyof Draft>(key: K, value: Draft[K]): void {
        setDraft(prev => ({ ...prev, [key]: value }));
    }

    function changeTopic(topic: string): void {
        setDraft(prev => ({ ...prev, topic, subtopic: null }));
    }

    function togglePosition(position: string): void {
        setDraft(prev => ({
            ...prev,
            positions: prev.positions.includes(position)
                ? prev.positions.filter(p => p !== position)
                : [...prev.positions, position],
        }));
    }

    async function save(): Promise<void> {
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/admin/update', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id: activity.id, patch: draft }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/admin/login');
                    return;
                }
                setError(
                    isStringKey(data.code) ? t(data.code) : data.message || 'Không thể lưu.',
                );
                return;
            }
            onSaved();
        } catch {
            setError('Lỗi kết nối, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex flex-col gap-3 min-w-0">
            <Field label="Tên hoạt động">
                <input className={FIELD} value={draft.name} onChange={e => set('name', e.target.value)} />
            </Field>

            <Field label="Loại hình">
                <select className={FIELD} value={draft.category} onChange={e => set('category', e.target.value)}>
                    {categorySet.map(category => (
                        <option key={category.label} value={category.label}>{category.label}</option>
                    ))}
                </select>
            </Field>

            <div className="grid grid-cols-1 gap-3 sm2:grid-cols-2">
                <Field label="Chủ đề">
                    <select className={FIELD} value={draft.topic} onChange={e => changeTopic(e.target.value)}>
                        {topicSet.map(topic => (
                            <option key={topic.name} value={topic.name}>{topic.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Chủ đề phụ">
                    <select
                        className={FIELD}
                        value={draft.subtopic ?? ''}
                        onChange={e => set('subtopic', e.target.value || null)}
                    >
                        <option value="">— Không có —</option>
                        {subtopics.map(subtopic => (
                            <option key={subtopic} value={subtopic}>{subtopic}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Địa điểm">
                    <input className={FIELD} value={draft.location} onChange={e => set('location', e.target.value)} />
                </Field>

                <Field label="Hạn đăng ký">
                    <input type="date" className={FIELD} value={draft.deadline} onChange={e => set('deadline', e.target.value)} />
                </Field>
            </div>

            <Field label="Mô tả">
                <textarea
                    className={`${FIELD} min-h-[140px] resize-y leading-[1.6]`}
                    value={draft.desc}
                    onChange={e => set('desc', e.target.value)}
                />
            </Field>

            <Field label="Liên kết đăng ký">
                <input className={FIELD} value={draft.link} onChange={e => set('link', e.target.value)} />
            </Field>

            <div>
                <span className={LABEL}>Vị trí tuyển</span>
                <div className="flex gap-1.5 flex-wrap">
                    {POSITIONS.map(position => {
                        const active = draft.positions.includes(position);
                        return (
                            <button
                                key={position}
                                type="button"
                                onClick={() => togglePosition(position)}
                                className={`text-[12.5px] rounded-full py-1.5 px-3 border cursor-pointer transition-colors duration-150 ${
                                    active
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-glass text-text-dim border-border hover:border-primary'
                                }`}
                            >
                                {position}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            <div className="flex gap-2.5 flex-wrap mt-1">
                <button
                    type="button"
                    disabled={saving}
                    onClick={save}
                    className="bg-primary text-white rounded-[14px] py-2.5 px-5 font-semibold text-[14px] cursor-pointer disabled:opacity-60 disabled:cursor-default"
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                    type="button"
                    disabled={saving}
                    onClick={onCancel}
                    className="bg-glass border border-border rounded-[14px] py-2.5 px-5 font-semibold text-[14px] text-text cursor-pointer hover:border-primary transition-colors duration-150 disabled:opacity-60 disabled:cursor-default"
                >
                    Huỷ
                </button>
            </div>
        </div>
    );
}
