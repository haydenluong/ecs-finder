import type { CSSProperties } from 'react';
import type { Topic, CategoryTag } from '../types';

export const TOPIC_ACCENTS: Record<string, string> = {
    'STEM':                     '#12a6c9',
    'Xã hội':                   '#0db87a',
    'Môi trường':               '#0dba45',
    'Kinh tế':                  '#0d7aba',
    'Nghệ thuật & Sáng tạo':   '#7a5cff',
    'Ngôn ngữ & Giao tiếp':    '#3d5cff',
    'Sức khỏe':                 '#c933e6',
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
        subtopics: ['Thiện nguyện', 'Bình đẳng xã hội', 'Văn hóa / Du học']
    },
    {
        name: 'Môi trường',
        subtopics: []
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
        subtopics: ['Ngôn ngữ học', 'Tranh biện & Hùng biện']
    },
    {
        name: 'Sức khỏe',
        subtopics: ['Tâm lý học', 'Dinh dưỡng & Lối sống / Sức khỏe thể chất']
    }
];

export const categorySet: CategoryTag[] = [
    { label: 'Cuộc thi (Tổ chức cuộc thi)', type: 'category' },
    { label: 'Cuộc thi (Tham gia cuộc thi)', type: 'category' },
    { label: 'Dự án & CLB', type: 'category' },
    { label: 'Sự kiện (Workshop, Talkshows, ...)', type: 'category' }
];

export const POSITIONS = [
    'Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Dịch Thuật', 'Ban Nội Dung',
    'Ban Chuyên Môn', 'Ban Thiết Kế', 'Ban Tài chính Đối ngoại',
    'CTV Truyền Thông', 'Tình nguyện viên', 'Khác',
];
