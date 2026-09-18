import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { termsDoc } from '@/content/legal';

export const metadata: Metadata = {
    title: 'Điều khoản sử dụng · ECS Finder',
    description: 'Quy định khi gửi hoạt động lên ECS Finder, quyền kiểm duyệt và giới hạn trách nhiệm.',
};

export default function TermsPage() {
    return <LegalPage doc={termsDoc} />;
}
