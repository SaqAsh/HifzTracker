import { TeacherShell } from '@/components/teacher-shell';
import { requireTeacher } from '@/lib/auth';

type TeacherLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

/** Auth-protected teacher route group. */
export default async function TeacherLayout({
  children,
}: TeacherLayoutProps): Promise<React.JSX.Element> {
  await requireTeacher();

  return <TeacherShell>{children}</TeacherShell>;
}
