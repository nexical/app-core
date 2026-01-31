import { ApiReferenceReact } from '@scalar/api-reference-react';
import React from 'react';
import '@scalar/api-reference-react/style.css';

interface Props {
  spec: Record<string, unknown>;
}

export const ScalarDocs = ({ spec }: Props) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Initial check
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    // Observer for class changes on html
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const config = {
    content: spec,
    // Use a standard theme that supports dark mode well
    theme: 'purple',
    layout: 'modern',
    hideClientButton: true,
    darkMode: isDark,
  } as const;

  return (
    <div className={isDark ? 'dark-mode h-full w-full' : 'h-full w-full'}>
      <ApiReferenceReact configuration={config} />
    </div>
  );
};
