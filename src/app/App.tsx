import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';
import { useAppStore } from './useAppStore';

export function App() {
  const init = useAppStore((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
