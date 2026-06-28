import { updateSettings } from '@/app/actions';
import {
  Field,
  fieldClassName,
  primaryButtonClassName,
} from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { requireTeacher } from '@/lib/auth';

type SettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Teacher settings page. */
export default async function SettingsPage({
  searchParams,
}: SettingsPageProps): Promise<React.JSX.Element> {
  const { settings } = await requireTeacher();
  const params = await searchParams;

  return (
    <>
      <PageHeader eyebrow="Defaults" title="Settings" />
      {params?.saved === '1' ? (
        <p className="rounded-2xl bg-sage px-4 py-3 text-sm font-semibold text-ink">
          Settings saved.
        </p>
      ) : null}
      <section className="rounded-[2rem] border border-teal/15 bg-cream p-4 shadow-sm">
        <form action={updateSettings} className="grid gap-4">
          <Field label="Default max mistakes per session">
            <input
              className={fieldClassName}
              name="maxMistakesPerSession"
              type="number"
              min="1"
              defaultValue={settings.max_mistakes_per_session}
              required
            />
          </Field>
          <p className="text-sm text-ink/60"></p>
          <button className={primaryButtonClassName} type="submit">
            Save Settings
          </button>
        </form>
      </section>
    </>
  );
}
