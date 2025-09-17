import { Routes, Route } from "react-router-dom";
import Survey from "./pages/Survey";
import References from "./pages/References";
import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Survey />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/references" element={<References />} />
      </Routes>
    </Layout>
  );
}

export default App;
