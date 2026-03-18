export const topicSet = [
    {
        name: 'STEM',
        subtopics: ['Khoa học tự nhiên', 'Công nghệ', 'Kỹ thuật / Robotics']
    },
    {
        name: 'Xã hội',
        subtopics: ['Thiện nguyện', 'Giáo dục', 'Bình đẳng xã hội', 'Môi trường', 'Văn hóa']
    },
    {
        name: 'Kinh tế',
        subtopics: ['Tài chính & Kinh doanh', 'Marketing']
    },
    {
        name: 'Nghệ thuật & Sáng tạo',
        subtopics: ['Hội họa', 'Viết & Biên tập', 'Thiết kế']
    },
    {
        name: 'Ngôn ngữ & Giao tiếp',
        subtopics: ['Tiếng Anh', 'Tranh biện & Hùng biện', 'Podcast']
    },
    {
        name: 'Sức khỏe',
        subtopics: ['Tâm lý học', 'Dinh dưỡng & Lối sống']
    }
];

export const categorySet = [
    { label: 'Cuộc thi (Tổ chức cuộc thi)', type: 'category' },
    { label: 'Cuộc thi (Tham gia cuộc thi)', type: 'category' },
    { label: 'Dự án & CLB', type: 'category' },
    { label: 'Sự kiện (Workshop, Talkshows, ...)', type: 'category' }
];


export const allTags = [
    ...categorySet,
    ...topicSet.flatMap(cat => [{ label: cat.name, type: 'topic' }, ...cat.subtopics.map(sub => ({ label: sub, type: 'subtopic', parent: cat.name }))])
];