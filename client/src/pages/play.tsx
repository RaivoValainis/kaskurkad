import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/websocket";
import { apiRequest } from "@/lib/queryClient";
import { QUESTIONS, GameState } from "@shared/schema";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PlayPage() {
  const [, params] = useRoute("/play/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { room, playerId } = useWebSocket();
  const roomCode = params?.code;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [hasSubmittedAll, setHasSubmittedAll] = useState(false);

  useEffect(() => {
    if (room && room.gameState === GameState.RESULTS) {
      setLocation(`/results/${roomCode}`);
    } else if (room && room.gameState === GameState.LOBBY) {
      setLocation(`/lobby/${roomCode}`);
    }
  }, [room, roomCode, setLocation]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Tukša atbilde",
        description: "Lūdzu, ievadi atbildi pirms turpināt",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    try {
      await apiRequest("POST", "/api/answers/submit", {
        roomCode,
        playerId,
        questionIndex: currentQuestionIndex,
        answer: currentAnswer.trim(),
      });

      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setHasSubmittedAll(true);
      }
    } catch (error: any) {
      toast({
        title: "Kļūda",
        description: error.message || "Neizdevās iesniegt atbildi",
        variant: "destructive",
      });
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Ielādē...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasSubmittedAll) {
    const playersSubmitted = room.players.filter(p => p.hasSubmitted).length;
    const totalPlayers = room.players.length;
    const allSubmitted = playersSubmitted === totalPlayers;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Card className="shadow-xl">
            <CardContent className="pt-8 space-y-6">
              <div className="text-center space-y-4">
                <div 
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto"
                  data-testid="icon-waiting-status"
                >
                  {allSubmitted ? (
                    <CheckCircle className="w-8 h-8 text-primary" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold" data-testid="text-waiting-title">
                    {allSubmitted ? "Visi pabeiguši!" : "Tu esi pabeidzis!"}
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-waiting-message">
                    {allSubmitted 
                      ? "Gatavo rezultātus..." 
                      : `Gaidām ${totalPlayers - playersSubmitted} ${totalPlayers - playersSubmitted === 1 ? "spēlētāju" : "spēlētājus"}...`
                    }
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground" data-testid="text-progress-count">
                      {playersSubmitted}/{totalPlayers}
                    </span>
                  </div>
                  <Progress value={(playersSubmitted / totalPlayers) * 100} className="h-2" data-testid="progress-waiting" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border"
                    data-testid={`player-status-${player.id}`}
                  >
                    <span className="font-medium">{player.name}</span>
                    {player.hasSubmitted ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Pabeigts
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Atbild...
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground" data-testid="text-question-count">
              Jautājums {currentQuestionIndex + 1} no {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-primary" data-testid="text-progress-percent">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-questions" />
        </div>

        <Card className="shadow-xl">
          <CardContent className="pt-8 space-y-8">
            <div className="min-h-24 flex items-center justify-center">
              <h2 
                className="text-3xl md:text-4xl font-bold text-center"
                data-testid="text-question"
              >
                {currentQuestion}
              </h2>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Ieraksti savu atbildi šeit..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="min-h-32 text-lg resize-none"
                maxLength={200}
                data-testid="input-answer"
                autoFocus
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground" data-testid="text-char-count">
                  {currentAnswer.length}/200 simboli
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-12 text-lg font-semibold"
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim()}
              data-testid="button-submit-answer"
            >
              {currentQuestionIndex === QUESTIONS.length - 1 ? "Pabeigt" : "Nākamais Jautājums"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
