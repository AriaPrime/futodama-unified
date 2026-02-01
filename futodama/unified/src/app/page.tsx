import { CVTab } from '@/components/cv';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Futodama</h1>
              <p className="text-sm text-muted-foreground">CV Analysis Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">DIS/CREADIS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CVTab language="en" />
      </div>
    </main>
  );
}
