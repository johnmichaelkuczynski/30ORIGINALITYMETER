import SemanticAnalyzer from "@/components/SemanticAnalyzer";
import { FaBrain } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-secondary-900">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaBrain className="text-primary text-xl" />
            <div>
              <h1 className="text-xl font-bold text-green-800">Originality Meter</h1>
              <p className="text-sm text-secondary-600">Semantic Originality Analyzer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SemanticAnalyzer />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-secondary-500 text-sm">
            Originality Meter — Evaluating conceptual innovation, not plagiarism
          </p>
        </div>
      </footer>
    </div>
  );
}
