import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AppView } from '../types';
import { useAuth } from '../contexts/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  title: string;
  onAddClick?: () => void;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, title, onAddClick, hideHeader = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resolveInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';

    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;

    const hasDarkClass = document.documentElement.classList.contains('dark');
    if (hasDarkClass) return 'dark';

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveInitialTheme());
  const isPlanUser = user?.role === 'plan';
  const isGymUser = user?.role === 'gym';
  const isPlatformUser = user?.role === 'platform';
  const pageTitleMap: Partial<Record<AppView, string>> = {
    [AppView.ROOMS]: 'Rooms',
    [AppView.SUBJECTS]: 'Subjects',
    [AppView.TEACHING_STUFFS]: 'Staff',
    [AppView.SCHEDULE]: 'Schedule',
    [AppView.ALERTS]: 'Alerts',
    [AppView.PROFILE]: 'Profile',
    [AppView.MENTEES]: 'Mentees',
    [AppView.PLATFORM_SUBSCRIPTION_HISTORY]: 'Subscription History',
    [AppView.GYM_ACTIVE_WORKOUT]: 'Active Workout',
    [AppView.GYM_EXPLORE]: 'Explore',
    [AppView.GYM_SPLIT_PLANNER]: 'Split Planner',
    [AppView.GYM_SPLIT_PLANS]: 'Saved Plans',
    [AppView.GYM_EDIT_SPLIT_PLAN]: 'Edit Plan',
    [AppView.GYM_HISTORY]: 'Workout History',
  };
  const pageTitle = pageTitleMap[activeView] ?? title;

  usePageTitle(pageTitle);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleMenuNavigate = (view: AppView) => {
    setIsMenuOpen(false);
    onNavigate(view);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {!hideHeader && (
        <header className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors md:hidden"
                aria-label="Open menu"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">menu</span>
              </button>
              <img
                src="/logo.png"
                alt="Arbor Fitness"
                className="h-6 w-6 rounded-md object-contain"
                loading="lazy"
              />
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-border-dark bg-white/70 dark:bg-surface-dark/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 shadow-sm hover:border-primary/60 hover:shadow-primary/10"
                aria-label="Toggle theme"
              >
                <span className="material-symbols-outlined text-base">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
              </button>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center p-2.5 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-border-dark px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70 hover:border-rose-400 hover:text-rose-500"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-surface-dark shadow-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Menu</h3>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center size-9 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="mb-4 flex items-center gap-2 rounded-full border border-slate-200 dark:border-border-dark bg-white/70 dark:bg-surface-dark/70 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 shadow-sm hover:border-primary/60 hover:shadow-primary/10"
            >
              <span className="material-symbols-outlined text-base">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <nav className="flex flex-col gap-2 h-full">
              <div className="flex flex-col gap-2">
                {isPlanUser && (
                  <NavLink
                    to="/rooms"
                    onClick={() => handleMenuNavigate(AppView.ROOMS)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">meeting_room</span>
                    <span>Rooms</span>
                  </NavLink>
                )}
                {isPlanUser && (
                  <NavLink
                    to="/subjects"
                    onClick={() => handleMenuNavigate(AppView.SUBJECTS)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">book</span>
                    <span>Subjects</span>
                  </NavLink>
                )}
                {isPlanUser && (
                  <NavLink
                    to="/teaching-stuffs"
                    onClick={() => handleMenuNavigate(AppView.TEACHING_STUFFS)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">person</span>
                    <span>Staff</span>
                  </NavLink>
                )}
                {isPlanUser && (
                  <NavLink
                    to="/schedule"
                    onClick={() => handleMenuNavigate(AppView.SCHEDULE)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span>Schedule</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/active-workout"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    <span>Active Workout</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/explore"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">travel_explore</span>
                    <span>Explore</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/split-plans"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">checklist</span>
                    <span>Saved Plans</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/saved-workouts"
                    onClick={() => handleMenuNavigate(AppView.SAVED_WORKOUTS)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">fitness_center</span>
                    <span>Saved Workouts</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/history"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">history</span>
                    <span>Workout History</span>
                  </NavLink>
                )}
                {isPlatformUser && (
                  <NavLink
                    to="/platform/subscription-history"
                    onClick={() => handleMenuNavigate(AppView.PLATFORM_SUBSCRIPTION_HISTORY)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">history_edu</span>
                    <span>Subscription History</span>
                  </NavLink>
                )}
                {isGymUser && (
                  <NavLink
                    to="/mentees"
                    onClick={() => handleMenuNavigate(AppView.MENTEES)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">people</span>
                    <span>Mentees</span>
                  </NavLink>
                )}
                <NavLink
                  to="/alerts"
                  onClick={() => handleMenuNavigate(AppView.ALERTS)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">notifications</span>
                  <span>Alerts</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => handleMenuNavigate(AppView.PROFILE)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                    }`
                  }
                >
                  <span className="material-symbols-outlined">account_circle</span>
                  <span>Profile</span>
                </NavLink>
              </div>
            </nav>
          </aside>
        </div>
      )}

      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-full md:w-72 md:bg-white md:dark:bg-surface-dark md:border-r md:border-slate-200 md:dark:border-slate-800 md:p-5 md:pt-24">
        <nav className="flex flex-col gap-2 w-full h-full">
          <div className="flex flex-col gap-2">
            {isPlanUser && (
              <NavLink
                to="/rooms"
                onClick={() => handleMenuNavigate(AppView.ROOMS)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">meeting_room</span>
                <span>Rooms</span>
              </NavLink>
            )}
            {isPlanUser && (
              <NavLink
                to="/subjects"
                onClick={() => handleMenuNavigate(AppView.SUBJECTS)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">book</span>
                <span>Subjects</span>
              </NavLink>
            )}
            {isPlanUser && (
              <NavLink
                to="/teaching-stuffs"
                onClick={() => handleMenuNavigate(AppView.TEACHING_STUFFS)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">person</span>
                <span>Staff</span>
              </NavLink>
            )}
            {isPlanUser && (
              <NavLink
                to="/schedule"
                onClick={() => handleMenuNavigate(AppView.SCHEDULE)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Schedule</span>
              </NavLink>
            )}
            {isGymUser && (
              <NavLink
                to="/active-workout"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">bolt</span>
                <span>Active Workout</span>
              </NavLink>
            )}
            {isGymUser && (
              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">travel_explore</span>
                <span>Explore</span>
              </NavLink>
            )}

            {isGymUser && (
              <NavLink
                to="/split-plans"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">checklist</span>
                <span>Saved Plans</span>
              </NavLink>
            )}
            {isGymUser && (
                  <NavLink
                    to="/saved-workouts"
                    onClick={() => handleMenuNavigate(AppView.SAVED_WORKOUTS)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined">fitness_center</span>
                    <span>Saved Workouts</span>
                  </NavLink>
                )}
            {isGymUser && (
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">history</span>
                <span>Workout History</span>
              </NavLink>
            )}
            {isGymUser && (
              <NavLink
                to="/mentees"
                onClick={() => handleMenuNavigate(AppView.MENTEES)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">people</span>
                <span>Mentees</span>
              </NavLink>
            )}
            {isPlatformUser && (
              <NavLink
                to="/platform/subscription-history"
                onClick={() => handleMenuNavigate(AppView.PLATFORM_SUBSCRIPTION_HISTORY)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                <span className="material-symbols-outlined">history_edu</span>
                <span>Subscription History</span>
              </NavLink>
            )}
            <NavLink
              to="/alerts"
              onClick={() => handleMenuNavigate(AppView.ALERTS)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                }`
              }
            >
              <span className="material-symbols-outlined">notifications</span>
              <span>Alerts</span>
            </NavLink>
            <NavLink
              to="/profile"
              onClick={() => handleMenuNavigate(AppView.PROFILE)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                }`
              }
            >
              <span className="material-symbols-outlined">account_circle</span>
              <span>Profile</span>
            </NavLink>
          </div>
        </nav>
      </aside>

      <main className="flex-1 md:pl-72">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50 md:hidden">
        {isPlanUser && (
          <Link
            to="/rooms"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.ROOMS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.ROOMS ? 'fill-1' : ''}`}>meeting_room</span>
            <span className="text-[10px] font-bold">Rooms</span>
          </Link>
        )}
        {isPlanUser && (
          <Link
            to="/subjects"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.SUBJECTS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.SUBJECTS ? 'fill-1' : ''}`}>book</span>
            <span className="text-[10px] font-bold">Subjects</span>
          </Link>
        )}
        {isPlanUser && (
          <Link
            to="/teaching-stuffs"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.TEACHING_STUFFS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.TEACHING_STUFFS ? 'fill-1' : ''}`}>person</span>
            <span className="text-[10px] font-bold">Staff</span>
          </Link>
        )}
        {isPlanUser && (
          <Link
            to="/schedule"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.SCHEDULE ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.SCHEDULE ? 'fill-1' : ''}`}>calendar_month</span>
            <span className="text-[10px] font-bold">Schedule</span>
          </Link>
        )}
        {isGymUser && (
          <Link
            to="/mentees"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.MENTEES ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.MENTEES ? 'fill-1' : ''}`}>people</span>
            <span className="text-[10px] font-bold">Mentees</span>
          </Link>
        )}
        {isPlatformUser && (
          <Link
            to="/platform/subscription-history"
            className={`flex flex-col items-center gap-1 ${activeView === AppView.PLATFORM_SUBSCRIPTION_HISTORY ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className={`material-symbols-outlined ${activeView === AppView.PLATFORM_SUBSCRIPTION_HISTORY ? 'fill-1' : ''}`}>history_edu</span>
            <span className="text-[10px] font-bold">History</span>
          </Link>
        )}
        <Link
          to="/alerts"
          className={`flex flex-col items-center gap-1 ${activeView === AppView.ALERTS ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-bold">Alerts</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 ${activeView === AppView.PROFILE ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className={`material-symbols-outlined ${activeView === AppView.PROFILE ? 'fill-1' : ''}`}>account_circle</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Layout;
