import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <>
      <TopNav />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
