"use client";

import { signIn, getCsrfToken } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch CSRF token on mount
    getCsrfToken().then((token) => {
      if (token) {
        setCsrfToken(token);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csrfToken) {
      // Wait for CSRF token if not yet loaded
      const token = await getCsrfToken();
      if (!token) {
        setError("Unable to initialize login. Please refresh the page.");
        return;
      }
      setCsrfToken(token);
    }

    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      csrfToken,
      redirect: false,
    });

    setIsLoading(false);

    if (!result?.error) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", width: "100%" }}>
        <h1>Login</h1>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: "100%" }}
          />
        </div>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button 
          type="submit" 
          disabled={isLoading || !csrfToken}
          style={{ width: "100%", marginTop: "1rem", opacity: isLoading || !csrfToken ? 0.7 : 1 }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "1rem" }}>
          Demo: admin@example.com / admin123
        </p>
      </form>
    </div>
  );
}