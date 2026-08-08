import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 py-7 border-t border-white/20 text-white text-center stagger-enter" style={{ animationDelay: '500ms' }}>
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="font-medium">
          © {currentYear} all_in_gam3s – SLOT-CAST
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link href="/impressum" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
