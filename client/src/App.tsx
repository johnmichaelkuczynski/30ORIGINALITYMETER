import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileEdit, GraduationCap, Search, BarChart3, Home as HomeIcon } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import DocumentRewriterPage from "@/pages/DocumentRewriter";
import HomeworkHelperPage from "@/pages/HomeworkHelper";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Originality Analysis", icon: <Search className="h-4 w-4" /> },
    { 
      id: "document-rewriter",
      href: "#document-rewriter", 
      label: "Document Rewriter", 
      icon: <FileEdit className="h-4 w-4" />,
      isSection: true 
    },
    { 
      id: "homework-helper",
      href: "#homework-helper", 
      label: "Homework Helper", 
      icon: <GraduationCap className="h-4 w-4" />,
      isSection: true 
    },
    { 
      id: "graph-generator",
      href: "#graph-generator", 
      label: "Graph Generator", 
      icon: <BarChart3 className="h-4 w-4" />,
      isSection: true 
    },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            item.isSection ? (
              <Button
                key={item.id}
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            ) : (
              <Link key={item.path} href={item.path!}>
                <Button
                  variant={location === item.path ? "default" : "outline"}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            )
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

function Router() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Originality Meter</h1>
        <p className="text-xl text-gray-600">Advanced AI-powered platform for scholarly writing analysis and enhancement</p>
      </div>
      
      <Navigation />
      
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/rewriter" component={DocumentRewriterPage}/>
        <Route path="/homework" component={HomeworkHelperPage}/>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
