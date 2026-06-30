import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center">
        <h2 className="text-zinc-900 mb-2">Page Not Found</h2>
        <p className="text-zinc-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#5f352e" }}
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
