import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/websocket";
import { Copy, Users, Crown, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { GameState } from "@shared/schema";

export default function LobbyPage() {
  const [, params] = useRoute("/lobby/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { room, playerId, connected, leaveRoom } = useWebSocket();
  const roomCode = params?.code;

  useEffect(() => {
    if (room && room.gameState === GameState.PLAYING) {
      setLocation(`/play/${roomCode}`);
    } else if (room && room.gameState === GameState.RESULTS) {
      setLocation(`/results/${roomCode}`);
    }
  }, [room, roomCode, setLocation]);

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast({
        title: "Kods nokopēts!",
        description: "Istabas kods ir nokopēts starpliktuvē",
      });
    }
  };

  const handleStartGame = async () => {
    try {
      await apiRequest("POST", "/api/rooms/start", { code: roomCode });
    } catch (error: any) {
      toast({
        title: "Kļūda",
        description: error.message || "Neizdevās sākt spēli",
        variant: "destructive",
      });
    }
  };

  const handleLeave = () => {
    leaveRoom();
    setLocation("/");
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Savienojas ar serveri...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <p className="text-center text-muted-foreground">Istaba nav atrasta</p>
            <Button onClick={handleLeave} className="w-full" data-testid="button-back-home">
              Atpakaļ uz sākumu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = room.players.find(p => p.id === playerId)?.isCreator;
  const canStart = room.players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={handleLeave}
          className="mb-6"
          data-testid="button-leave"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Pamest istabu
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold" data-testid="text-lobby-title">Spēles Istaba</CardTitle>
              <Badge variant="secondary" className="text-sm" data-testid="badge-player-count">
                <Users className="w-4 h-4 mr-1" />
                {room.players.length} {room.players.length === 1 ? "spēlētājs" : "spēlētāji"}
              </Badge>
            </div>
            <CardDescription data-testid="text-lobby-description">
              Gaidām spēlētājus...
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-accent/30 rounded-xl p-6 text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground" data-testid="text-code-label">Istabas kods</p>
              <div className="flex items-center justify-center gap-3">
                <p 
                  className="text-5xl font-mono font-bold tracking-[0.3em] text-foreground"
                  data-testid="text-room-code"
                >
                  {roomCode}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="hover-elevate active-elevate-2"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-2" data-testid="text-code-instruction">
                Dalies ar šo kodu ar citiem spēlētājiem
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg" data-testid="text-players-header">Spēlētāji ({room.players.length})</h3>
              <div className="space-y-2">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border hover-elevate"
                    data-testid={`player-item-${player.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center" data-testid={`avatar-${player.id}`}>
                        <span className="text-lg font-semibold text-primary">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium" data-testid={`text-player-name-${player.id}`}>{player.name}</span>
                      {player.id === playerId && (
                        <Badge variant="outline" className="text-xs" data-testid="badge-you">Tu</Badge>
                      )}
                    </div>
                    {player.isCreator && (
                      <Badge variant="default" className="gap-1" data-testid={`badge-creator-${player.id}`}>
                        <Crown className="w-3 h-3" />
                        Izveidotājs
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isCreator && (
              <>
                <Separator />
                <div className="space-y-3">
                  {!canStart && (
                    <p className="text-sm text-muted-foreground text-center" data-testid="text-min-players-warning">
                      Nepieciešami vismaz 2 spēlētāji, lai sāktu spēli
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="w-full h-12 text-lg font-semibold"
                    disabled={!canStart}
                    onClick={handleStartGame}
                    data-testid="button-start-game"
                  >
                    Sākt Spēli
                  </Button>
                </div>
              </>
            )}

            {!isCreator && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground text-center py-2" data-testid="text-waiting-creator">
                  Gaidām, kamēr istabas izveidotājs sāks spēli...
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
