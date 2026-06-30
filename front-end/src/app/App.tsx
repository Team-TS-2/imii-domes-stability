import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SiteProvider } from './context/SiteContext';

export default function App() {
  return (
    <SiteProvider>
      <RouterProvider router={router} />
    </SiteProvider>
  );
}