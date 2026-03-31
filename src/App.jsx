import './App.css'
import Pages from "@/pages";
import { Toaster } from "@/components/ui/sonner";
import CustomCursor from "@/components/ui/CustomCursor";

function App() {
  return (
    <>
      <CustomCursor />
      <Pages />
      <Toaster />
    </>
  );
}

export default App;