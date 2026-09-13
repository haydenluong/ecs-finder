import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Duyệt hoạt động — ECS Finder',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
