import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
            data-testid="text-game-title"
          >
            Jautājumu Spēle
          </h1>
          <p className="text-lg text-muted-foreground font-medium" data-testid="text-game-subtitle">
            Atbildi uz jautājumiem un raidi smieklīgus stāstus!
          </p>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setLocation("/create")}
            data-testid="button-create-room"
          >
            <Plus className="w-5 h-5 mr-2" />
            Izveidot Istabu
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-semibold"
            onClick={() => setLocation("/join")}
            data-testid="button-join-room"
          >
            <Users className="w-5 h-5 mr-2" />
            Pievienoties Istabai
          </Button>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground" data-testid="text-player-requirement">
            Daudzspēlētāju spēle 2+ spēlētājiem
          </p>
        </div>
      </div>
    </div>
  );
}
