import type { Activity, TopicFilter, DeadlineFilter } from '../types';

export interface FilterParams {
    searchQuery: string;
    categoryFilter: string;
    deadlineFilter: DeadlineFilter;
    topicFilters: TopicFilter;
    positionFilters: string[];
}

export function daysLeft(iso: string): number | null {
    if (!iso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(iso);
    return Math.round((deadline.getTime() - today.getTime()) / 86400000);
}

export function filterActivities(activities: Activity[], { searchQuery, categoryFilter, deadlineFilter, topicFilters, positionFilters }: FilterParams): Activity[] {
    const selectedTopics = new Set(topicFilters.topics);
    const selectedPositions = new Set(positionFilters);
    return activities.filter(a => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const hit = [a.name, a.topic, a.subtopic, a.location]
                .filter(Boolean).some(s => s!.toLowerCase().includes(q));
            if (!hit) return false;
        }
        if (categoryFilter && a.category !== categoryFilter) return false;
        if (deadlineFilter) {
            const days = daysLeft(a.deadline);
            if (days === null || days < 0) return false;
            if (deadlineFilter === 'week'  && days > 7)  return false;
            if (deadlineFilter === 'month' && days > 30) return false;
        }
        const { topics, subtopics } = topicFilters;
        if (topics.length > 0 || subtopics.length > 0) {
            const subtopicsForActivity = subtopics.filter(s => s.parent === a.topic);
            if (subtopicsForActivity.length > 0) {
                if (!subtopicsForActivity.some(s => s.subtopic === a.subtopic)) return false;
            } else if (topics.length > 0) {
                if (!selectedTopics.has(a.topic)) return false;
            }
        }
        if (positionFilters.length > 0) {
            if (!a.positions?.some(p => selectedPositions.has(p))) return false;
        }
        return true;
    });
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    name: 'Cuộc Thi Lập Trình AI Quốc Gia 2025',
    category: 'Cuộc thi (Tham gia cuộc thi)',
    topic: 'STEM',
    subtopic: 'Lập trình / AI / Khoa học dữ liệu',
    location: 'Hà Nội',
    deadline: '2025-08-15',
    positions: ['Thí sinh'],
    desc: 'Sân chơi lập trình AI dành cho học sinh THPT và sinh viên đại học toàn quốc. Thử thách bạn xây dựng mô hình học máy giải quyết bài toán thực tế trong vòng 48 giờ.',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    link: '#',
  },
  {
    id: 2,
    name: 'CLB Kinh Doanh Trẻ BizGen',
    category: 'Dự án & CLB',
    topic: 'Kinh tế',
    subtopic: 'Tài chính & Kinh doanh',
    location: 'TP. Hồ Chí Minh',
    deadline: '2025-07-28',
    positions: ['Ban Nhân Sự', 'Ban Truyền Thông', 'Ban Tài chính Đối ngoại'],
    desc: 'BizGen là câu lạc bộ kinh doanh trẻ với hơn 200 thành viên, nơi các bạn trẻ cùng nhau học hỏi, xây dựng dự án khởi nghiệp và kết nối với cộng đồng doanh nhân.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80',
    link: '#',
  },
  {
    id: 3,
    name: 'Workshop Thiết Kế UX/UI Thực Chiến',
    category: 'Sự kiện (Workshop, Talkshows, ...)',
    topic: 'Nghệ thuật & Sáng tạo',
    subtopic: null,
    location: 'Đà Nẵng & Online',
    deadline: '2025-07-22',
    positions: ['Tình nguyện viên', 'Ban Thiết Kế'],
    desc: 'Workshop 2 ngày về thiết kế UX/UI từ cơ bản đến nâng cao. Học cách nghiên cứu người dùng, wireframing và tạo prototype chuyên nghiệp với Figma.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    link: '#',
  },
  {
    id: 4,
    name: 'Dự Án Xanh - Bảo Vệ Rừng Ngập Mặn',
    category: 'Dự án & CLB',
    topic: 'Môi trường',
    subtopic: null,
    location: 'Cà Mau',
    deadline: '2025-09-01',
    positions: ['Tình nguyện viên', 'Ban Nội Dung', 'Ban Truyền Thông'],
    desc: 'Dự án bảo vệ và phục hồi 500 ha rừng ngập mặn ở đồng bằng sông Cửu Long. Tham gia để trực tiếp trồng cây, nghiên cứu hệ sinh thái và truyền thông môi trường.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    link: '#',
  },
  {
    id: 5,
    name: 'Olympiad Tranh Biện Tiếng Anh IMAS 2025',
    category: 'Cuộc thi (Tổ chức cuộc thi)',
    topic: 'Ngôn ngữ & Giao tiếp',
    subtopic: 'Tranh biện & Hùng biện',
    location: 'Hà Nội',
    deadline: '2025-07-20',
    positions: ['Ban Nhân Sự', 'Ban Dịch Thuật', 'Ban Nội Dung'],
    desc: 'Giải tranh biện tiếng Anh học thuật dành cho học sinh THPT, quy mô toàn quốc với hơn 300 đội tham dự. Format British Parliamentary, có giải thưởng tổng trị giá 50 triệu đồng.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
    link: '#',
  },
  {
    id: 6,
    name: 'CLB Sức Khỏe Tâm Thần GenZ',
    category: 'Dự án & CLB',
    topic: 'Sức khỏe',
    subtopic: 'Tâm lý học',
    location: 'Online',
    deadline: '2025-08-05',
    positions: ['Ban Nhân Sự', 'CTV Truyền Thông', 'Ban Chuyên Môn'],
    desc: 'Cộng đồng hỗ trợ sức khỏe tâm thần cho Gen Z, hoạt động qua các nhóm peer support, workshop và nội dung giáo dục tâm lý. Tìm kiếm thành viên mới có niềm đam mê tâm lý học.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    link: '#',
  },
  {
    id: 7,
    name: 'Hackathon Xã Hội - Social Impact 2025',
    category: 'Cuộc thi (Tham gia cuộc thi)',
    topic: 'Xã hội',
    subtopic: 'Bình đẳng xã hội',
    location: 'TP. Hồ Chí Minh',
    deadline: '2025-08-20',
    positions: ['Thí sinh'],
    desc: 'Hackathon 36 giờ với chủ đề tác động xã hội. Các đội sẽ thiết kế giải pháp công nghệ cho các vấn đề bình đẳng giáo dục, y tế cộng đồng và phát triển nông thôn.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    link: '#',
  },
  {
    id: 8,
    name: 'Festival Nghệ Thuật Đường Phố ArtWalk',
    category: 'Sự kiện (Workshop, Talkshows, ...)',
    topic: 'Nghệ thuật & Sáng tạo',
    subtopic: 'Hội họa',
    location: 'TP. Hồ Chí Minh',
    deadline: '2025-07-25',
    positions: ['Tình nguyện viên', 'Ban Thiết Kế', 'CTV Truyền Thông'],
    desc: 'Lễ hội nghệ thuật đường phố quy mô lớn nhất TP.HCM với hơn 50 nghệ sĩ tham gia, khu vực vẽ live, triển lãm và các workshop graffiti, illustration miễn phí.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80',
    link: '#',
  },
];
