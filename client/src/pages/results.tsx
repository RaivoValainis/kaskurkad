import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QUESTIONS, GameState } from "@shared/schema";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function ResultsPage() {
  const [, params] = useRoute("/results/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { room, playerId, leaveRoom } = useWebSocket();
  const roomCode = params?.code;

  useEffect(() => {
    if (room && room.gameState === GameState.PLAYING) {
      setLocation(`/play/${roomCode}`);
    } else if (room && room.gameState === GameState.LOBBY) {
      setLocation(`/lobby/${roomCode}`);
    }
  }, [room, roomCode, setLocation]);

  const handleNewGame = async () => {
    try {
      await apiRequest("POST", "/api/rooms/new-game", { code: roomCode });
    } catch (error: any) {
      toast({
        title: "Kļūda",
        description: error.message || "Neizdevās sākt jaunu spēli",
        variant: "destructive",
      });
    }
  };

  const handleLeave = () => {
    leaveRoom();
    setLocation("/");
  };

  if (!room || !room.mixedResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Ielādē rezultātus...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = room.players.find(p => p.id === playerId)?.isCreator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-8">
      <div className="w-full max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={handleLeave}
          className="mb-6"
          data-testid="button-leave"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pamest istabu
        </Button>

        <Card className="shadow-xl mb-6">
          <CardContent className="pt-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4" data-testid="icon-results">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-results-title">
                Rezultāti
              </h1>
              <p className="text-muted-foreground text-lg" data-testid="text-results-subtitle">
                Šeit ir jūsu jauktie stāsti!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {room.mixedResults.map((storySet, setIndex) => (
            <Card 
              key={setIndex} 
              className="shadow-lg border-l-4 border-l-primary"
              data-testid={`story-set-${setIndex}`}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    Stāsts {setIndex + 1}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {storySet.map((answer, answerIndex) => (
                    <div key={answerIndex} className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {QUESTIONS[answerIndex]}
                      </p>
                      <p 
                        className="text-lg font-medium text-foreground pl-4"
                        data-testid={`answer-${setIndex}-${answerIndex}`}
                      >
                        {answer}
                      </p>
                      {answerIndex < storySet.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {isCreator && (
            <Button
              size="lg"
              className="w-full h-12 text-lg font-semibold"
              onClick={handleNewGame}
              data-testid="button-new-game"
            >
              Sākt Jaunu Spēli
            </Button>
          )}

          {!isCreator && (
            <p className="text-center text-muted-foreground" data-testid="text-waiting-new-game">
              Gaidām, kamēr istabas izveidotājs sāks jaunu spēli...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
