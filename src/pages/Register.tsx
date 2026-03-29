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

export function Register() {
  const navigate = useNavigate();

  const [idioma, setIdioma] = useState<IdiomaType>(
    (localStorage.getItem("idioma") as IdiomaType) || "en",
  );
  const [menuIdiomaAberto, setMenuIdiomaAberto] = useState(false);
  const menuIdiomaRef = useRef<HTMLDivElement>(null);
  const t = translations[idioma];

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");

  const [phoneCode, setPhoneCode] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Estados simplificados para a visualização das senhas
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    try {
      await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/auth/register",
        {
          fullName,
          cpf: cpf.replace(/\D/g, ""),
          email,
          phone: `${phoneCode} ${phone}`,
          password,
        },
      );

      alert(t.successMsg);
      const primeiroNome = fullName.split(" ")[0];
      localStorage.setItem("usuario", primeiroNome);
      localStorage.setItem("abaAtiva", "home");
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError(t.errorGeneral);
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
          padding: "2.5rem",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          width: "100%",
          maxWidth: "450px",
          maxHeight: "90vh",
          overflowY: "auto",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={menuIdiomaRef}
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <button
            type="button"
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
                  type="button"
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
            marginBottom: "2rem",
            marginTop: "1rem",
          }}
        >
          <AppLogo size={40} />
          <h1
            style={{
              margin: 0,
              fontSize: "1.6rem",
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

        <form
          onSubmit={handleRegister}
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
              {t.fullNameLabel}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #eaeaea",
                backgroundColor: "transparent",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            <div>
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
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #eaeaea",
                  backgroundColor: "transparent",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
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
                {t.phoneLabel}
              </label>

              <div
                style={{
                  display: "flex",
                  borderRadius: "10px",
                  border: "1px solid #eaeaea",
                  backgroundColor: "transparent",
                  overflow: "hidden",
                }}
              >
                <select
                  required
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "10px 5px 10px 10px",
                    outline: "none",
                    borderRight: "1px solid #eaeaea",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: "#333",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                >
                  <option value="" disabled>
                    🌍 --
                  </option>
                  {countryPhoneCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={phone}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                    if (v.length > 9) v = v.replace(/(\d)(\d{4})$/, "$1-$2");
                    setPhone(v);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 10px",
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
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
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #eaeaea",
                backgroundColor: "transparent",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            <div>
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
                    padding: "10px 36px 10px 14px",
                    borderRadius: "10px",
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
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    padding: "2px",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseDown={() => setIsPasswordVisible(true)}
                  onMouseUp={() => setIsPasswordVisible(false)}
                  onMouseLeave={() => setIsPasswordVisible(false)}
                  onTouchStart={() => setIsPasswordVisible(true)}
                  onTouchEnd={() => setIsPasswordVisible(false)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {isPasswordVisible ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              </div>
            </div>

            <div>
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
                {t.confirmPasswordLabel}
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 36px 10px 14px",
                    borderRadius: "10px",
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
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    padding: "2px",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onMouseDown={() => setIsConfirmPasswordVisible(true)}
                  onMouseUp={() => setIsConfirmPasswordVisible(false)}
                  onMouseLeave={() => setIsConfirmPasswordVisible(false)}
                  onTouchStart={() => setIsConfirmPasswordVisible(true)}
                  onTouchEnd={() => setIsConfirmPasswordVisible(false)}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {isConfirmPasswordVisible ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: "1rem",
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
            {t.registerBtn}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#666" }}>
          {t.hasAccount}{" "}
          <Link
            to="/"
            style={{
              color: "#d91616",
              fontWeight: "600",
              textDecoration: "underline",
            }}
          >
            {t.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

const countryPhoneCodes = [
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+55", label: "🇧🇷 +55" },
  { code: "+34", label: "🇪🇸 +34" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+39", label: "🇮🇹 +39" },
  { code: "+81", label: "🇯🇵 +81" },
  { code: "+86", label: "🇨🇳 +86" },
  { code: "+82", label: "🇰🇷 +82" },
];

const translations = {
  pt: {
    flag: "🇧🇷",
    langs: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês",
      de: "Alemão",
      it: "Italiano",
      ja: "Japonês",
      zh: "Chinês",
      ko: "Coreano",
    },
    title: "Criar Conta",
    fullNameLabel: "Nome Completo",
    cpfLabel: "CPF",
    phoneLabel: "Telefone",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    confirmPasswordLabel: "Confirmar Senha",
    registerBtn: "Cadastrar",
    hasAccount: "Já tem uma conta?",
    loginLink: "Faça Login",
    errorMismatch: "As senhas não coincidem.",
    errorGeneral:
      "Erro ao criar conta. Este CPF ou E-mail já pode estar em uso.",
    successMsg: "Conta criada com sucesso! Faça login para continuar.",
  },
  en: {
    flag: "🇺🇸",
    langs: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      ja: "Japanese",
      zh: "Chinese",
      ko: "Korean",
    },
    title: "Create Account",
    fullNameLabel: "Full Name",
    cpfLabel: "ID / CPF",
    phoneLabel: "Phone",
    emailLabel: "E-mail",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    registerBtn: "Sign Up",
    hasAccount: "Already have an account?",
    loginLink: "Log In",
    errorMismatch: "Passwords do not match.",
    errorGeneral:
      "Error creating account. This ID or E-mail may already be in use.",
    successMsg: "Account created successfully! Please log in to continue.",
  },
  es: {
    flag: "🇪🇸",
    langs: {
      pt: "Portugués",
      en: "Inglés",
      es: "Español",
      fr: "Francés",
      de: "Alemán",
      it: "Italiano",
      ja: "Japonés",
      zh: "Chino",
      ko: "Coreano",
    },
    title: "Crear Cuenta",
    fullNameLabel: "Nombre Completo",
    cpfLabel: "Identificación / CPF",
    phoneLabel: "Teléfono",
    emailLabel: "Correo",
    passwordLabel: "Contraseña",
    confirmPasswordLabel: "Confirmar Contraseña",
    registerBtn: "Regístrate",
    hasAccount: "¿Ya tienes una cuenta?",
    loginLink: "Entrar",
    errorMismatch: "Las contraseñas no coinciden.",
    errorGeneral:
      "Error al crear la cuenta. Esta Identificación o Correo puede estar en uso.",
    successMsg: "¡Cuenta creada con éxito! Inicia sesión para continuar.",
  },
  fr: {
    flag: "🇫🇷",
    langs: {
      pt: "Portugais",
      en: "Anglais",
      es: "Espagnol",
      fr: "Français",
      de: "Allemand",
      it: "Italien",
      ja: "Japonais",
      zh: "Chinois",
      ko: "Coréen",
    },
    title: "Créer un Compte",
    fullNameLabel: "Nom Complet",
    cpfLabel: "ID / CPF",
    phoneLabel: "Téléphone",
    emailLabel: "E-mail",
    passwordLabel: "Mot de passe",
    confirmPasswordLabel: "Confirmer",
    registerBtn: "S'inscrire",
    hasAccount: "Vous avez déjà un compte?",
    loginLink: "Se connecter",
    errorMismatch: "Les mots de passe ne correspondent pas.",
    errorGeneral:
      "Erreur de création. Cet ID ou E-mail est peut-être déjà utilisé.",
    successMsg:
      "Compte créé avec succès! Veuillez vous connecter pour continuer.",
  },
  de: {
    flag: "🇩🇪",
    langs: {
      pt: "Portugiesisch",
      en: "Englisch",
      es: "Spanisch",
      fr: "Französisch",
      de: "Deutsch",
      it: "Italienisch",
      ja: "Japanisch",
      zh: "Chinesisch",
      ko: "Koreanisch",
    },
    title: "Konto Erstellen",
    fullNameLabel: "Vollständiger Name",
    cpfLabel: "Ausweis / CPF",
    phoneLabel: "Telefon",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    confirmPasswordLabel: "Bestätigen",
    registerBtn: "Registrieren",
    hasAccount: "Haben Sie bereits ein Konto?",
    loginLink: "Anmelden",
    errorMismatch: "Passwörter stimmen nicht überein.",
    errorGeneral:
      "Fehler beim Erstellen. Diese ID oder E-Mail könnte bereits verwendet werden.",
    successMsg:
      "Konto erfolgreich erstellt! Bitte melden Sie sich an, um fortzufahren.",
  },
  it: {
    flag: "🇮🇹",
    langs: {
      pt: "Portoghese",
      en: "Inglese",
      es: "Spagnolo",
      fr: "Francese",
      de: "Tedesco",
      it: "Italiano",
      ja: "Giapponese",
      zh: "Cinese",
      ko: "Coreano",
    },
    title: "Crea Account",
    fullNameLabel: "Nome Completo",
    cpfLabel: "Documento / CPF",
    phoneLabel: "Telefono",
    emailLabel: "E-mail",
    passwordLabel: "Password",
    confirmPasswordLabel: "Conferma",
    registerBtn: "Iscriviti",
    hasAccount: "Hai già un account?",
    loginLink: "Accedi",
    errorMismatch: "Le password non corrispondono.",
    errorGeneral:
      "Errore durante la creazione. Questo ID o e-mail potrebbe essere già in uso.",
    successMsg: "Account creato con successo! Accedi per continuare.",
  },
  ja: {
    flag: "🇯🇵",
    langs: {
      pt: "ポルトガル語",
      en: "英語",
      es: "スペイン語",
      fr: "フランス語",
      de: "ドイツ語",
      it: "イタリア語",
      ja: "日本語",
      zh: "中国語",
      ko: "韓国語",
    },
    title: "アカウント作成",
    fullNameLabel: "フルネーム",
    cpfLabel: "身分証明書 / CPF",
    phoneLabel: "電話番号",
    emailLabel: "メール",
    passwordLabel: "パスワード",
    confirmPasswordLabel: "パスワード確認",
    registerBtn: "登録",
    hasAccount: "すでにアカウントをお持ちですか？",
    loginLink: "ログイン",
    errorMismatch: "パスワードが一致しません。",
    errorGeneral:
      "エラー。このIDまたはメールはすでに使用されている可能性があります。",
    successMsg:
      "アカウントが正常に作成されました！続行するにはログインしてください。",
  },
  zh: {
    flag: "🇨🇳",
    langs: {
      pt: "葡萄牙语",
      en: "英语",
      es: "西班牙语",
      fr: "法语",
      de: "德语",
      it: "意大利语",
      ja: "日语",
      zh: "中文",
      ko: "韩语",
    },
    title: "创建账号",
    fullNameLabel: "全名",
    cpfLabel: "身份证 / CPF",
    phoneLabel: "电话号码",
    emailLabel: "电子邮件",
    passwordLabel: "密码",
    confirmPasswordLabel: "确认密码",
    registerBtn: "注册",
    hasAccount: "已有账号？",
    loginLink: "登录",
    errorMismatch: "密码不匹配。",
    errorGeneral: "创建账号错误。此ID或电邮可能已被使用。",
    successMsg: "账号创建成功！请登录以继续。",
  },
  ko: {
    flag: "🇰🇷",
    langs: {
      pt: "포르투갈어",
      en: "英語",
      es: "スペイン語",
      fr: "フランス語",
      de: "ドイツ語",
      it: "イタリア語",
      ja: "日本語",
      zh: "中国語",
      ko: "한국어",
    },
    title: "계정 만들기",
    fullNameLabel: "성명",
    cpfLabel: "신분증 / CPF",
    phoneLabel: "전화번호",
    emailLabel: "이메일",
    passwordLabel: "비밀번호",
    confirmPasswordLabel: "비밀번호 확인",
    registerBtn: "가입하기",
    hasAccount: "이미 계정이 있으신가요?",
    loginLink: "로그인",
    errorMismatch: "비밀번호가 일치하지 않습니다.",
    errorGeneral:
      "계정 생성 오류. 이 ID 또는 이메일은 이미 사용 중일 수 있습니다.",
    successMsg: "계정이 성공적으로 생성되었습니다! 계속하려면 로그인하십시오.",
  },
};
