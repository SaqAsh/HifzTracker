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
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AppLogo />
        <div>
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sand">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-teal">
            {title}
          </h1>
        </div>
      </div>
      {trailing}
    </header>
  );
}
