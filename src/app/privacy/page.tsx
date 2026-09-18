import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { privacyDoc } from '@/content/legal';

export const metadata: Metadata = {
    title: 'Chính sách quyền riêng tư · ECS Finder',
    description: 'ECS Finder thu thập dữ liệu gì, dùng để làm gì, chia sẻ với ai và bạn có những quyền nào.',
};

export default function PrivacyPage() {
    return <LegalPage doc={privacyDoc} />;
}
