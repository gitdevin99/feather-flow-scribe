
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotionService } from "@/lib/NotionService";
import { Loader2 } from "lucide-react";

const NotionCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing Notion authentication...");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        
        if (!code) {
          setStatus("error");
          setMessage("No authorization code provided");
          return;
        }
        
        // Process the OAuth code
        const success = await NotionService.handleOAuthCallback(code);
        
        if (success) {
          setStatus("success");
          setMessage("Successfully authenticated with Notion!");
          
          // Navigate back to home page after a short delay
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Failed to authenticate with Notion");
        }
      } catch (error) {
        console.error("Error during Notion callback:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unknown error occurred");
      }
    };
    
    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authenticating with Notion</h2>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Authentication Successful</h2>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Failed</h2>
          </>
        )}
        
        <p className="text-gray-600">{message}</p>
        
        {status !== "loading" && (
          <button 
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default NotionCallback;
