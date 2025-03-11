import { Component, createSignal, onMount } from 'solid-js';
import Home from './pages/Home';
import { trackClick, initSession } from './lib/tracking';

const App: Component = () => {
  const [sessionId, setSessionId] = createSignal<string | null>(null);

  onMount(async () => {
    const id = crypto.randomUUID();
    setSessionId(id);
    
    try {
      await initSession(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  });

  const handleClick = (elementId: string) => {
    trackClick(sessionId() ?? '', elementId);
  };

  return <Home sessionId={sessionId()} handleClick={handleClick} />;
};

export default App;
