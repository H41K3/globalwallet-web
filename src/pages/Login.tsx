import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Importe do logo
import logoImg from "../assets/logo.jpeg";

const AppLogo = ({ size = 50 }: { size?: number }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      width: `${size}px`,
      height: `${size}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <img
      src={logoImg}
      alt="Logo GlobalWallet"
      style={{
        height: "100%",
        width: "100%",
        objectFit: "cover",
        transform: "scale(1.3)",
      }}
    />
  </div>
);

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Integração com o Backend usando o campo 'login' conforme o DTO do Spring Boot
      const response = await axios.post("https://swiss-project-api.onrender.com/api/v1/auth/login", {
        login: username, 
        password: password
      });

      // O backend retorna o token diretamente ou dentro de um objeto
      const token = response.data.token || response.data;
      
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", username);
        navigate("/dashboard");
      } else {
        setError("Não foi possível obter o token de acesso.");
      }
    } catch (err) {
      console.error(err);
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Open Sans', sans-serif",
        backgroundColor: "#f9fafb",
        // Trava a tela para remover o scroll e manter estática
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden", 
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "3rem",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "2.5rem",
          }}
        >
          <AppLogo size={45} />
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#111",
              letterSpacing: "0.5px",
            }}
          >
            GlobalWallet
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#EC0000",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ textAlign: "left" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.8rem",
                color: "#888",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Nome de usuário
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #eaeaea",
                backgroundColor: "#fafafa",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#EC0000")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#eaeaea")}
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.8rem",
                color: "#888",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #eaeaea",
                backgroundColor: "#fafafa",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#EC0000")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#eaeaea")}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "1.5rem",
              padding: "14px 20px",
              backgroundColor: "#EC0000",
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "1.0rem",
              boxShadow: "0 5px 15px rgba(236,0,0,0.25)",
              transition: "background-color 0.2s, transform 0.1s",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D50000")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EC0000")}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Entrar
          </button>
        </form>

        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.9rem",
            color: "#666",
            margin: "2rem 0 0 0",
          }}
        >
          Não tem uma conta?{" "}
          <span
            style={{
              color: "#EC0000",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}