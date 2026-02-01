import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">
          Futodama Unified
        </h1>
        <p className="text-muted-foreground">
          CV Management Platform - Phase 1 Complete
        </p>
        
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Design System Check</h2>
          <p className="text-foreground">
            If you can read this with the TT Commons font, the design system is working.
          </p>
          <div className="flex gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-16 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm">Primary</div>
            <div className="h-16 bg-secondary rounded flex items-center justify-center text-secondary-foreground text-sm">Secondary</div>
            <div className="h-16 bg-accent rounded flex items-center justify-center text-accent-foreground text-sm">Accent</div>
            <div className="h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">Muted</div>
          </div>
        </Card>
      </div>
    </main>
  );
}
