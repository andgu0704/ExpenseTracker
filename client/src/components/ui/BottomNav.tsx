import { NavLink, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 z-50"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        className="flex flex-col items-center gap-1 px-4 py-1"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        })}
      >
        <span className="text-xl">📊</span>
        <span className="text-xs font-medium">Dashboard</span>
      </NavLink>

      {/* Transactions */}
      <NavLink
        to="/transactions"
        end
        className="flex flex-col items-center gap-1 px-4 py-1"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        })}
      >
        <span className="text-xl">💳</span>
        <span className="text-xs font-medium">Transactions</span>
      </NavLink>

      {/* Center Add Button */}
      <button
        onClick={() => navigate('/transactions/new')}
        className="flex items-center justify-center rounded-full font-bold text-2xl transition-transform active:scale-95"
        style={{
          width: '52px',
          height: '52px',
          background: 'var(--accent)',
          color: '#fff',
          boxShadow: '0 0 20px rgba(124,106,247,0.45)',
        }}
      >
        +
      </button>

      {/* Profile */}
      <NavLink
        to="/profile"
        className="flex flex-col items-center gap-1 px-4 py-1"
        style={({ isActive }) => ({
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        })}
      >
        <span className="text-xl">👤</span>
        <span className="text-xs font-medium">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
