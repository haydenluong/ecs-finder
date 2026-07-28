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
