import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col min-w-0"
        style={{
          background: 'radial-gradient(ellipse at 60% 0%, rgba(124,106,247,0.04) 0%, transparent 55%)',
        }}
      >
        <div
          className="flex-1 w-full mx-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-10"
          style={{ maxWidth: '1200px' }}
        >
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
