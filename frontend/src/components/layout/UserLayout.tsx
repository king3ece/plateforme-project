import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FileText, CheckSquare, LayoutDashboard, LogOut, FlaskConical } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

const baseMenuItems = [
  { path: '/user', label: 'Dashboard', icon: LayoutDashboard, requiresValidator: false },
  { path: '/user/demandes', label: 'Mes Demandes', icon: FileText, requiresValidator: false },
  { path: '/user/validations', label: 'À Valider', icon: CheckSquare, requiresValidator: true },
  { path: '/user/fdm-lab', label: 'FDM Lab', icon: FlaskConical, requiresValidator: true },
];

export const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isValidator, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4 flex flex-col">
          <nav className="space-y-2 flex-1">
            {baseMenuItems
              .filter((item) => !item.requiresValidator || isValidator || isAdmin())
              .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
