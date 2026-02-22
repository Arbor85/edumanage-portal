import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="material-symbols-outlined text-amber-400 text-2xl md:text-3xl flex-shrink-0">
              cookie
            </span>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base md:text-lg mb-1">
                Cookie Notice
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                This website uses cookies to ensure proper functionality, 
                personalize content, and analyze traffic. By continuing to use this site, 
                you consent to the use of cookies in accordance with our privacy policy.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-initial px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Accept
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-initial px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
