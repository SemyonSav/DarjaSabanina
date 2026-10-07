import { SettingsTabs } from "@/components/admin/home/SettingsTabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SettingsTabs />
      {children}
    </>
  );
}
