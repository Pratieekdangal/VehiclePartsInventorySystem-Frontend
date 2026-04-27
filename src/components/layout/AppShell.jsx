import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Desktop shell used for Admin + Staff. Page content goes in <Outlet />.
// Topbar title/actions are page-driven via the optional <Topbar /> import,
// or by rendering <PageHeader/> inside the outlet for richer headings.
export default function AppShell({ navItems, sectionLabel, notificationsTo }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} sectionLabel={sectionLabel} />
      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar notificationsTo={notificationsTo} />
        <div className="flex-1 px-7 py-6 max-w-page w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
