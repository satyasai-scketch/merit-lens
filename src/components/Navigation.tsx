import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Download,
  Settings2,
  ClipboardList,
  BookOpen,
  TrendingUp
} from 'lucide-react';


const candidateNavItems = [
  { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidate/assessments', label: 'Assessments', icon: ClipboardList },

];

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/intakes', label: 'Intakes', icon: FileText },
  { to: '/admin/heatmap', label: 'Heatmap', icon: TrendingUp },
  { to: '/admin/retests', label: 'Retests', icon: Users },
  { to: '/admin/exports', label: 'Exports', icon: Download },
];

const superNavItems = [
  { to: '/super/rubric', label: 'Rubric Config', icon: Settings2 },
];

export function Navigation() {
  const { session } = useSession();

  if (!session || session.role === 'candidate') {
    return null; // Candidates use a different layout
  }

  const navItems = session.role === 'admin' ? adminNavItems : superNavItems;

  return (
    <nav className="w-64 bg-card border-r border-border shadow-subtle min-h-screen p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/candidate'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}