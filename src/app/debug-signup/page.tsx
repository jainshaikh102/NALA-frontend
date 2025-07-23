"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/hooks/use-auth";

export default function DebugSignupPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("123456");
  const [fullName, setFullName] = useState("Test User");
  const [directTestResult, setDirectTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const registerMutation = useRegister();

  // Test direct API call
  const testDirectSignup = async () => {
    setLoading(true);
    try {
      console.log("Testing direct signup call...");
      const response = await fetch("https://backend.nalabot.com/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirm_password: password,
          full_name: fullName,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
      console.log("Response data:", data);

      setDirectTestResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        requestPayload: {
          email: email,
          password: password,
          confirm_password: password,
          full_name: fullName,
        },
      });
    } catch (error) {
      console.error("Direct test error:", error);
      setDirectTestResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test using the hook
  const testHookSignup = () => {
    registerMutation.mutate({
      email: email,
      password: password,
      confirm_password: password,
      full_name: fullName,
    });
  };

  // Test variation 1: without confirm_password
  const testVariation1 = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://backend.nalabot.com/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }

      setDirectTestResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        requestPayload: {
          email: email,
          password: password,
          full_name: fullName,
        },
        variation: "Without confirm_password",
      });
    } catch (error) {
      setDirectTestResult({
        error: error.message,
        variation: "Without confirm_password",
      });
    } finally {
      setLoading(false);
    }
  };

  // Test variation 2: with username instead of full_name
  const testVariation2 = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://backend.nalabot.com/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirm_password: password,
          username: email.split("@")[0],
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }

      setDirectTestResult({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
        requestPayload: {
          email: email,
          password: password,
          confirm_password: password,
          username: email.split("@")[0],
        },
        variation: "With username instead of full_name",
      });
    } catch (error) {
      setDirectTestResult({
        error: error.message,
        variation: "With username instead of full_name",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Signup Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={testDirectSignup} disabled={loading}>
              {loading ? "Testing..." : "Test Direct API Call"}
            </Button>
            <Button
              onClick={testHookSignup}
              disabled={registerMutation.isPending}
              variant="outline"
            >
              {registerMutation.isPending ? "Testing..." : "Test Using Hook"}
            </Button>
            <Button
              onClick={() => testVariation1()}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Test Variation 1
            </Button>
            <Button
              onClick={() => testVariation2()}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Test Variation 2
            </Button>
          </div>

          {directTestResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Direct API Test Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(directTestResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {registerMutation.error && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="text-sm text-red-600">
                  Hook Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-red-50 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(registerMutation.error, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {registerMutation.data && (
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle className="text-sm text-green-600">
                  Hook Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-green-50 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(registerMutation.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600">
            <p>
              <strong>Current API Base URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_API_BASE_URL ||
                "https://backend.nalabot.com"}
            </p>
            <p>
              <strong>Expected Signup URL:</strong>{" "}
              https://backend.nalabot.com/auth/signup
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
