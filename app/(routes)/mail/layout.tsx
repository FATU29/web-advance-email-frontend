'use client';

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-sidebar dark:bg-sidebar w-full">{children}</div>;
}
