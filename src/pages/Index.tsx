
import React from "react";
import { Toaster } from "sonner";
import BlogConverter from "@/components/BlogConverter";
import Footer from "@/components/Footer";
import FeatherTemplateHelp from "@/components/FeatherTemplateHelp";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Toaster position="top-center" />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Blog to Notion Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Automatically convert blog articles into Notion pages that match the Feather blog template structure
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild className="gap-2">
              <Link to="/zapier-integration">
                <LinkIcon className="h-4 w-4" />
                Configure Zapier Integration
              </Link>
            </Button>
          </div>
        </div>
        
        <BlogConverter />
        
        <FeatherTemplateHelp />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
