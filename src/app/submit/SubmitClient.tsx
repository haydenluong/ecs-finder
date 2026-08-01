'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PreviewCard from './PreviewCard';
import PositionsDropdown from './PositionsDropdown';
import ImageCropper from './ImageCropper';
import { categorySet, topicSet } from '@/data/tagData';
import type { Activity, ImagePosition, Lang } from '@/types';

type SubmitFormValues = Omit<Activity, 'id' | 'status' | 'created_at' | 'image'> & {
    image?: FileList;
};

const MAX_DESC_WORDS = 350;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function countWords(s: string): number {
    return s.trim().split(/\s+/).filter(Boolean).length;
}

function formatBytes(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function validateImage(files: FileList | undefined): true | string {
    if (!files || files.length === 0) return 'Bắt buộc chọn ảnh';
    if (files.length !== 1) return 'Chỉ có thể tải lên 1 ảnh';

    const file = files[0];
    if (file.type === '' || file.type === 'image/heic' || file.type === 'image/heif') {
        return 'Ảnh HEIC (iPhone) chưa được hỗ trợ, vui lòng chọn JPEG/PNG/WebP';
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Chỉ chấp nhận JPEG, PNG hoặc WebP';
    if (file.size > MAX_IMAGE_BYTES) return `Ảnh quá lớn (${formatBytes(file.size)}), tối đa 5MB`;

    return true;
}

export default function SubmitClient() {
    const [lang, setLang] = useState<Lang>('VI');

    const { register, watch, resetField, setValue, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmitFormValues>({
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

    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    async function onSubmit(data: SubmitFormValues) {
        setSubmitError('');

        const fd = new FormData();
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
                setSubmitError(body.message ?? 'Gửi không thành công, vui lòng thử lại.');
            }
        } catch {
            setSubmitError('Không thể kết nối tới máy chủ, vui lòng thử lại.');
        }
    }

    return (
        <>
            <Navbar lang={lang} onLangChange={setLang} />
            <main className="bg-sky min-h-screen py-10 px-5">
                <div className="max-w-[1100px] mx-auto">
                    <h1 className="font-heading font-bold text-[26px] text-text mb-8">
                        Đăng hoạt động của bạn
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
                                <label className="text-[13px] text-text-dim">Tên hoạt động</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.name && <span className="text-[13px] text-red-600">Bắt buộc nhập</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Danh mục</label>
                                <select
                                    {...register('category', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                >
                                    <option value="">Chọn danh mục...</option>
                                    {categorySet.map(c => (
                                        <option key={c.label} value={c.label}>{c.label}</option>
                                    ))}
                                </select>
                                {errors.category && <span className="text-[13px] text-red-600">Bắt buộc chọn</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Chủ đề</label>
                                <select
                                    {...register('topic', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                >
                                    <option value="">Chọn chủ đề...</option>
                                    {topicSet.map(t => (
                                        <option key={t.name} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                {errors.topic && <span className="text-[13px] text-red-600">Bắt buộc chọn</span>}
                            </div>

                            {selectedTopic && subtopicsForTopic.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] text-text-dim">Chủ đề con</label>
                                    <select
                                        {...register('subtopic')}
                                        className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                    >
                                        <option value="">Không có</option>
                                        {subtopicsForTopic.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Địa điểm</label>
                                <input
                                    {...register('location', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.location && <span className="text-[13px] text-red-600">Bắt buộc nhập</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Hạn nộp</label>
                                <input
                                    type="date"
                                    {...register('deadline', { required: true })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none"
                                />
                                {errors.deadline && <span className="text-[13px] text-red-600">Bắt buộc chọn</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Vị trí tuyển</label>
                                <Controller
                                    name="positions"
                                    control={control}
                                    render={({ field }) => (
                                        <PositionsDropdown value={field.value} onChange={field.onChange} />
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Mô tả</label>
                                <textarea
                                    rows={5}
                                    {...register('desc', {
                                        required: true,
                                        validate: v => countWords(v) <= MAX_DESC_WORDS || `Tối đa ${MAX_DESC_WORDS} từ`,
                                    })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none resize-y"
                                />
                                <span className={`text-[12px] ${countWords(watched.desc) > MAX_DESC_WORDS ? 'text-red-600' : 'text-text-faint'}`}>
                                    {countWords(watched.desc)} / {MAX_DESC_WORDS} từ
                                </span>
                                {errors.desc?.type === 'required' && <span className="text-[13px] text-red-600">Bắt buộc nhập</span>}
                                {errors.desc?.type === 'validate' && <span className="text-[13px] text-red-600">{errors.desc.message}</span>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Ảnh hoạt động</label>
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
                                        Chọn ảnh...
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
                                                Xoá ảnh
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[13px] text-text-faint">JPEG, PNG hoặc WebP · tối đa 5MB</span>
                                    )}
                                </div>
                                {errors.image && <span className="text-[13px] text-red-600">{errors.image.message}</span>}
                                {previewUrl && (
                                    <ImageCropper key={previewUrl} src={previewUrl} onChange={setImagePosition} />
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] text-text-dim">Liên kết đăng ký (URL)</label>
                                <input
                                    placeholder="https://..."
                                    {...register('link', { required: true, pattern: /^https?:\/\/.+/ })}
                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text placeholder:text-text-faint focus:border-primary outline-none"
                                />
                                {errors.link?.type === 'required' && <span className="text-[13px] text-red-600">Bắt buộc nhập</span>}
                                {errors.link?.type === 'pattern' && <span className="text-[13px] text-red-600">Đường dẫn không hợp lệ</span>}
                            </div>

                            {submitError && (
                                <span className="text-[13px] text-red-600">{submitError}</span>
                            )}
                            {submitted && (
                                <span className="text-[13px] text-primary">Cảm ơn! Hoạt động của bạn đang chờ duyệt.</span>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary text-white rounded-[14px] py-3 px-6 font-semibold text-[14px] mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-default"
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Gửi hoạt động'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
