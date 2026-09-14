'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useForm, Controller } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PreviewCard from './PreviewCard';
import PositionsDropdown from './PositionsDropdown';
import ImageCropper from './ImageCropper';
import { categorySet, topicSet, categoryLabel, topicLabel, subtopicLabel } from '@/data/tagData';
import { useLang } from '@/i18n/LangProvider';
import { isStringKey, type StringKey } from '@/i18n/strings';
import type { Activity, ImagePosition } from '@/types';

declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: {
                sitekey: string;
                callback: (token: string) => void;
                'expired-callback'?: () => void;
            }) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

type SubmitFormValues = Omit<Activity, 'id' | 'status' | 'created_at' | 'image' | 'desc_en'> & {
    image?: FileList;
};

// /api/submit reports which field an error belongs to. Everything except 'form'
// is a real form field, so the error is shown next to that input instead of in
// the page-level banner.
const SERVER_FIELDS = [
    'name', 'category', 'topic', 'subtopic', 'location',
    'deadline', 'desc', 'link', 'image', 'positions',
] as const;

function isServerField(value: unknown): value is (typeof SERVER_FIELDS)[number] {
    return typeof value === 'string' && (SERVER_FIELDS as readonly string[]).includes(value);
}

const MAX_DESC_WORDS = 350;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function countWords(s: string): number {
    return s.trim().split(/\s+/).filter(Boolean).length;
}

function formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// Returns a string KEY, not a rendered message. react-hook-form only re-runs a
// validator when the value changes, so a rendered string would stay in the old
// language after a toggle; the display site translates it on every render.
function validateImage(files: FileList | undefined): true | StringKey {
    if (!files || files.length === 0) return 'error.image.required';
    if (files.length !== 1) return 'error.image.tooMany';

    const file = files[0];
    if (file.type === '' || file.type === 'image/heic' || file.type === 'image/heif') {
        return 'error.image.heic';
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'error.image.badType';
    if (file.size > MAX_IMAGE_BYTES) return 'error.image.tooLarge';

    return true;
}

export default function SubmitClient() {
    const { t, lang } = useLang();

    const { register, watch, resetField, setValue, setError, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmitFormValues>({
        defaultValues: {
            name: '', category: '', topic: '', subtopic: null, location: '',
            deadline: '', positions: [], desc: '', link: '',
        },
    });

    const watched = watch();
    const selectedTopic = watched.topic;
    const subtopicsForTopic = topicSet.find(t => t.name === selectedTopic)?.subtopics ?? [];

    useEffect(() => {
        resetField('subtopic', { defaultValue: null });
    }, [selectedTopic, resetField]);

    const imageFile = watched.image?.[0];
    const [previewUrl, setPreviewUrl] = useState('');
    const [imagePosition, setImagePosition] = useState<ImagePosition | null>(null);

    useEffect(() => {
        setImagePosition(null);
        if (!imageFile) {
            setPreviewUrl('');
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const { ref: registerImageRef, ...imageField } = register('image', { validate: validateImage });
    const imageInputRef = useRef<HTMLInputElement | null>(null);

    function selectImageFile(file: File) {
        const dt = new DataTransfer();
        dt.items.add(file);
        setValue('image', dt.files, { shouldValidate: true });
    }

    const [submitErrorKey, setSubmitErrorKey] = useState<StringKey | ''>('');
    const [submitted, setSubmitted] = useState(false);

    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const turnstileWidgetId = useRef<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState('');

    // Renders the widget if the script is already loaded. Called both from the
    // effect below (covers client-side navigation, where api.js loaded on an
    // earlier visit and next/script's onLoad won't fire again) and from the
    // Script's onLoad (covers the very first load in a session).
    function renderTurnstile() {
        if (turnstileWidgetId.current || !turnstileContainerRef.current || !window.turnstile) return;
        turnstileWidgetId.current = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            callback: token => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(''),
        });
    }

    useEffect(() => {
        renderTurnstile();

        return () => {
            if (turnstileWidgetId.current && window.turnstile) {
                window.turnstile.remove(turnstileWidgetId.current);
            }
            turnstileWidgetId.current = null;
        };
    }, []);

    async function onSubmit(data: SubmitFormValues) {
        setSubmitErrorKey('');

        if (!turnstileToken) {
            setSubmitErrorKey('error.turnstile.missing');
            return;
        }

        const fd = new FormData();
        fd.append('cf_turnstile_response', turnstileToken);
        fd.append('name', data.name);
        fd.append('category', data.category);
        fd.append('topic', data.topic);
        fd.append('subtopic', data.subtopic ?? '');
        fd.append('location', data.location);
        fd.append('deadline', data.deadline);
        fd.append('desc', data.desc);
        fd.append('link', data.link);
        fd.append('positions', JSON.stringify(data.positions));
        fd.append('image', data.image![0]);
        fd.append('image_position', JSON.stringify(imagePosition));

        try {
            const res = await fetch('/api/submit', { method: 'POST', body: fd });
            const body = await res.json();
            if (res.ok && body.ok) {
                setSubmitted(true);
            } else {
                const code = isStringKey(body.code) ? body.code : 'error.generic';
                if (isServerField(body.field)) {
                    setError(body.field, { type: 'server', message: code });
                } else {
                    setSubmitErrorKey(code);
                }
                resetTurnstile();
            }
        } catch {
            setSubmitErrorKey('error.network');
            resetTurnstile();
        }
    }

    function resetTurnstile() {
        setTurnstileToken('');
        if (turnstileWidgetId.current && window.turnstile) {
            window.turnstile.reset(turnstileWidgetId.current);
        }
    }

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="afterInteractive"
                onLoad={renderTurnstile}
            />
            <Navbar />
            <main className="bg-sky min-h-screen py-10 px-5">
                <div className="max-w-[1100px] mx-auto">
                    <h1 className="font-heading font-bold text-[26px] text-text mb-8">
                        {t('submit.title')}
                    </h1>

                    <div className="grid grid-cols-1 gap-[34px] items-start rail:grid-cols-[1fr_380px]">
                        <PreviewCard
                            className="rail:order-last"
                            name={watched.name}
                            category={watched.category}
                            topic={watched.topic}
                            subtopic={watched.subtopic}
                            location={watched.location}
                            deadline={watched.deadline}
                            positions={watched.positions}
                            image={previewUrl}
                            imagePosition={imagePosition}
                            onFileSelect={selectImageFile}
                            onBrowse={() => imageInputRef.current?.click()}
                        />

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-glass border border-border rounded-2xl p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.name')}</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.name && <span className="text-[13px] text-red-600">{t(isStringKey(errors.name.message) ? errors.name.message : 'error.required')}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.category')}</label>
                                <select
                                    {...register('category', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                >
                                    <option value="">{t('submit.categoryPlaceholder')}</option>
                                    {categorySet.map(c => (
                                        <option key={c.label} value={c.label}>{categoryLabel(c.label, lang)}</option>
                                    ))}
                                </select>
                                {errors.category && <span className="text-[13px] text-red-600">{t(isStringKey(errors.category.message) ? errors.category.message : 'error.requiredSelect')}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.topic')}</label>
                                <select
                                    {...register('topic', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                >
                                    <option value="">{t('submit.topicPlaceholder')}</option>
                                    {topicSet.map(topic => (
                                        <option key={topic.name} value={topic.name}>{topicLabel(topic.name, lang)}</option>
                                    ))}
                                </select>
                                {errors.topic && <span className="text-[13px] text-red-600">{t(isStringKey(errors.topic.message) ? errors.topic.message : 'error.requiredSelect')}</span>}
                            </div>

                            {selectedTopic && subtopicsForTopic.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-text-dim">{t('submit.subtopic')}</label>
                                    <select
                                        {...register('subtopic')}
                                        className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                    >
                                        <option value="">{t('submit.subtopicNone')}</option>
                                        {subtopicsForTopic.map(s => (
                                            <option key={s} value={s}>{subtopicLabel(s, lang)}</option>
                                        ))}
                                    </select>
                                    {isStringKey(errors.subtopic?.message) && (
                                        <span className="text-[13px] text-red-600">{t(errors.subtopic.message)}</span>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.location')}</label>
                                <input
                                    {...register('location', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.location && <span className="text-[13px] text-red-600">{t(isStringKey(errors.location.message) ? errors.location.message : 'error.required')}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.deadline')}</label>
                                <input
                                    type="date"
                                    {...register('deadline', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.deadline && <span className="text-[13px] text-red-600">{t(isStringKey(errors.deadline.message) ? errors.deadline.message : 'error.requiredSelect')}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.positions')}</label>
                                <Controller
                                    name="positions"
                                    control={control}
                                    render={({ field }) => (
                                        <PositionsDropdown value={field.value} onChange={field.onChange} />
                                    )}
                                />
                                {isStringKey(errors.positions?.message) && (
                                    <span className="text-[13px] text-red-600">{t(errors.positions.message)}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.desc')}</label>
                                <textarea
                                    rows={5}
                                    {...register('desc', {
                                        required: true,
                                        validate: v => countWords(v) <= MAX_DESC_WORDS,
                                    })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none resize-y"
                                />
                                <span className={`text-[12px] ${countWords(watched.desc) > MAX_DESC_WORDS ? 'text-red-600' : 'text-text-faint'}`}>
                                    {t('submit.wordCount', { count: countWords(watched.desc), max: MAX_DESC_WORDS })}
                                </span>
                                {errors.desc && (
                                    <span className="text-[13px] text-red-600">
                                        {t(
                                            isStringKey(errors.desc.message) ? errors.desc.message
                                                : errors.desc.type === 'validate' ? 'error.desc.tooLong'
                                                : 'error.required',
                                            { max: MAX_DESC_WORDS },
                                        )}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.image')}</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    {...imageField}
                                    ref={el => { registerImageRef(el); imageInputRef.current = el; }}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => imageInputRef.current?.click()}
                                        className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text cursor-pointer hover:border-primary transition-colors duration-150 shrink-0"
                                    >
                                        {t('submit.chooseImage')}
                                    </button>
                                    {imageFile ? (
                                        <>
                                            <span className="text-[13px] text-text-dim truncate">
                                                {imageFile.name} ({formatBytes(imageFile.size)})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => resetField('image')}
                                                className="text-[13px] text-text-faint hover:text-primary cursor-pointer shrink-0 ml-auto"
                                            >
                                                {t('submit.removeImage')}
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[13px] text-text-faint">{t('submit.imageHint')}</span>
                                    )}
                                </div>
                                {errors.image?.message && (
                                    <span className="text-[13px] text-red-600">
                                        {t(errors.image.message as StringKey, imageFile ? { size: formatBytes(imageFile.size) } : undefined)}
                                    </span>
                                )}
                                {previewUrl && (
                                    <ImageCropper key={previewUrl} src={previewUrl} onChange={setImagePosition} />
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">{t('submit.link')}</label>
                                <input
                                    placeholder="https://..."
                                    {...register('link', { required: true, pattern: /^https?:\/\/.+/ })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text placeholder:text-text-faint focus:border-primary outline-none"
                                />
                                {errors.link && (
                                    <span className="text-[13px] text-red-600">
                                        {t(
                                            isStringKey(errors.link.message) ? errors.link.message
                                                : errors.link.type === 'pattern' ? 'error.link.invalid'
                                                : 'error.required',
                                        )}
                                    </span>
                                )}
                            </div>

                            <div ref={turnstileContainerRef} />

                            {submitErrorKey && (
                                <span className="text-[13px] text-red-600">{t(submitErrorKey)}</span>
                            )}
                            {submitted && (
                                <span className="text-[13px] text-primary">{t('submit.success')}</span>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary text-white rounded-[14px] py-3 px-6 font-semibold text-[14px] mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-default"
                            >
                                {t(isSubmitting ? 'submit.submitting' : 'submit.submitButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
