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
import type { CreateRoom } from "@shared/schema";

export default function CreateRoomPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { joinRoom } = useWebSocket();
  const [playerName, setPlayerName] = useState("");

  const createRoomMutation = useMutation({
    mutationFn: async (data: CreateRoom) => {
      const res = await apiRequest("POST", "/api/rooms/create", data);
      return await res.json();
    },
    onSuccess: (data: { code: string; playerId: string; room: any }) => {
      joinRoom(data.code, data.playerId);
      setLocation(`/lobby/${data.code}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Kļūda",
        description: error.message || "Neizdevās izveidot istabu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoomMutation.mutate({ playerName: playerName.trim() });
    }
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
            <CardTitle className="text-2xl font-bold" data-testid="text-create-title">Izveidot Jaunu Istabu</CardTitle>
            <CardDescription data-testid="text-create-description">
              Ievadi savu vārdu, lai sāktu spēli
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg font-semibold"
                disabled={createRoomMutation.isPending || !playerName.trim()}
                data-testid="button-submit-create"
              >
                {createRoomMutation.isPending ? "Izveido..." : "Izveidot Istabu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
