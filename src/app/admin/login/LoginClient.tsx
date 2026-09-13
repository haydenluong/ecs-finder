'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Lang } from '@/types';

export default function LoginClient() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>('VI');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json().catch(() => ({ message: '' }));

            if (!res.ok) {
                setError(data.message || 'Không thể đăng nhập.');
                setPassword('');
                return;
            }

            // refresh() before push() so the /admin Server Component re-runs with
            // the cookie just set, not a render cached from before it existed.
            router.refresh();
            router.push('/admin');
        } catch {
            setError('Lỗi kết nối, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Navbar lang={lang} onLangChange={setLang} />
            <main className="bg-sky min-h-screen py-10 px-5">
                <div className="max-w-[420px] mx-auto">
                    <h1 className="font-heading font-bold text-[26px] text-text mb-2">Duyệt hoạt động</h1>
                    <p className="text-[14px] text-text-dim mb-8">Trang này chỉ dành cho người kiểm duyệt.</p>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-glass border border-border rounded-2xl p-6 flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="admin-password" className="text-[13px] text-text-dim">Mật khẩu</label>
                            <input
                                id="admin-password"
                                type="password"
                                autoComplete="current-password"
                                autoFocus
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-glass border border-border rounded-[14px] py-2.5 px-[14px] text-[14px] text-text focus:border-primary outline-none placeholder:text-text-faint"
                            />
                            {error && <span className="text-[13px] text-red-600">{error}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || password === ''}
                            className="bg-primary text-white rounded-[14px] py-3 px-6 font-semibold text-[14px] mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-default"
                        >
                            {submitting ? 'Đang kiểm tra...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
