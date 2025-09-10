import { AppProvider } from './context/AppContext'; // Import the provider
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';


function AppLayout() {
  return (
    <div className="App bg-gray-50 min-h-screen flex text-gray-900 overflow-hidden">
      {/* These components no longer need any props drilled down to them. */}
      {/* They will get all the data they need from the AppContext. */}
      
      <Sidebar initialWidth={256} minWidth={200} maxWidth={400} />
      
      <main className="flex flex-grow">
        <NoteList initialWidth={350} minWidth={250} maxWidth={600} />
        <NoteEditor />
      </main>
    </div>
  );
}

/**
 * The main App component that gets rendered in index.tsx.
 * Its sole responsibility is to wrap the entire application's UI
 * with the AppProvider, making the global state available everywhere.
 */
function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;