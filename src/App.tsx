import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Sports from './pages/Sports';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/sports" element={<Sports />} />
          </Routes>
        </div>
        <footer className="border-t border-zinc-800/50 py-4 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-600 text-xs">
              Falcon TV &copy; {new Date().getFullYear()} &mdash; Live TV from around the world
            </p>
            <a href="https://apps.megan.qzz.io" target="_blank" rel="noopener noreferrer" 
               className="text-zinc-500 text-[11px] hover:text-red-400 transition-colors mt-1 inline-block">
              📱 Get the Android APK at apps.megan.qzz.io
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
