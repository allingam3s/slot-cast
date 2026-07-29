import { Link } from "wouter";
import { Panel } from "../components/Panel";

export default function NotFound() {
  return (
    <div className="page-bg">
      <div className="max-w-[900px] mx-auto px-5 md:px-10 min-h-screen flex items-center justify-center">
        <Panel className="w-full max-w-md text-center py-12">
          <h1 className="heading-exo text-6xl font-bold mb-4 text-black">404</h1>
          <h2 className="heading-exo text-2xl font-bold mb-6 text-black/80">Seite nicht gefunden</h2>
          <p className="text-black/70 mb-8 font-medium">
            Diese Seite existiert nicht oder wurde verschoben.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center bg-black text-[#B7F3E8] px-8 py-4 rounded-full font-bold text-sm hover:bg-black/90 transition-colors"
          >
            Zurück zur Startseite
          </Link>
        </Panel>
      </div>
    </div>
  );
}
