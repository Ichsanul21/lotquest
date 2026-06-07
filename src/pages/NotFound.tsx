import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-extrabold gold-text mb-4">404</div>
        <h2 className="text-xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-400 mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link to="/home">
          <Button>
            <Home className="w-4 h-4" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
