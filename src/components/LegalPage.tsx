'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLang } from '@/i18n/LangProvider';
import type { LegalDoc } from '@/content/legal';

export default function LegalPage({ doc }: { doc: LegalDoc }) {
    const { lang, t } = useLang();
    const pick = lang === 'EN' ? 'en' : 'vi';

    return (
        <>
            <Navbar />
            <main className="bg-sky">
                <article className="max-w-[760px] mx-auto pt-12 px-[18px] pb-20 sm2:px-[22px] hero:px-10">
                    <h1 className="font-heading font-extrabold text-[clamp(28px,6vw,40px)] leading-[1.15] tracking-[-0.015em] text-text m-0">
                        {doc.title[pick]}
                    </h1>

                    <p className="text-[12.5px] font-medium text-text-faint mt-3 mb-0">
                        {t('legal.updated', { date: doc.updated })}
                    </p>

                    <p className="text-[16px] leading-[1.72] text-text-dim mt-6 mb-0">
                        {doc.intro[pick]}
                    </p>

                    <div className="flex flex-col gap-9 mt-11">
                        {doc.sections.map(section => (
                            <section key={section.heading.vi}>
                                <h2 className="font-heading font-bold text-[19px] tracking-[-0.01em] text-text m-0 mb-3">
                                    {section.heading[pick]}
                                </h2>

                                {section.body?.map(paragraph => (
                                    <p
                                        key={paragraph.vi}
                                        className="text-[15px] leading-[1.75] text-text-dim m-0 mb-3 last:mb-0"
                                    >
                                        {paragraph[pick]}
                                    </p>
                                ))}

                                {section.bullets && (
                                    <ul className="flex flex-col gap-2.5 mt-3 pl-0 list-none">
                                        {section.bullets.map(bullet => (
                                            <li key={bullet.vi} className="flex gap-3 text-[15px] leading-[1.75] text-text-dim">
                                                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-[9px]" />
                                                <span className="min-w-0">{bullet[pick]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}
