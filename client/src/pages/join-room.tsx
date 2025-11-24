import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";
import type { JoinRoom } from "@shared/schema";

export default function JoinRoomPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { joinRoom } = useWebSocket();
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  const joinRoomMutation = useMutation({
    mutationFn: async (data: JoinRoom) => {
      const res = await apiRequest("POST", "/api/rooms/join", data);
      return await res.json();
    },
    onSuccess: (data: { playerId: string; room: any }) => {
      joinRoom(roomCode.toUpperCase(), data.playerId);
      setLocation(`/lobby/${roomCode.toUpperCase()}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Kļūda",
        description: error.message || "Neizdevās pievienoties istabai",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      joinRoomMutation.mutate({
        code: roomCode.trim().toUpperCase(),
        playerName: playerName.trim(),
      });
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setRoomCode(value.slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atpakaļ
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold" data-testid="text-join-title">Pievienoties Istabai</CardTitle>
            <CardDescription data-testid="text-join-description">
              Ievadi istabas kodu un savu vārdu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roomCode" className="text-base font-medium">
                  Istabas kods
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="123456"
                  value={roomCode}
                  onChange={handleCodeChange}
                  maxLength={6}
                  required
                  className="h-14 text-3xl text-center font-mono tracking-widest font-bold"
                  data-testid="input-room-code"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-base font-medium">
                  Tavs vārds
                </Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Ievadi vārdu..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={50}
                  required
                  className="h-12 text-lg"
                  data-testid="input-player-name"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg font-semibold"
                disabled={joinRoomMutation.isPending || roomCode.length !== 6 || !playerName.trim()}
                data-testid="button-submit-join"
              >
                {joinRoomMutation.isPending ? "Pievienojas..." : "Pievienoties"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
