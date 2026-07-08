import { AppLogo } from '@/components/app-logo';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  trailing?: React.ReactNode;
};

/** Shared compact page header. */
export function PageHeader({
  eyebrow,
  title,
  trailing,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <AppLogo />
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sand">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="break-words font-serif text-3xl font-semibold tracking-tight text-teal">
            {title}
          </h1>
        </div>
      </div>
      <div className="shrink-0">{trailing}</div>
    </header>
  );
}
