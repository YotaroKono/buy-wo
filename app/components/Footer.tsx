import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  
  return (
    <footer className="bg-gray-800 text-white p-8 footer footer-center">
      {/* アプリ情報 */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span className="font-bold text-lg">buy - wo</span>
        </div>
        <p className="text-sm">賢く計画的なお買い物をサポート</p>
      </div>
      {/* コピーライトとバージョン */}
      <div>
        <p className="text-sm">Copyright © {currentYear} - All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;