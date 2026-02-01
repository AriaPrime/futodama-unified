import { CVTab } from '@/components/cv';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Futodama</h1>
                <p className="text-xs text-muted-foreground">CV Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                DIS/CREADIS
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CVTab language="en" />
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Futodama Unified • Built by Aria</span>
            <span>Powered by Claude AI</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
