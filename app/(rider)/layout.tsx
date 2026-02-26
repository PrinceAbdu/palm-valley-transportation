import RiderLayout from '@/components/layout/RiderLayout';

export default function RiderRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <RiderLayout>{children}</RiderLayout>;
}
