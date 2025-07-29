"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (
    name: string,
    url: string,
    method: string = "GET",
    body?: any
  ) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data,
          url: url,
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          status: "ERROR",
          ok: false,
          error: error.message,
          url: url,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const testAllEndpoints = () => {
    // Test all auth endpoints via Next.js API routes
    testEndpoint("login", "/api/auth/login", "POST", {
      email: "test@example.com",
      password: "testpassword",
    });

    testEndpoint("signup", "/api/auth/signup", "POST", {
      email: "test@example.com",
      password: "testpassword",
      confirm_password: "testpassword",
      full_name: "Test User",
    });

    testEndpoint("forgot-password", "/api/auth/forgot-password", "POST", {
      email: "test@example.com",
    });

    testEndpoint("artists", "/api/artists", "GET");

    testEndpoint("execute-query", "/api/chat/execute-query", "POST", {
      question: "test question",
      username: "testuser",
      model_name: "gpt-4.1",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testAllEndpoints} className="mb-4">
            Test All Endpoints
          </Button>

          <div className="grid gap-4">
            {Object.entries(results).map(([name, result]) => (
              <Card
                key={name}
                className={`${
                  result.ok ? "border-green-500" : "border-red-500"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-sm">
                    {name} {loading[name] && "(Loading...)"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>URL:</strong> {result.url}
                    </div>
                    <div>
                      <strong>Status:</strong> {result.status}
                    </div>
                    <div>
                      <strong>Success:</strong> {result.ok ? "Yes" : "No"}
                    </div>
                    {result.error && (
                      <div className="text-red-500">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    {result.data && (
                      <div>
                        <strong>Response:</strong>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
