import { Link } from "wouter";
import { useLegal } from "../hooks/useData";
import { Panel } from "../components/Panel";
import { Footer } from "../components/Footer";
import React from "react";

function formatText(text: string) {
  // Split by newline to create paragraphs/brs, then handle **bold**
  const lines = text.split("\n");
  
  return lines.map((line, lineIndex) => {
    // Split by **
    const parts = line.split(/(\*\*.*?\*\*)/g);
    
    return (
      <React.Fragment key={lineIndex}>
        {parts.map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          }
          return <span key={partIndex}>{part}</span>;
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function Impressum() {
  const { data, isLoading } = useLegal();

  if (isLoading) {
    return (
      <div className="page-bg">
        <div className="max-w-[900px] mx-auto px-5 md:px-10 py-16 text-center text-white">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const impressum = data?.impressum;

  return (
    <div className="page-bg">
      <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-16 pb-8 min-h-screen flex flex-col">
        <nav className="mb-12 stagger-enter">
          <Link href="/" className="text-white hover:underline font-bold text-lg inline-flex items-center gap-2 opacity-90 hover:opacity-100">
            <span>←</span> Zurück
          </Link>
        </nav>

        <main className="flex-grow stagger-enter" style={{ animationDelay: '100ms' }}>
          {impressum ? (
            <>
              <h1 className="heading-exo text-4xl md:text-5xl font-bold text-white mb-10">
                {impressum.title}
              </h1>
              
              <div className="space-y-6">
                {impressum.content.map((section, idx) => (
                  <Panel key={idx}>
                    <h2 className="heading-exo text-2xl font-bold mb-4">{section.heading}</h2>
                    <p className="text-black/80 leading-relaxed">
                      {formatText(section.text)}
                    </p>
                  </Panel>
                ))}
              </div>
            </>
          ) : (
            <Panel>
              <p>Inhalt nicht gefunden.</p>
            </Panel>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
