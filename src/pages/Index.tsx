
import React from "react";
import { Toaster } from "sonner";
import BlogConverter from "@/components/BlogConverter";
import Footer from "@/components/Footer";

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
        </div>
        
        <BlogConverter />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
