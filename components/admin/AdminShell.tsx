import { adminUi } from "./admin-ui";

export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={adminUi.shell}>
      <div className={adminUi.shellHeader}>
        <div>
          <p className={adminUi.kicker}>Admin</p>
          <h1 className={adminUi.title}>{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className={adminUi.statCard}>
      <p className={adminUi.statLabel}>{label}</p>
      <p className={adminUi.statValue}>{value}</p>
      {hint ? <p className={adminUi.statHint}>{hint}</p> : null}
    </div>
  );
}

export { StatCard };
