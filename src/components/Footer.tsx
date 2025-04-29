
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              Made for use with{" "}
              <a
                href="https://feather.so"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Feather.so
              </a>{" "}
              and Notion
            </p>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://crystalline-wealth-78b.notion.site/Feather-Blog-Template-SaaS-1e366063bb4f80b39172c51181afb8ca?pvs=73"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <ExternalLink className="h-4 w-4 mr-1" /> 
                Template
              </a>
            </Button>
            
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-blue-600"
              >
                <Github className="h-4 w-4 mr-1" /> 
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
