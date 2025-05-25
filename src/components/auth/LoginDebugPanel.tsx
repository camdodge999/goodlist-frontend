"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginDebugPanel() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const testScenarios = [
    {
      name: "Valid Credentials Test",
      email: "test@example.com",
      password: "validpassword"
    },
    {
      name: "Invalid Credentials Test", 
      email: "invalid@example.com",
      password: "wrongpassword"
    },
    {
      name: "Empty Email Test",
      email: "",
      password: "password123"
    },
    {
      name: "Empty Password Test",
      email: "test@example.com", 
      password: ""
    }
  ];

  const runTest = async (scenario: any) => {
    console.log(`Running test: ${scenario.name}`);
    
    try {
      const result = await signIn("credentials", {
        email: scenario.email,
        password: scenario.password,
        redirect: false,
      });

      const testResult = {
        scenario: scenario.name,
        timestamp: new Date().toISOString(),
        result: result,
        success: !result?.error
      };

      console.log(`Test result for ${scenario.name}:`, testResult);
      setTestResults(prev => [testResult, ...prev]);

    } catch (error) {
      const testResult = {
        scenario: scenario.name,
        timestamp: new Date().toISOString(),
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        success: false
      };

      console.log(`Test error for ${scenario.name}:`, testResult);
      setTestResults(prev => [testResult, ...prev]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-bold mb-4">Login Debug Panel</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {testScenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => runTest(scenario)}
            className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            {scenario.name}
          </button>
        ))}
      </div>

      <button
        onClick={clearResults}
        className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 mb-4"
      >
        Clear Results
      </button>

      <div className="max-h-96 overflow-y-auto">
        <h4 className="font-semibold mb-2">Test Results:</h4>
        {testResults.map((result, index) => (
          <div key={index} className="bg-white p-3 rounded mb-2 text-sm">
            <div className="font-semibold text-blue-600">{result.scenario}</div>
            <div className="text-gray-500 text-xs">{result.timestamp}</div>
            <div className={`mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              Status: {result.success ? 'SUCCESS' : 'FAILED'}
            </div>
            <div className="mt-1">
              <strong>Full Response:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 