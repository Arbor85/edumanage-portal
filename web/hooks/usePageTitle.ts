import { useEffect } from 'react';

const usePageTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
    
    return () => {
      document.title = 'Alpaki Planner';
    };
  }, [title]);
};

export default usePageTitle;
