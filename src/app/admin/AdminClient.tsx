'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PreviewCard from '@/app/submit/PreviewCard';
import type { Activity, ReviewStatus } from '@/types';

interface AdminClientProps {
    reviewer: string;
    status: ReviewStatus;
    activities: Activity[];
    loadFailed: boolean;
}

const TABS: { status: ReviewStatus; label: string }[] = [
    { status: 'pending', label: 'Chờ duyệt' },
    { status: 'approved', label: 'Đã duyệt' },
    { status: 'rejected', label: 'Đã từ chối' },
];

function formatTimestamp(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

/** Neutral grey is the "unknown" state — it must not read as a pass. */
function Signal({ tone, children }: { tone: 'good' | 'warn' | 'bad' | 'unknown'; children: React.ReactNode }) {
    const tones = {
        good: 'bg-[rgba(13,184,122,0.12)] text-[#0a7d54] border-[rgba(13,184,122,0.3)]',
        warn: 'bg-[rgba(227,143,63,0.12)] text-[#a35c14] border-[rgba(227,143,63,0.3)]',
        bad: 'bg-[rgba(227,63,63,0.1)] text-[#b32020] border-[rgba(227,63,63,0.28)]',
        unknown: 'bg-glass-2 text-text-faint border-border',
    };
    return (
        <span className={`text-[12px] font-medium py-[3px] px-2.5 rounded-full border ${tones[tone]}`}>
            {children}
        </span>
    );
}

function ContentCheckSignal({ activity }: { activity: Activity }) {
    // null covers both an older row and a failed Claude call (/api/submit fails
    // open), so it means unreviewed, not clean.
    switch (activity.content_check_verdict) {
        case 'ok':
            return <Signal tone="good">Nội dung: ổn</Signal>;
        case 'spam':
            return <Signal tone="bad">Nội dung: nghi spam</Signal>;
        case 'review':
            return <Signal tone="warn">Nội dung: cần xem kỹ</Signal>;
        default:
            return <Signal tone="unknown">Nội dung: chưa kiểm tra</Signal>;
    }
}

function LinkCheckSignal({ activity }: { activity: Activity }) {
    // Soft signal: Facebook and Google Forms routinely block bots, so a failure
    // means "click it yourself", not "reject".
    if (activity.link_check_passed === true) return <Signal tone="good">Liên kết: mở được</Signal>;
    if (activity.link_check_passed === false) return <Signal tone="warn">Liên kết: không mở được</Signal>;
    return <Signal tone="unknown">Liên kết: chưa kiểm tra</Signal>;
}

export default function AdminClient({ reviewer, status, activities, loadFailed }: AdminClientProps) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function decide(id: number, action: 'approve' | 'reject') {
        setBusyId(id);
        setError('');
        try {
            const res = await fetch('/api/admin/decide', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });
            const data = await res.json().catch(() => ({ message: '' }));

            if (!res.ok) {
                // Session expired mid-review: send them to log in again rather
                // than showing a dead-end error.
                if (res.status === 401) {
                    router.push('/admin/login');
                    return;
                }
                setError(data.message || 'Không thể cập nhật.');
                return;
            }
            // Re-runs the Server Component so the decided row leaves this tab.
            router.refresh();
        } catch {
            setError('Lỗi kết nối, vui lòng thử lại.');
        } finally {
            setBusyId(null);
        }
    }

    async function logout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.refresh();
        router.push('/admin/login');
    }

    return (
        <>
            <Navbar />
            <main className="bg-sky min-h-screen py-10 px-5">
                <div className="max-w-[1100px] mx-auto">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                        <div>
                            <h1 className="font-heading font-bold text-[26px] text-text mb-1">Duyệt hoạt động</h1>
                            <p className="text-[13px] text-text-faint">Đang đăng nhập với tên <strong className="text-text-dim">{reviewer}</strong></p>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text cursor-pointer hover:border-primary transition-colors duration-150 shrink-0"
                        >
                            Đăng xuất
                        </button>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-6">
                        {TABS.map(tab => (
                            <Link
                                key={tab.status}
                                href={`/admin?status=${tab.status}`}
                                className={`text-[13.5px] font-medium rounded-[14px] py-2 px-4 border transition-colors duration-150 ${
                                    tab.status === status
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-glass text-text-dim border-border hover:border-primary'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>

                    {loadFailed && (
                        <p className="text-[13px] text-red-600 mb-4">
                            Không thể tải danh sách hoạt động. Vui lòng tải lại trang.
                        </p>
                    )}
                    {error && <p className="text-[13px] text-red-600 mb-4">{error}</p>}

                    {activities.length === 0 && !loadFailed ? (
                        <p className="text-[14px] text-text-dim bg-glass border border-border rounded-2xl p-6">
                            Không có hoạt động nào trong mục này.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {activities.map(activity => (
                                <div
                                    key={activity.id}
                                    className="bg-glass border border-border rounded-2xl p-5 grid grid-cols-1 gap-5 items-start rail:grid-cols-[320px_1fr]"
                                >
                                    {/* Omitting onFileSelect/onBrowse renders it read-only. */}
                                    <PreviewCard
                                        name={activity.name}
                                        category={activity.category}
                                        topic={activity.topic}
                                        subtopic={activity.subtopic}
                                        location={activity.location}
                                        deadline={activity.deadline}
                                        positions={activity.positions}
                                        image={activity.image}
                                        imagePosition={activity.image_position}
                                    />

                                    <div className="flex flex-col gap-3.5 min-w-0">
                                        <div className="flex gap-2 flex-wrap">
                                            <ContentCheckSignal activity={activity} />
                                            <LinkCheckSignal activity={activity} />
                                        </div>

                                        {activity.content_check_reason && (
                                            <p className="text-[13px] text-text-dim italic">
                                                “{activity.content_check_reason}”
                                            </p>
                                        )}

                                        <div className="text-[13px] text-text-dim whitespace-pre-wrap break-words">
                                            {activity.desc}
                                        </div>

                                        <a
                                            href={activity.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[13px] text-primary underline break-all"
                                        >
                                            {activity.link}
                                        </a>

                                        <p className="text-[12px] text-text-faint">
                                            #{activity.id} · Gửi lúc {formatTimestamp(activity.created_at)}
                                            {activity.reviewed_by && (
                                                <> · {status === 'approved' ? 'Duyệt' : 'Từ chối'} bởi {activity.reviewed_by} lúc {formatTimestamp(activity.reviewed_at ?? undefined)}</>
                                            )}
                                        </p>

                                        <div className="flex gap-2.5 flex-wrap mt-1">
                                            {status !== 'approved' && (
                                                <button
                                                    type="button"
                                                    disabled={busyId === activity.id}
                                                    onClick={() => decide(activity.id, 'approve')}
                                                    className="bg-primary text-white rounded-[14px] py-2.5 px-5 font-semibold text-[14px] cursor-pointer disabled:opacity-60 disabled:cursor-default"
                                                >
                                                    {busyId === activity.id ? 'Đang lưu...' : 'Duyệt'}
                                                </button>
                                            )}
                                            {status !== 'rejected' && (
                                                <button
                                                    type="button"
                                                    disabled={busyId === activity.id}
                                                    onClick={() => decide(activity.id, 'reject')}
                                                    className="bg-glass border border-border rounded-[14px] py-2.5 px-5 font-semibold text-[14px] text-text cursor-pointer hover:border-[#e33f3f] hover:text-[#b32020] transition-colors duration-150 disabled:opacity-60 disabled:cursor-default"
                                                >
                                                    {busyId === activity.id ? 'Đang lưu...' : 'Từ chối'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
