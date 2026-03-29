import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import bgImg from "../assets/loginbackground.png";

type IdiomaType = "pt" | "en" | "es" | "fr" | "de" | "it" | "ja" | "zh" | "ko";

const AppLogo = ({ size = 45 }: { size?: number }) => (
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
      src="/logo.png"
      alt="Logo"
      style={{
        height: "100%",
        width: "100%",
        objectFit: "cover",
        transform: "scale(1.3)",
      }}
    />
  </div>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeSlashIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export function Login() {
  const navigate = useNavigate();

  const [idioma, setIdioma] = useState<IdiomaType>(
    (localStorage.getItem("idioma") as IdiomaType) || "en",
  );
  const [menuIdiomaAberto, setMenuIdiomaAberto] = useState(false);
  const menuIdiomaRef = useRef<HTMLDivElement>(null);
  const t = translations[idioma];

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isPermanentlyShown, setIsPermanentlyShown] = useState(false);
  const [isTemporarilyShown, setIsTemporarilyShown] = useState(false);
  const isPasswordVisible = isPermanentlyShown || isTemporarilyShown;

  useEffect(() => {
    localStorage.setItem("idioma", idioma);
  }, [idioma]);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (
        menuIdiomaRef.current &&
        !menuIdiomaRef.current.contains(event.target as Node)
      ) {
        setMenuIdiomaAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const idiomasOrdenados = (Object.keys(translations) as IdiomaType[]).sort(
    (a, b) => t.langs[a].localeCompare(t.langs[b]),
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/auth/login",
        {
          cpf: cpf.replace(/\D/g, ""), 
          password: password,
        },
      );
      const token = response.data.token || response.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("abaAtiva", "home");
        navigate("/dashboard");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError(t.errorInvalid);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Open Sans', sans-serif",
        backgroundColor: "#fff",
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
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bgImg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: 0.7,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#fff",
          padding: "3rem",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={menuIdiomaRef}
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <button
            onClick={() => setMenuIdiomaAberto(!menuIdiomaAberto)}
            style={{
              background: "#f5f5f5",
              border: "1px solid #eaeaea",
              borderRadius: "22px",
              padding: "6px 10px",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#333",
            }}
          >
            {t.flag} <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>▼</span>
          </button>
          {menuIdiomaAberto && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: 0,
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                padding: "10px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                zIndex: 1001,
                minWidth: "220px",
              }}
            >
              {idiomasOrdenados.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setIdioma(lang);
                    setMenuIdiomaAberto(false);
                  }}
                  style={{
                    background: idioma === lang ? "#f5f5f5" : "transparent",
                    border: "none",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    color: "#333",
                    textAlign: "left",
                    fontWeight: idioma === lang ? "bold" : "normal",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>
                    {translations[lang].flag}
                  </span>{" "}
                  {t.langs[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "2.5rem",
            marginTop: "1rem",
          }}
        >
          <AppLogo />
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#111",
              letterSpacing: "0.5px",
            }}
          >
            {t.title}
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#d91616",
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

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
        >
          <div style={{ textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.8rem",
                color: "#888",
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              {t.cpfLabel}
            </label>
            <input
              type="text"
              required
              maxLength={14}
              value={cpf}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                setCpf(v);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #eaeaea",
                backgroundColor: "transparent",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.8rem",
                color: "#888",
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              {t.passwordLabel}
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={isPasswordVisible ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #eaeaea",
                  backgroundColor: "transparent",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setIsPermanentlyShown((prev) => !prev)}
                onMouseEnter={() => setIsTemporarilyShown(true)}
                onMouseLeave={() => setIsTemporarilyShown(false)}
                onTouchStart={() => setIsTemporarilyShown(true)}
                onTouchEnd={() => setIsTemporarilyShown(false)}
              >
                {isPasswordVisible ? <EyeIcon /> : <EyeSlashIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: "1.5rem",
              padding: "14px 20px",
              backgroundColor: "#d91616",
              color: "white",
              border: "none",
              borderRadius: "15px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "1.0rem",
              width: "100%",
            }}
          >
            {t.loginBtn}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#666" }}>
          {t.noAccount}{" "}
          <Link
            to="/register"
            style={{
              color: "#d91616",
              fontWeight: "600",
              textDecoration: "underline",
            }}
          >
            {t.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

const translations = {
  pt: {
    flag: "🇧🇷",
    langs: { pt: "Português", en: "Inglês", es: "Espanhol", fr: "Francês", de: "Alemão", it: "Italiano", ja: "Japonês", zh: "Chinês", ko: "Coreano" },
    title: "GlobalWallet",
    cpfLabel: "CPF",
    passwordLabel: "Senha",
    loginBtn: "Entrar",
    noAccount: "Não tem uma conta?",
    registerLink: "Cadastre-se",
    errorInvalid: "CPF ou senha inválidos.",
  },
  en: {
    flag: "🇺🇸",
    langs: { pt: "Portuguese", en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian", ja: "Japanese", zh: "Chinese", ko: "Korean" },
    title: "GlobalWallet",
    cpfLabel: "ID / CPF",
    passwordLabel: "Password",
    loginBtn: "Login",
    noAccount: "Don't have an account?",
    registerLink: "Sign up",
    errorInvalid: "Invalid ID or password.",
  },
  es: {
    flag: "🇪🇸",
    langs: { pt: "Portugués", en: "Inglés", es: "Español", fr: "Francés", de: "Alemán", it: "Italiano", ja: "Japonés", zh: "Chino", ko: "Coreano" },
    title: "GlobalWallet",
    cpfLabel: "Identificación / CPF",
    passwordLabel: "Contraseña",
    loginBtn: "Entrar",
    noAccount: "¿No tienes una cuenta?",
    registerLink: "Regístrate",
    errorInvalid: "Identificación o contraseña no válidos.",
  },
  fr: {
    flag: "🇫🇷",
    langs: { pt: "Portugais", en: "Anglais", es: "Espagnol", fr: "Français", de: "Allemand", it: "Italien", ja: "Japonais", zh: "Chinois", ko: "Coréen" },
    title: "GlobalWallet",
    cpfLabel: "ID / CPF",
    passwordLabel: "Mot de passe",
    loginBtn: "Se connecter",
    noAccount: "Vous n'avez pas de compte?",
    registerLink: "S'inscrire",
    errorInvalid: "ID ou mot de passe invalide.",
  },
  de: {
    flag: "🇩🇪",
    langs: { pt: "Portugiesisch", en: "Englisch", es: "Spanisch", fr: "Französisch", de: "Deutsch", it: "Italienisch", ja: "Japanisch", zh: "Chinesisch", ko: "Koreanisch" },
    title: "GlobalWallet",
    cpfLabel: "Ausweis / CPF",
    passwordLabel: "Passwort",
    loginBtn: "Anmelden",
    noAccount: "Haben Sie kein Konto?",
    registerLink: "Registrieren",
    errorInvalid: "Ungültige ID oder Passwort.",
  },
  it: {
    flag: "🇮🇹",
    langs: { pt: "Portoghese", en: "Inglese", es: "Spagnolo", fr: "Francese", de: "Tedesco", it: "Italiano", ja: "Giapponese", zh: "Cinese", ko: "Coreano" },
    title: "GlobalWallet",
    cpfLabel: "Documento / CPF",
    passwordLabel: "Password",
    loginBtn: "Accedi",
    noAccount: "Non hai un account?",
    registerLink: "Iscriviti",
    errorInvalid: "ID o password non validi.",
  },
  ja: {
    flag: "🇯🇵",
    langs: { pt: "ポルトガル語", en: "英語", es: "スペイン語", fr: "フランス語", de: "ドイツ語", it: "イタリア語", ja: "日本語", zh: "中国語", ko: "韓国語" },
    title: "GlobalWallet",
    cpfLabel: "身分証明書 / CPF",
    passwordLabel: "パスワード",
    loginBtn: "ログイン",
    noAccount: "アカウントをお持ちではありませんか？",
    registerLink: "登録",
    errorInvalid: "無効なIDまたはパスワードです。",
  },
  zh: {
    flag: "🇨🇳",
    langs: { pt: "葡萄牙语", en: "英语", es: "西班牙语", fr: "法语", de: "德语", it: "意大利语", ja: "日语", zh: "中文", ko: "韩语" },
    title: "GlobalWallet",
    cpfLabel: "身份证 / CPF",
    passwordLabel: "密码",
    loginBtn: "登录",
    noAccount: "没有账号？",
    registerLink: "注册",
    errorInvalid: "ID或密码无效。",
  },
  ko: {
    flag: "🇰🇷",
    langs: { pt: "포르투갈어", en: "英語", es: "スペイン語", fr: "フランス語", de: "ドイツ語", it: "イタリア語", ja: "日本語", zh: "中国語", ko: "한국어" },
    title: "GlobalWallet",
    cpfLabel: "신분증 / CPF",
    passwordLabel: "비밀번호",
    loginBtn: "로그인",
    noAccount: "계정이 없으신가요?",
    registerLink: "가입하기",
    errorInvalid: "유효하지 않은 ID 또는 비밀번호입니다.",
  },
};