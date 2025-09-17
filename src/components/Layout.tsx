import { Link } from "react-router-dom";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <nav className="navBar w-full h-16 bg-gray-800 text-white flex items-center justify-between px-4">
        <h1 className="text-3xl font-bold underline">
          <Link to="/">Qualitative Visualization Survey</Link>
        </h1>
        <div>
          <Link to="/survey" className="text-white px-3 py-2 rounded-md text-sm font-medium">Survey</Link>
          <Link to="/references" className="text-white px-3 py-2 rounded-md text-sm font-medium">References</Link>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
