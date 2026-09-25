import { Outlet } from 'react-router-dom';
import HomeHeader from '../components/common/HomeHeader';
import FooterSection from '../components/common/FooterSection';
import { useGetCart } from '../hooks/useCart';

const MainLayout: React.FC = () => {
  const { data: cartData } = useGetCart();
  const cartCount = cartData?.itemCount || 0;

  return (
    <div className="app-container">
      <HomeHeader cartCount={cartCount} />
      <main className="main-content">
        <Outlet />
      </main>
      <FooterSection />
    </div>
  );
};

export default MainLayout;

