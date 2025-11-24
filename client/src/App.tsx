import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketProvider } from "@/lib/websocket";
import Home from "@/pages/home";
import CreateRoomPage from "@/pages/create-room";
import JoinRoomPage from "@/pages/join-room";
import LobbyPage from "@/pages/lobby";
import PlayPage from "@/pages/play";
import ResultsPage from "@/pages/results";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateRoomPage} />
      <Route path="/join" component={JoinRoomPage} />
      <Route path="/lobby/:code" component={LobbyPage} />
      <Route path="/play/:code" component={PlayPage} />
      <Route path="/results/:code" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WebSocketProvider>
          <Toaster />
          <Router />
        </WebSocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
