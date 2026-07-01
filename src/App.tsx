import { useState, useEffect } from 'react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [tone, setTone] = useState('Professional');
  const [status, setStatus] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'tone']).then((res) => {
      if (res.apiKey) setApiKey(res.apiKey as string);
      if (res.tone) setTone(res.tone as string);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ apiKey, tone }).then(() => {
      setStatus('Settings saved!');
      setTimeout(() => setStatus(''), 2000);
    });
  };

  return (
    <div className="w-80 p-6 bg-gradient-to-br from-gray-900 to-black text-white font-sans min-h-[400px] flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">WriteLikeMe</h1>
            <p className="text-xs text-gray-400">Write imperfectly perfect.</p>
          </div>
        </header>

        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">NVIDIA API Key</label>
            <input
              type="password"
              placeholder="nvapi-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Default Tone</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm appearance-none outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="Professional" className="bg-gray-900">Professional</option>
                <option value="Friendly" className="bg-gray-900">Friendly</option>
                <option value="High School" className="bg-gray-900">Casual (High School)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-[0.98]"
        >
          {status || 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default App;
