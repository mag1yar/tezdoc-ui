import { Toaster } from '@/shared/ui/sonner';
import { PropsWithChildren } from 'react';
import { TanStackDevtoolsProvider } from './devtools';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
      <TanStackDevtoolsProvider />
    </>
  );
}
