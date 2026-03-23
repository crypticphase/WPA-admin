import { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Check, ChevronDown, Settings2 } from 'lucide-react';
import { cn } from '../utils';

const DEFAULT_URLS = [
  'https://wpadocker-production.up.railway.app/api/v1',
  'https://wpa-docker-8aer.onrender.com/api/v1'
];

export default function BaseUrlManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    const storedUrls = localStorage.getItem('base_urls');
    const activeUrl = localStorage.getItem('custom_base_url');
    
    if (storedUrls) {
      setUrls(JSON.parse(storedUrls));
    } else {
      setUrls(DEFAULT_URLS);
      localStorage.setItem('base_urls', JSON.stringify(DEFAULT_URLS));
    }

    setCurrentUrl(activeUrl || DEFAULT_URLS[0]);
  }, []);

  const handleSelect = (url: string) => {
    setCurrentUrl(url);
    localStorage.setItem('custom_base_url', url);
    setIsOpen(false);
    // Reload to apply new base URL to all queries
    window.location.reload();
  };

  const handleAdd = () => {
    if (newUrl && !urls.includes(newUrl)) {
      const updatedUrls = [...urls, newUrl];
      setUrls(updatedUrls);
      localStorage.setItem('base_urls', JSON.stringify(updatedUrls));
      setNewUrl('');
    }
  };

  const handleDelete = (urlToDelete: string) => {
    if (urls.length <= 1) return;
    const updatedUrls = urls.filter(u => u !== urlToDelete);
    setUrls(updatedUrls);
    localStorage.setItem('base_urls', JSON.stringify(updatedUrls));
    
    if (currentUrl === urlToDelete) {
      handleSelect(updatedUrls[0]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-all"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="max-w-[120px] truncate">{currentUrl}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-zinc-900" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Base URL Manager</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new API URL..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-zinc-900/5"
              />
              <button
                onClick={handleAdd}
                className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {urls.map((url) => (
              <div
                key={url}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-xl transition-all mb-1",
                  currentUrl === url ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 text-zinc-600"
                )}
              >
                <button
                  onClick={() => handleSelect(url)}
                  className="flex-1 text-left text-[10px] font-medium truncate pr-2"
                >
                  {url}
                </button>
                <div className="flex items-center gap-1">
                  {currentUrl === url && <Check className="w-3 h-3" />}
                  <button
                    onClick={() => handleDelete(url)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100",
                      currentUrl === url ? "hover:bg-white/10 text-white/60" : "hover:bg-red-50 text-red-400"
                    )}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
