import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle,
  GitBranch,
  Users,
  Building2,
  BarChart3,
  LogOut,
  PlusCircle,
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles?: string[];
}

interface SidebarProps {
  userRole: 'ADMIN' | 'USER';
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const { logout, isValidator, pendingValidationsCount } = useAuth();

  // 🐛 Debug: Afficher les valeurs dans la console
  console.log('🔍 Sidebar - isValidator:', isValidator);
  console.log('🔍 Sidebar - pendingValidationsCount:', pendingValidationsCount);
  console.log('🔍 Sidebar - userRole:', userRole);

  const adminMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/admin' },
    { icon: <CheckCircle size={20} />, label: 'Validation', path: '/admin/validations' },
    { icon: <GitBranch size={20} />, label: 'Gestion des processus', path: '/admin/workflows' },
    { icon: <Users size={20} />, label: 'Gestion des utilisateurs', path: '/admin/users' },
    { icon: <Building2 size={20} />, label: 'Départements', path: '/admin/subdivisions' },
    { icon: <BarChart3 size={20} />, label: 'Statistiques', path: '/admin/statistiques' },
  ];

  const userMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/user' },
    { icon: <PlusCircle size={20} />, label: 'Nouvelle demande', path: '/user/demandes/new' },
    { icon: <FileText size={20} />, label: 'Mes demandes', path: '/user/demandes' },
  ];

  // ✅ Ajouter "À valider" uniquement si l'utilisateur est validateur
  if (isValidator) {
    const validationLabel = pendingValidationsCount > 0
      ? `À valider (${pendingValidationsCount})`
      : 'À valider';

    userMenuItems.push({
      icon: <CheckCircle size={20} />,
      label: validationLabel,
      path: '/user/validations'
    });
  }

  const menuItems = userRole === 'ADMIN' ? adminMenuItems : userMenuItems;

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/user') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  // Récupérer les infos utilisateur depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Jean';
  const userLastName = user.lastName || 'Dupont';
  const userRoleLabel = userRole === 'ADMIN' ? 'Administrateur' : 'Employé';

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo et nom de l'app */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">GestDemandes</span>
        </div>
      </div>

      {/* Profil utilisateur */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users size={20} className="text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{userName} {userLastName}</p>
            <p className="text-xs text-gray-500">{userRoleLabel}</p>
          </div>
        </div>
      </div>

      {/* Menu de navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const showBadge = item.path === '/user/validations' && pendingValidationsCount > 0;

          return (
            <Link
              key={index}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className={isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span className="text-sm font-medium flex-1">{item.label}</span>

              {/* Badge de notification */}
              {showBadge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center">
                  {pendingValidationsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Boutons du bas */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Bouton Paramètres */}
        <button
          onClick={() => {
            // Action à définir - peut naviguer vers une page de paramètres
            console.log('Paramètres clicked');
            // Exemple: navigate('/settings');
          }}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Paramètres</span>
        </button>

        {/* Bouton Aide */}
        <button
          onClick={() => {
            // Action à définir - peut ouvrir une modale d'aide ou naviguer vers la documentation
            console.log('Aide clicked');
            // Exemple: setShowHelpModal(true);
          }}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <HelpCircle size={20} />
          <span className="text-sm font-medium">Aide</span>
        </button>

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};