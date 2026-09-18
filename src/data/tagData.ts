import type { CSSProperties } from 'react';
import type { Topic, CategoryTag, Lang } from '../types';

export const TOPIC_ACCENTS: Record<string, string> = {
    'STEM':                     '#12a6c9',
    'Xã hội':                   '#0db87a',
    // 'Môi trường' is a subtopic of 'Xã hội' now; kept so rows still carrying it
    // as their topic keep their colour until the DB is migrated.
    'Môi trường':               '#0dba45',
    'Kinh tế':                  '#0d7aba',
    'Nghệ thuật & Sáng tạo':   '#7a5cff',
    'Ngôn ngữ & Giao tiếp':    '#3d5cff',
    'Sức khỏe':                 '#c933e6',
    'Giáo dục':                 '#e07a1f',
};

const FALLBACK_ACCENT = '#1a6fd0';

function rgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${Math.round(alpha * 1e4) / 1e4})`;
}

export function accentVars(topic: string): CSSProperties {
    const hex = TOPIC_ACCENTS[topic] ?? FALLBACK_ACCENT;
    return {
        '--topic': hex,
        '--topic-07': rgba(hex, 17 / 255),
        '--topic-08': rgba(hex, 0.08),
        '--topic-13': rgba(hex, 34 / 255),
        '--topic-20': rgba(hex, 51 / 255),
        '--topic-27': rgba(hex, 68 / 255),
        '--topic-40': rgba(hex, 0.4),
        '--topic-60': rgba(hex, 0.6),
        '--topic-70': rgba(hex, 0.7),
        '--topic-75': rgba(hex, 0.75),
    } as CSSProperties;
}

export const topicSet: Topic[] = [
    {
        name: 'STEM',
        subtopics: ['Khoa học tự nhiên', 'Lập trình / AI / Khoa học dữ liệu', 'Kỹ thuật / Robotics']
    },
    {
        name: 'Xã hội',
        subtopics: ['Thiện nguyện', 'Bình đẳng xã hội', 'Văn hóa / Du học', 'Môi trường']
    },
    {
        name: 'Kinh tế',
        subtopics: ['Tài chính & Kinh doanh', 'Marketing', 'Gây quỹ']
    },
    {
        name: 'Nghệ thuật & Sáng tạo',
        subtopics: ['Văn học & Thơ', 'Hội họa', 'Viết', 'Thời trang']
    },
    {
        name: 'Ngôn ngữ & Giao tiếp',
        subtopics: ['Ngôn ngữ học (Tiếng Anh, Tiếng Trung,..)', 'Tranh biện & Hùng biện', 'Ngoại giao & quan hệ quốc tế']
    },
    {
        name: 'Sức khỏe',
        subtopics: ['Tâm lý học', 'Thể thao / Dinh dưỡng & Lối sống / Sức khỏe thể chất']
    },
    {
        name: 'Giáo dục',
        subtopics: ['Dạy học (phi lợi nhuận)', 'Nghiên cứu khoa học', 'Hướng nghiệp']
    }
];

export const categorySet: CategoryTag[] = [
    { label: 'Cuộc thi (Tổ chức cuộc thi)', type: 'category' },
    { label: 'Cuộc thi (Tham gia cuộc thi)', type: 'category' },
    { label: 'Dự án & CLB', type: 'category' },
    { label: 'Sự kiện (Workshop, Talkshows, ...)', type: 'category' },
    { label: 'Chương trình Thực tập', type: 'category' },
    { label: 'Học bổng', type: 'category' }
];

export const POSITIONS = [
    'Co-Founder',
    'Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung',
    'Ban Podcast', 'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại',
    'CTV Truyền Thông', 'Tình nguyện viên', 'Khác',
];


const TOPIC_EN: Record<string, string> = {
    'STEM':                     'STEM',
    'Xã hội':                   'Society',
    'Môi trường':               'Environment',
    'Kinh tế':                  'Economics',
    'Nghệ thuật & Sáng tạo':   'Arts & Creativity',
    'Ngôn ngữ & Giao tiếp':    'Language & Communication',
    'Sức khỏe':                 'Health',
    'Giáo dục':                 'Education',
};

const SUBTOPIC_EN: Record<string, string> = {
    'Khoa học tự nhiên':                            'Natural Sciences',
    'Lập trình / AI / Khoa học dữ liệu':            'Programming / AI / Data Science',
    'Kỹ thuật / Robotics':                          'Engineering / Robotics',
    'Thiện nguyện':                                 'Volunteering & Charity',
    'Bình đẳng xã hội':                             'Social Equality',
    'Văn hóa / Du học':                             'Culture / Studying Abroad',
    'Môi trường':                                   'Environment',
    'Tài chính & Kinh doanh':                       'Finance & Business',
    'Marketing':                                    'Marketing',
    'Gây quỹ':                                      'Fundraising',
    'Văn học & Thơ':                                'Literature & Poetry',
    'Hội họa':                                      'Painting',
    'Viết':                                         'Writing',
    'Thời trang':                                   'Fashion',
    'Ngôn ngữ học':                                 'Linguistics',
    'Tranh biện & Hùng biện':                       'Debate & Public Speaking',
    'Ngoại giao & quan hệ quốc tế':                 'Diplomacy & International Relations',
    'Tâm lý học':                                   'Psychology',
    'Thể thao / Dinh dưỡng & Lối sống / Sức khỏe thể chất':   'Sports / Nutrition & Lifestyle / Physical Health',
    'Dạy học (phi lợi nhuận)':                      'Non-profit Teaching',
    'Nghiên cứu khoa học':                          'Scientific Research',
    'Hướng nghiệp':                                 'Career Guidance',
};

const CATEGORY_EN: Record<string, string> = {
    'Cuộc thi (Tổ chức cuộc thi)':          'Competitions (Hosting)',
    'Cuộc thi (Tham gia cuộc thi)':         'Competitions (Entering)',
    'Dự án & CLB':                          'Projects & Clubs',
    'Sự kiện (Workshop, Talkshows, ...)':   'Events (Workshops, Talks, ...)',
    'Chương trình Thực tập':                'Internships',
    'Học bổng':                             'Scholarships',
};

const POSITION_EN: Record<string, string> = {
    'Co-Founder':                'Co-Founder',
    'Ban Nhân Sự':               'Human Resources',
    'Ban Truyền Thông':          'Communications',
    'Ban Dịch Thuật':            'Translation',
    'Ban Nội Dung':              'Content',
    'Ban Podcast':               'Podcast',
    'Ban Chuyên Môn':            'Academics',
    'Ban Thiết Kế':              'Design',
    'Ban Tài chính Đối ngoại':  'Finance & External Relations',
    'CTV Truyền Thông':          'Communications Contributor',
    'Tình nguyện viên':          'Volunteer',
    'Thí sinh':                  'Contestant',
    'Khác':                      'Other',
};

// Locations are free text, so these are substituted wherever they appear rather
// than matched whole — real values include "Đà Nẵng & Online" and "TP.HCM".
// Longest first, so "TP. Hồ Chí Minh" is not half-replaced by "Hồ Chí Minh".
const LOCATION_EN: [RegExp, string][] = ([
    ['TP. Hồ Chí Minh', 'Ho Chi Minh City'],
    ['TP.Hồ Chí Minh', 'Ho Chi Minh City'],
    ['Thành phố Hồ Chí Minh', 'Ho Chi Minh City'],
    ['Hồ Chí Minh', 'Ho Chi Minh City'],
    ['TP.HCM', 'Ho Chi Minh City'],
    ['TPHCM', 'Ho Chi Minh City'],
    ['Hà Nội', 'Hanoi'],
    ['Đà Nẵng', 'Da Nang'],
    ['Hải Phòng', 'Hai Phong'],
    ['Cần Thơ', 'Can Tho'],
    ['Cà Mau', 'Ca Mau'],
    ['Huế', 'Hue'],
    ['Toàn quốc', 'Nationwide'],
    ['Toàn cầu', 'Global'],
    ['Trực tuyến', 'Online'],
] as [string, string][])
    .sort((a, b) => b[0].length - a[0].length)
    .map(([from, to]) => [new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to]);

function label(map: Record<string, string>, vi: string, lang: Lang): string {
    return lang === 'EN' ? map[vi] ?? vi : vi;
}

export function topicLabel(vi: string, lang: Lang): string {
    return label(TOPIC_EN, vi, lang);
}

export function subtopicLabel(vi: string, lang: Lang): string {
    return label(SUBTOPIC_EN, vi, lang);
}

export function categoryLabel(vi: string, lang: Lang): string {
    return label(CATEGORY_EN, vi, lang);
}

export function positionLabel(vi: string, lang: Lang): string {
    return label(POSITION_EN, vi, lang);
}

export function locationLabel(vi: string, lang: Lang): string {
    if (lang !== 'EN' || !vi) return vi;
    return LOCATION_EN.reduce((out, [pattern, to]) => out.replace(pattern, to), vi);
}

// Every English label, for the search index: search matches both languages
// regardless of the current UI language, so switching cannot change results.
export function englishLabelsFor(activity: {
    category: string; topic: string; subtopic: string | null; location: string;
}): string[] {
    return [
        CATEGORY_EN[activity.category],
        TOPIC_EN[activity.topic],
        activity.subtopic ? SUBTOPIC_EN[activity.subtopic] : undefined,
        locationLabel(activity.location, 'EN'),
    ].filter((s): s is string => Boolean(s));
}
