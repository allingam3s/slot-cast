import { Suspense, lazy } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const Home = lazy(() => import('@/pages/Home'));
const Impressum = lazy(() => import('@/pages/Impressum'));
const Datenschutz = lazy(() => import('@/pages/Datenschutz'));

function Fallback() {
  return (
    <div className="page-bg">
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#B7F3E8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/impressum" component={Impressum} />
        <Route path="/datenschutz" component={Datenschutz} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;

