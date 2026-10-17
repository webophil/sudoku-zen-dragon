import { Game } from './components/Game';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Game />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
