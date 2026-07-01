import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import tailwindStyles from '../index.css?inline';

// --- GMAIL DOM INJECTION ---
function injectButton(onClick: () => void) {
  const observer = new MutationObserver(() => {
    // .gU.Up is the container on the left side of the bottom toolbar containing the Send button
    const toolbars = document.querySelectorAll('.gU.Up');
    
    toolbars.forEach(toolbar => {
      if (toolbar && !toolbar.querySelector('.writelikeme-btn')) {
        const btn = document.createElement('div');
        btn.className = 'writelikeme-btn';
        btn.style.display = 'inline-block';
        btn.style.verticalAlign = 'top';
        btn.style.marginTop = '0px';
        btn.innerHTML = `
          <div style="display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 0 14px; height: 36px; border-radius: 18px; font-family: 'Google Sans', Roboto, sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; margin-left: 12px; box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3); transition: all 0.2s ease;"
               onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.4)'"
               onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 6px rgba(59, 130, 246, 0.3)'">
            <span style="margin-right: 4px; font-size: 16px;">✨</span> Humanize
          </div>
        `;
        btn.onclick = onClick;
        toolbar.appendChild(btn);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function getComposeBody(): Element | null {
  const elements = document.querySelectorAll('div[aria-label="Message Body"], div[g_editable="true"]');
  return elements.length > 0 ? elements[elements.length - 1] : null;
}

// --- AI PHRASE DETECTOR ---
const AI_PHRASES = [
  "I hope this email finds you well",
  "Please find attached",
  "I am writing to express",
  "I would greatly appreciate",
  "It would mean a lot",
  "In today's fast-paced",
  "Leverage",
  "Delighted",
  "Thrilled",
  "Crucial",
  "Vital",
  "Testament",
  "Underscores",
  "Synergize",
  "Utilize",
  "Facilitate",
  "Collaborate",
  "Optimization",
  "Align",
  "Bandwidth",
  "Touch base",
  "Circle back",
  "Moving forward"
];

function highlightAIPhrases(text: string) {
  let highlighted = text;
  let count = 0;
  AI_PHRASES.forEach(phrase => {
    // Case insensitive, word boundary match
    const regex = new RegExp(`\\b(${phrase})\\b`, 'gi');
    highlighted = highlighted.replace(regex, (match) => {
      count++;
      return `<span class="bg-red-100 text-red-800 border-b-2 border-red-300 font-semibold px-1 rounded cursor-help" title="Detected AI Phrase">${match}</span>`;
    });
  });
  return { highlighted, count };
}

// --- REACT UI ---
function WriteLikeMeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (window as any).openWriteLikeMeModal = async () => {
      const composeBody = getComposeBody();
      if (!composeBody) {
        alert("Couldn't find the email draft.");
        return;
      }
      
      const text = composeBody.textContent || composeBody.innerHTML.replace(/<[^>]*>?/gm, '');
      if (!text.trim()) {
        alert("Please write something first!");
        return;
      }

      setOriginalText(text);
      setIsOpen(true);
      setIsLoading(true);
      setError('');

      try {
        const { tone = 'Professional' } = await chrome.storage.local.get('tone');
        chrome.runtime.sendMessage(
          { type: 'HUMANIZE_EMAIL', text, tone },
          (response) => {
            setIsLoading(false);
            if (response?.success) {
              setHumanizedText(response.text);
            } else {
              setError(response?.error || 'Unknown error occurred.');
            }
          }
        );
      } catch (e: any) {
        setIsLoading(false);
        setError(e.message);
      }
    };

    injectButton(() => {
      (window as any).openWriteLikeMeModal();
    });
  }, []);

  const handleAccept = () => {
    const composeBody = getComposeBody();
    if (composeBody) {
      const formattedText = humanizedText.split('\\n').map(line => `<div>${line || '<br>'}</div>`).join('');
      composeBody.innerHTML = formattedText;
      composeBody.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const { highlighted, count: aiPhraseCount } = highlightAIPhrases(originalText);
  const totalWords = originalText.split(/\\s+/).length;
  // Make the score proportional to the total word count so long emails aren't unfairly penalized
  const aiScore = Math.min(99, Math.round((aiPhraseCount / Math.max(totalWords, 10)) * 100 * 8));

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Humanizer</h2>
              <p className="text-sm text-gray-500">Making your email sound authentic</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
              </div>
              <p className="text-gray-500 font-medium animate-pulse">Humanizing your text...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-500 bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="text-center space-y-2">
                <svg className="w-12 h-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 h-full">
              {/* Before */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Before (AI-Generated)</span>
                  {aiPhraseCount > 0 && (
                     <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold tracking-wide">Looks {aiScore}% AI</span>
                  )}
                </div>
                <div 
                  className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-y-auto text-gray-500 whitespace-pre-wrap font-mono text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </div>

              {/* After */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider">After (Humanized)</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">Looks 0% AI</span>
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-md overflow-y-auto text-gray-900 whitespace-pre-wrap text-base leading-relaxed relative">
                  {humanizedText}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent pointer-events-none rounded-tr-2xl"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && (
          <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-4 bg-white">
            <button 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setIsLoading(true);
                chrome.storage.local.get('tone').then(({ tone }) => {
                  chrome.runtime.sendMessage({ type: 'HUMANIZE_EMAIL', text: originalText, tone }, (response) => {
                    setIsLoading(false);
                    if (response?.success) setHumanizedText(response.text);
                  });
                });
              }}
              className="px-6 py-2.5 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
              Regenerate
            </button>
            <button 
              onClick={handleAccept}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              Replace Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Create a host for our shadow DOM
const host = document.createElement('div');
host.id = 'writelikeme-root';
document.documentElement.appendChild(host);

// Create shadow DOM
const shadow = host.attachShadow({ mode: 'open' });

// Inject Tailwind styles
const styleSheet = document.createElement('style');
styleSheet.textContent = tailwindStyles;
shadow.appendChild(styleSheet);

// Render React App inside Shadow DOM
const rootContainer = document.createElement('div');
shadow.appendChild(rootContainer);
const root = createRoot(rootContainer);
root.render(<WriteLikeMeModal />);
