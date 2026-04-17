import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type IdiomaType = "pt" | "en" | "es" | "fr" | "de";
type AbaType = "home" | "statement" | "cards" | "settings";

interface Transacao {
  id?: number;
  description?: string;
  amount?: number;
  transactionDate?: string;
  type?: string;
  category?: string;
  card?: Cartao;
  paymentMethod?: string;
}

interface Cartao {
  id: number;
  nome?: string;
  name?: string;
  lastDigits: string;
  totalLimit: number;
  currentInvoice: number;
  cor?: string;
  color?: string;
  bandeira?: string; // Preparado para o Backend
  flag?: string; // Preparado para o Backend (em inglês)
}

type ThemeType = {
  bgMain: string;
  bgCard: string;
  textMain: string;
  textSec: string;
  textMuted: string;
  border: string;
  inputBg: string;
  sidebarBg: string;
  sidebarHover: string;
  highlightBg: string;
  shadow: string;
  green: string;
  red: string;
};

// ==========================================
// PRESETS DE CARTÕES E BANDEIRAS
// ==========================================
const PRESET_CARDS = [
  { name: "Nubank", color: "#8A05BE" },
  { name: "Itaú", color: "#EC7000" },
  { name: "Bradesco", color: "#CC092F" },
  { name: "Santander", color: "#EC0000" },
  { name: "Banco do Brasil", color: "#F9D308" },
  { name: "Caixa", color: "#005CA9" },
  { name: "Inter", color: "#FF7A00" },
  { name: "C6 Bank", color: "#242424" },
  { name: "XP", color: "#000000" },
  { name: "Personalizado", color: "#616161" },
];

const ChipSVG = () => (
  <svg
    width="35"
    height="25"
    viewBox="0 0 35 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="35" height="25" rx="4" fill="#D4AF37" />
    <path d="M5 0V25M30 0V25M0 12.5H35" stroke="#B8860B" strokeWidth="1.5" />
    <rect
      x="10"
      y="5"
      width="15"
      height="15"
      rx="2"
      stroke="#B8860B"
      strokeWidth="1.5"
    />
  </svg>
);

const MastercardSVG = () => (
  <svg
    width="40"
    height="24"
    viewBox="0 0 40 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="15" cy="12" r="12" fill="#EB001B" />
    <circle cx="25" cy="12" r="12" fill="#F79E1B" />
    <path
      d="M20 23.3C22.6 21 24.5 17.6 24.5 12C24.5 6.4 22.6 3 20 0.7C17.4 3 15.5 6.4 15.5 12C15.5 17.6 17.4 21 20 23.3Z"
      fill="#FF5F00"
    />
  </svg>
);

const VisaSVG = () => (
  <div
    style={{
      color: "white",
      fontSize: "18px",
      fontWeight: "900",
      fontStyle: "italic",
      fontFamily: "'Arial Black', Impact, sans-serif",
      letterSpacing: "-1px",
      filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.5))",
      flexShrink: 0,
      lineHeight: 1,
      userSelect: "none",
    }}
  >
    VISA
  </div>
);

// Função Inteligente para Renderizar a Bandeira Correta
const renderBandeira = (cartao: Cartao) => {
  // 1º Tenta usar a bandeira que veio do banco de dados
  const flagDB = cartao.bandeira?.toLowerCase() || cartao.flag?.toLowerCase();

  // 2º Se não tiver no DB ainda, tenta adivinhar pelo nome do cartão
  const nomeBanco = (cartao.nome || cartao.name || "").toLowerCase();

  if (
    flagDB === "visa" ||
    (!flagDB &&
      (nomeBanco.includes("brasil") ||
        nomeBanco.includes("bradesco") ||
        nomeBanco.includes("xp") ||
        nomeBanco.includes("visa")))
  ) {
    return <VisaSVG />;
  }

  // Default / Fallback
  return <MastercardSVG />;
};

// ==========================================
// UTILITÁRIOS GLOBAIS
// ==========================================
const obterDataAtualLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// ==========================================
// CUSTOM COMPONENTS
// ==========================================
const CategoryOption = ({
  catKey,
  idiom,
  onSelect,
  isSelected,
  theme,
}: {
  catKey: string;
  idiom: IdiomaType;
  onSelect: () => void;
  isSelected: boolean;
  theme: ThemeType;
}) => {
  const catData = categoryMap[catKey];
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderRadius: "8px",
        marginBottom: "2px",
        backgroundColor: isSelected ? theme.highlightBg : "transparent",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.backgroundColor = theme.highlightBg;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>{catData.emoji}</span>
      <span
        style={{
          color: isSelected ? theme.textMain : theme.textSec,
          fontSize: "0.85rem",
          fontWeight: "500",
        }}
      >
        {catData[idiom]}
      </span>
    </div>
  );
};

const PaymentMethodOption = ({
  tipo,
  card,
  label,
  onSelect,
  isSelected,
  theme,
}: {
  tipo: "ACCOUNT" | "PIX" | "CARD" | "BALANCE";
  card?: Cartao;
  label: string;
  onSelect: () => void;
  isSelected: boolean;
  theme: ThemeType;
}) => {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: isSelected ? theme.highlightBg : "transparent",
        borderRadius: "8px",
        marginBottom: "2px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.backgroundColor = theme.highlightBg;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {tipo === "PIX" && (
        <>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? theme.textMain : theme.textSec,
              fontSize: "0.85rem",
            }}
          >
            {label}
          </span>
        </>
      )}
      {tipo === "ACCOUNT" && (
        <>
          <span style={{ fontSize: "1.1rem" }}>🏦</span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? theme.textMain : theme.textSec,
              fontSize: "0.85rem",
            }}
          >
            {label}
          </span>
        </>
      )}
      {tipo === "BALANCE" && (
        <>
          <span style={{ fontSize: "1.1rem" }}>💰</span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? theme.textMain : theme.textSec,
              fontSize: "0.85rem",
            }}
          >
            {label}
          </span>
        </>
      )}
      {tipo === "CARD" && card && (
        <>
          <span
            style={{
              fontSize: "1.1rem",
              color: card.color || card.cor || "#8A05BE",
            }}
          >
            💳
          </span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? theme.textMain : theme.textSec,
              fontSize: "0.85rem",
            }}
          >
            {label} ({card.lastDigits})
          </span>
        </>
      )}
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // 1. ESTADOS GLOBAIS E TEMA
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState<AbaType>(
    (localStorage.getItem("abaAtiva") as AbaType) || "home",
  );

  const [idioma, setIdioma] = useState<IdiomaType>(
    (localStorage.getItem("idioma") as IdiomaType) || "pt",
  );

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [menuAberto, setMenuAberto] = useState(false);
  const [moedaExibicao, setMoedaExibicao] = useState<"BRL" | "USD" | "EUR">(
    "BRL",
  );
  const [cotacoes, setCotacoes] = useState({ usd: 0, eur: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t: any = translations[idioma];

  const theme: ThemeType = isDarkMode
    ? {
        bgMain: "#222222",
        bgCard: "#2d2d2d",
        textMain: "#f5f5f5",
        textSec: "#a0a0a0",
        textMuted: "#777",
        border: "#444",
        inputBg: "#2a2a2a",
        sidebarBg: "#222222",
        sidebarHover: "#2c2c2c",
        highlightBg: "#3d3d3d",
        shadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        green: "#4caf50",
        red: "#ef5350",
      }
    : {
        bgMain: "#f0f2f5",
        bgCard: "#fff",
        textMain: "#111",
        textSec: "#555",
        textMuted: "#888",
        border: "#eaeaea",
        inputBg: "#fafafa",
        sidebarBg: "#fff",
        sidebarHover: "#f5f5f5",
        highlightBg: "#ebebeb",
        shadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        green: "#107c10",
        red: "#d91616",
      };

  // ==========================================
  // UX - LOADING E TOASTS
  // ==========================================
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // ==========================================
  // ESTADOS RESTANTES
  // ==========================================
  const [perfilUsuario, setPerfilUsuario] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const nomeUsuario = localStorage.getItem("usuario") || "";
  const primeiroNome = perfilUsuario.fullName
    ? perfilUsuario.fullName.split(" ")[0]
    : nomeUsuario;

  const [saldo, setSaldo] = useState<number | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [dataTransacao, setDataTransacao] = useState(obterDataAtualLocal());
  const [tipoTransacaoSelecionado, setTipoTransacaoSelecionado] = useState<
    "INCOME" | "EXPENSE"
  >("EXPENSE");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string>("OTHER");
  const [menuCategoriaAberto, setMenuCategoriaAberto] = useState(false);
  const menuCategoriaRef = useRef<HTMLDivElement>(null);

  const [formaPagamento, setFormaPagamento] = useState<string>("PIX");
  const [menuCartaoAberto, setMenuCartaoAberto] = useState(false);
  const menuCartaoRef = useRef<HTMLDivElement>(null);

  const [isDataPickerOpen, setIsDataPickerOpen] = useState(false);
  const dataPickerRef = useRef<HTMLDivElement>(null);
  const [pickerInsertMode, setPickerInsertMode] = useState<"month" | "day">(
    "day",
  );
  const [pickerInsertYear, setPickerInsertYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [pickerInsertMonth, setPickerInsertMonth] = useState<number>(
    new Date().getMonth() + 1,
  );

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState<number>(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState<number>(dataAtual.getFullYear());
  const [diaFiltro, setDiaFiltro] = useState<number | null>(null);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"month" | "day">("month");
  const [pickerYear, setPickerYear] = useState<number>(dataAtual.getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

  const [expandedStatementGroup, setExpandedStatementGroup] = useState<
    string | null
  >(null);
  const [statementInnerFilter, setStatementInnerFilter] = useState<
    Record<string, "ALL" | "INCOME" | "EXPENSE">
  >({});

  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [novoCartaoNome, setNovoCartaoNome] = useState("");
  const [novoCartaoFinal, setNovoCartaoFinal] = useState("");
  const [novoCartaoLimite, setNovoCartaoLimite] = useState("");
  const [novoCartaoCor, setNovoCartaoCor] = useState("#8A05BE");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  // ==========================================
  // EFEITOS E FUNÇÕES
  // ==========================================

  useEffect(() => {
    document.body.style.backgroundColor = theme.bgMain;
    document.body.style.margin = "0";
  }, [theme.bgMain]);

  useEffect(() => {
    localStorage.setItem("abaAtiva", abaAtiva);
  }, [abaAtiva]);

  useEffect(() => {
    localStorage.setItem("idioma", idioma);
  }, [idioma]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setIsLoading(true);
      await Promise.all([buscarTudo(), buscarCotacoes(), buscarCartoes()]);
      setIsLoading(false);
    };
    carregarDadosIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (
        menuCategoriaRef.current &&
        !menuCategoriaRef.current.contains(event.target as Node)
      ) {
        setMenuCategoriaAberto(false);
      }
      if (
        menuCartaoRef.current &&
        !menuCartaoRef.current.contains(event.target as Node)
      ) {
        setMenuCartaoAberto(false);
      }
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      ) {
        setIsMonthPickerOpen(false);
      }
      if (
        dataPickerRef.current &&
        !dataPickerRef.current.contains(event.target as Node)
      ) {
        setIsDataPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    const categoriasValidas = getCategoriasDisponiveis();
    if (!categoriasValidas.includes(categoriaSelecionada)) {
      setCategoriaSelecionada(
        tipoTransacaoSelecionado === "INCOME" ? "SALARY" : "OTHER",
      );
    }

    if (tipoTransacaoSelecionado === "INCOME") {
      if (formaPagamento === "BALANCE") {
        setFormaPagamento("PIX");
      } else if (formaPagamento !== "ACCOUNT" && formaPagamento !== "PIX") {
        setFormaPagamento("PIX");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTransacaoSelecionado]);

  const handleMudarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha === senhaAtual) {
      showToast(
        t.errorSamePassword || "A nova senha deve ser diferente da atual.",
        "error",
      );
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      showToast(t.errorMismatch, "error");
      return;
    }
    if (novaSenha.length < 6) {
      showToast(
        t.errorShortPassword || "A senha deve ter no mínimo 6 caracteres.",
        "error",
      );
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "https://localhost:8080",
        { currentPassword: senhaAtual, newPassword: novaSenha },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast(
        t.successPasswordUpdate || "Senha atualizada com sucesso!",
        "success",
      );
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    } catch (erro) {
      console.error(erro);
      showToast(
        t.errorPasswordUpdate ||
          "Erro ao trocar senha. Verifique se a senha atual está correta.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const buscarTudo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      const [resSaldo, resTrans, resPerfil] = await Promise.all([
        axios.get(
          "https://globalwallet-api-9ffu.onrender.com/api/v1/transactions/balance",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get(
          "https://globalwallet-api-9ffu.onrender.com/api/v1/transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        axios.get("https://globalwallet-api-9ffu.onrender.com/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSaldo(
        resSaldo.data.balance !== undefined
          ? resSaldo.data.balance
          : resSaldo.data,
      );
      setTransacoes(
        Array.isArray(resTrans.data)
          ? resTrans.data
          : resTrans.data.content || [],
      );
      if (resPerfil && resPerfil.data) setPerfilUsuario(resPerfil.data);
    } catch (erro) {
      console.error(erro);
      navigate("/");
    }
  };

  const buscarCotacoes = async () => {
    try {
      const res = await axios.get(
        "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL",
      );
      setCotacoes({
        usd: parseFloat(res.data.USDBRL.bid),
        eur: parseFloat(res.data.EURBRL.bid),
      });
    } catch (erro) {
      console.error(erro);
    }
  };

  const handleLogoClick = () => {
    localStorage.setItem("abaAtiva", "home");
    window.location.reload();
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovaDescricao(e.target.value);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovoValor(e.target.value.replace(/[^0-9.,]/g, ""));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const valorNumerico = Math.abs(parseFloat(novoValor.replace(",", ".")));
      if (isNaN(valorNumerico)) {
        showToast(t.errorValue, "error");
        return;
      }

      let valorParaSalvar = valorNumerico;
      if (moedaExibicao === "USD" && cotacoes.usd > 0) {
        valorParaSalvar = valorNumerico * cotacoes.usd;
      }
      if (moedaExibicao === "EUR" && cotacoes.eur > 0) {
        valorParaSalvar = valorNumerico * cotacoes.eur;
      }

      const isCard =
        formaPagamento !== "ACCOUNT" &&
        formaPagamento !== "PIX" &&
        formaPagamento !== "BALANCE";

      setIsLoading(true);
      await axios.post(
        "https://globalwallet-api-9ffu.onrender.com/api/v1/transactions",
        {
          description:
            novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1),
          amount: valorParaSalvar,
          transactionDate: dataTransacao,
          type: tipoTransacaoSelecionado,
          category: categoriaSelecionada,
          cardId: isCard ? Number(formaPagamento) : null,
          paymentMethod: isCard ? "CARD" : formaPagamento,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNovaDescricao("");
      setNovoValor("");
      setFormaPagamento("PIX");
      setDataTransacao(obterDataAtualLocal());
      await buscarTudo();
      await buscarCartoes();
      showToast("Transação registrada com sucesso!", "success");
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao salvar! Verifique o servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id?: number) => {
    if (!id || !window.confirm(t.confirmDelete)) return;
    try {
      setIsLoading(true);
      await axios.delete(
        `https://globalwallet-api-9ffu.onrender.com/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      await buscarTudo();
      await buscarCartoes();
      showToast("Transação excluída!", "success");
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao excluir transação.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMesAnterior = () => {
    setDiaFiltro(null);
    if (mesFiltro === 1) {
      setMesFiltro(12);
      setAnoFiltro(anoFiltro - 1);
    } else {
      setMesFiltro(mesFiltro - 1);
    }
  };

  const handleMesSeguinte = () => {
    setDiaFiltro(null);
    if (mesFiltro === 12) {
      setMesFiltro(1);
      setAnoFiltro(anoFiltro + 1);
    } else {
      setMesFiltro(mesFiltro + 1);
    }
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    if (!t.transactionDate) return false;
    const [anoStr, mesStr, diaStr] = t.transactionDate.split("-");
    const anoMatch = parseInt(anoStr, 10) === anoFiltro;
    const mesMatch = parseInt(mesStr, 10) === mesFiltro;
    const diaMatch = diaFiltro === null || parseInt(diaStr, 10) === diaFiltro;
    return anoMatch && mesMatch && diaMatch;
  });

  const totalEntradasMes = transacoesFiltradas
    .filter((t) => t.type === "INCOME" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalSaidasMes = transacoesFiltradas
    .filter((t) => t.type === "EXPENSE" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const saldoMes = totalEntradasMes - totalSaidasMes;

  // ==========================================
  // LÓGICA DE ORDENAÇÃO DE FORMAS DE PAGAMENTO
  // ==========================================
  const getPaymentOptions = () => {
    // 1. Array só de Cartões (para colocar em ordem alfabética)
    const cardOptions: Array<{
      type: "CARD";
      id: string;
      label: string;
      card?: Cartao;
    }> = [];

    if (tipoTransacaoSelecionado === "EXPENSE") {
      cartoes.forEach((c) => {
        cardOptions.push({
          type: "CARD",
          id: String(c.id),
          label: c.nome || c.name || "",
          card: c,
        });
      });
      // Ordena os cartões por ordem alfabética
      cardOptions.sort((a, b) => a.label.localeCompare(b.label, idioma));
    }

    // 2. Array das Opções Fixas (Cravadas no final em ordem P, S, T)
    const fixedOptions: Array<{
      type: "PIX" | "ACCOUNT" | "BALANCE";
      id: string;
      label: string;
    }> = [];

    fixedOptions.push({ type: "PIX", id: "PIX", label: "Pix" });

    if (tipoTransacaoSelecionado === "EXPENSE") {
      fixedOptions.push({
        type: "BALANCE",
        id: "BALANCE",
        label: t.balanceOption || "Saldo em Conta",
      });
    }

    fixedOptions.push({
      type: "ACCOUNT",
      id: "ACCOUNT",
      label: t.transferLabel || "Transferência",
    });

    // Concatena os cartões (alfabéticos) e coloca os fixos sempre em baixo
    return [...cardOptions, ...fixedOptions];
  };

  const getStatementGroups = () => {
    const groupsList: Array<{
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      color: string;
      bgColor: string;
      isCard: boolean;
      transactions: Transacao[];
    }> = [];

    // 1. Adiciona os Cartões (Ordenados Alfabeticamente)
    const cartoesOrdenados = [...cartoes].sort((a, b) => {
      const nomeA = a.nome || a.name || "";
      const nomeB = b.nome || b.name || "";
      return nomeA.localeCompare(nomeB, idioma);
    });

    cartoesOrdenados.forEach((c) => {
      groupsList.push({
        id: `card-${c.id}`,
        title: c.nome || c.name || "Cartão",
        subtitle: `**** ${c.lastDigits}`,
        icon: "💳",
        color: "#fff",
        bgColor: c.color || c.cor || "#333",
        isCard: true,
        transactions: [],
      });
    });

    // 2. Adiciona as opções fixas (Sempre no final: Pix, Saldo em Conta, Transferência)
    groupsList.push({
      id: "pix",
      title: "Pix",
      subtitle: "Transferência",
      icon: "⚡",
      color: "#fff",
      bgColor: "#32bcad",
      isCard: false,
      transactions: [],
    });

    groupsList.push({
      id: "balance",
      title: t.balanceOption || "Saldo em Conta",
      subtitle: "Débito direto",
      icon: "💰",
      color: "#fff",
      bgColor: "#827717",
      isCard: false,
      transactions: [],
    });

    groupsList.push({
      id: "account",
      title: t.transferLabel || "Transferência",
      subtitle: "TED/DOC",
      icon: "🏦",
      color: "#fff",
      bgColor: "#0277bd",
      isCard: false,
      transactions: [],
    });

    // 3. Distribui as transações
    transacoesFiltradas.forEach((t_row) => {
      let keyId = "";
      if (t_row.card) {
        keyId = `card-${t_row.card.id}`;
      } else if (t_row.paymentMethod === "PIX") {
        keyId = "pix";
      } else if (t_row.paymentMethod === "BALANCE") {
        keyId = "balance";
      } else {
        keyId = "account";
      }

      const targetGroup = groupsList.find((g) => g.id === keyId);
      if (targetGroup) {
        targetGroup.transactions.push(t_row);
      }
    });

    return groupsList;
  };

  const statementGroups = getStatementGroups();

  const buscarCartoes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const resposta = await axios.get(
        "https://globalwallet-api-9ffu.onrender.com/api/v1/cards",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCartoes(resposta.data);
    } catch (erro) {
      console.error("Erro ao buscar cartões:", erro);
    }
  };

  const handleDeleteCartao = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cartão?")) return;
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      await axios.delete(
        `https://globalwallet-api-9ffu.onrender.com/api/v1/cards/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await buscarCartoes();
      showToast("Cartão excluído com sucesso!", "success");
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao excluir o cartão.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartaoNome || !novoCartaoFinal || !novoCartaoLimite) return;
    const limiteNumerico = parseFloat(
      novoCartaoLimite.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    if (isNaN(limiteNumerico)) {
      showToast(t.errorValue, "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsLoading(true);
      await axios.post(
        "https://globalwallet-api-9ffu.onrender.com/api/v1/cards",
        {
          name: novoCartaoNome,
          lastDigits: novoCartaoFinal,
          totalLimit: limiteNumerico,
          color: novoCartaoCor,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsCardModalOpen(false);
      setNovoCartaoNome("");
      setNovoCartaoFinal("");
      setNovoCartaoLimite("");
      setNovoCartaoCor("#8A05BE");
      await buscarCartoes();
      showToast("Cartão adicionado com sucesso!", "success");
    } catch (erro) {
      console.error("Erro ao criar cartão:", erro);
      showToast("Erro ao salvar o cartão. Verifique os dados.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================
  const getCategoriasDisponiveis = () => {
    const catKeys =
      tipoTransacaoSelecionado === "INCOME"
        ? ["SALARY", "SALES", "INVESTMENTS"]
        : [
            "BILLS",
            "ENTERTAINMENT",
            "FOOD",
            "MARKET",
            "TRANSPORT",
            "INVESTMENTS",
          ];

    catKeys.sort((a, b) =>
      categoryMap[a][idioma].localeCompare(categoryMap[b][idioma]),
    );
    return [...catKeys, "OTHER"];
  };

  const getValorExibicao = (valorBaseReal: number) => {
    if (moedaExibicao === "USD" && cotacoes.usd > 0)
      return {
        simbolo: "US$",
        valorFormatado: (valorBaseReal / cotacoes.usd).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    if (moedaExibicao === "EUR" && cotacoes.eur > 0)
      return {
        simbolo: "€",
        valorFormatado: (valorBaseReal / cotacoes.eur).toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      };
    return {
      simbolo: "R$",
      valorFormatado: valorBaseReal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  };

  const fmtBRL = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUSD = (v: number) =>
    `US$ ${(v / cotacoes.usd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtEUR = (v: number) =>
    `€ ${(v / cotacoes.eur).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatarDataLocal = (dataString?: string) => {
    if (!dataString) return "---";
    const partes = dataString.split("T")[0].split("-");
    if (partes.length !== 3) return dataString;
    const mapaLocais: Record<IdiomaType, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
    };
    return new Date(
      Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])),
    ).toLocaleDateString(mapaLocais[idioma], {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarDataInput = (dataString: string) => {
    if (!dataString) return "---";
    const [anoStr, mesStr, diaStr] = dataString.split("-");
    const mapaLocais: Record<IdiomaType, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
    };
    return new Date(
      Date.UTC(Number(anoStr), Number(mesStr) - 1, Number(diaStr)),
    ).toLocaleDateString(mapaLocais[idioma], {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const agruparTransacoesPorDia = (transacoesParaAgrupar: Transacao[]) => {
    const grupos: Record<string, Transacao[]> = {};

    transacoesParaAgrupar.forEach((t_row) => {
      const dataFormatada = formatarDataLocal(t_row.transactionDate);
      if (!grupos[dataFormatada]) {
        grupos[dataFormatada] = [];
      }
      grupos[dataFormatada].push(t_row);
    });

    return Object.entries(grupos).sort((a, b) => {
      const dateA = new Date(a[1][0].transactionDate as string).getTime();
      const dateB = new Date(b[1][0].transactionDate as string).getTime();
      return dateB - dateA;
    });
  };

  const cartaoSelecionado = cartoes.find(
    (c) => String(c.id) === formaPagamento,
  );
  const opcoesPagamento = getPaymentOptions();

  const AppLogo = ({ size = 45 }: { size?: number }) => (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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

  const SidebarItem = ({
    id,
    icon,
    label,
  }: {
    id: AbaType;
    icon: string;
    label: string;
  }) => {
    const isAtivo = abaAtiva === id;
    return (
      <li
        onClick={() => {
          setAbaAtiva(id);
          setMenuAberto(false);
        }}
        style={{
          padding: "1.2rem 1.5rem",
          borderBottom: `1px solid ${theme.border}`,
          cursor: "pointer",
          fontWeight: isAtivo ? "bold" : "normal",
          color: isAtivo ? (isDarkMode ? "#f5f5f5" : theme.red) : theme.textSec,
          borderLeft: isAtivo
            ? `4px solid ${theme.red}`
            : "4px solid transparent",
          backgroundColor: isAtivo ? theme.highlightBg : "transparent",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          if (!isAtivo)
            e.currentTarget.style.backgroundColor = theme.sidebarHover;
        }}
        onMouseLeave={(e) => {
          if (!isAtivo) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ marginRight: "8px" }}>{icon}</span> {label}
      </li>
    );
  };

  const idiomasOrdenados = (Object.keys(translations) as IdiomaType[]).sort(
    (a, b) => t.langs[a].localeCompare(t.langs[b]),
  );

  const catSelecionadaData =
    categoryMap[categoriaSelecionada] || categoryMap["OTHER"];

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL (JSX)
  // ==========================================
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundColor: theme.bgMain,
        minHeight: "100vh",
        paddingBottom: "2rem",
        transition: "background-color 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideUpToast { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: toast.type === "error" ? theme.red : theme.green,
            color: "white",
            padding: "12px 24px",
            borderRadius: "30px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            zIndex: 10000,
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "slideUpToast 0.3s ease-out",
          }}
        >
          {toast.type === "error" ? "⚠️" : "✅"} {toast.message}
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode
              ? "rgba(0,0,0,0.8)"
              : "rgba(255,255,255,0.8)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: `5px solid ${theme.border}`,
              borderTop: `5px solid ${theme.red}`,
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              marginTop: "15px",
              color: theme.textMain,
              fontWeight: "600",
              fontSize: "1.1rem",
            }}
          >
            Carregando...
          </p>
        </div>
      )}

      {menuAberto && (
        <div
          onClick={() => setMenuAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 999,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: menuAberto ? 0 : "-308px",
          width: "308px",
          height: "100vh",
          backgroundColor: theme.sidebarBg,
          boxShadow: theme.shadow,
          transition: "left 0.3s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "#d91616",
            padding: "1.5rem 1.5rem",
            color: "white",
          }}
        >
          <div
            onClick={handleLogoClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "5px",
              cursor: "pointer",
            }}
          >
            <AppLogo size={32} />
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "bold" }}>
              {t.title}
            </h2>
          </div>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
            {t.subtitle}
          </p>
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            flex: 1,
            fontSize: "0.95rem",
          }}
        >
          <SidebarItem id="home" icon="🏠" label={t.home} />
          <SidebarItem id="statement" icon="📊" label={t.statement} />
          <SidebarItem id="cards" icon="💳" label={t.cards} />
          <SidebarItem id="settings" icon="⚙️" label={t.settings} />
        </ul>
      </div>

      <header
        style={{
          backgroundColor: "#d91616",
          color: "white",
          padding: isMobile ? "0 1rem" : "0 1.5rem",
          height: "80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0 0 22px 22px",
          boxShadow: theme.shadow,
          marginBottom: "2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "10px" : "30px",
            height: "100%",
          }}
        >
          <button
            onClick={() => setMenuAberto(true)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "2.0rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
              marginTop: "-3px",
            }}
          >
            ☰
          </button>
          <div
            onClick={handleLogoClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "18px",
              cursor: "pointer",
              height: "100%",
            }}
          >
            <AppLogo size={isMobile ? 30 : 40} />
            <h2
              style={{
                margin: 0,
                fontSize: isMobile ? "1.1rem" : "1.6rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              {t.title}
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "15px",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? "0.85rem" : "1.0rem",
              whiteSpace: "nowrap",
            }}
          >
            {t.welcome}, <strong>{primeiroNome}</strong>
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              padding: isMobile ? "6px 12px" : "10px 20px",
              borderRadius: "25px",
              fontSize: isMobile ? "0.85rem" : "1.0rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {t.logout}
          </button>
        </div>
      </header>

      <div
        style={{
          padding: isMobile ? "0 1rem 1rem 1rem" : "0 2rem 2rem 2rem",
          maxWidth: "750px",
          margin: "0 auto",
        }}
      >
        {/* ================= ABA 1: HOME ================= */}
        {abaAtiva === "home" && (
          <>
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "2rem",
                borderRadius: "16px",
                textAlign: "center",
                boxShadow: theme.shadow,
                position: "relative",
                transition: "background-color 0.3s ease",
              }}
            >
              {cotacoes.usd > 0 && (
                <div
                  style={{
                    position: isMobile ? "relative" : "absolute",
                    top: isMobile ? "0" : "20px",
                    right: isMobile ? "0" : "20px",
                    margin: isMobile ? "0 auto 1.5rem auto" : "0",
                    width: "fit-content",
                    display: "flex",
                    gap: "5px",
                    backgroundColor: theme.inputBg,
                    padding: "4px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {(["BRL", "USD", "EUR"] as const).map((moeda) => (
                    <button
                      key={moeda}
                      onClick={() => setMoedaExibicao(moeda)}
                      style={{
                        background:
                          moedaExibicao === moeda
                            ? theme.highlightBg
                            : "transparent",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: moedaExibicao === moeda ? "bold" : "normal",
                        color: theme.textMain,
                        boxShadow:
                          moedaExibicao === moeda
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : "none",
                      }}
                    >
                      {moeda}
                    </button>
                  ))}
                </div>
              )}
              <p
                style={{
                  color: theme.textMuted,
                  margin: 0,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t.balance}
              </p>
              <h1
                style={{
                  fontSize: "2.5rem",
                  margin: "10px 0",
                  color: theme.textMain,
                  fontWeight: "600",
                }}
              >
                {saldo !== null ? (
                  <>
                    <span
                      style={{
                        fontSize: "1.2rem",
                        color: theme.textMuted,
                        fontWeight: "normal",
                        marginRight: "5px",
                      }}
                    >
                      {getValorExibicao(saldo).simbolo}
                    </span>
                    {getValorExibicao(saldo).valorFormatado}
                  </>
                ) : (
                  "---"
                )}
              </h1>
              {saldo !== null && cotacoes.usd > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "25px",
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: `1px solid ${theme.border}`,
                  }}
                >
                  {moedaExibicao !== "BRL" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: theme.textSec,
                        fontSize: "0.95rem",
                      }}
                    >
                      <span>🇧🇷</span>
                      <strong>{fmtBRL(saldo)}</strong>
                    </div>
                  )}
                  {moedaExibicao !== "USD" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: theme.textSec,
                        fontSize: "0.95rem",
                      }}
                      title={`Cotação: R$ ${cotacoes.usd.toFixed(2)}`}
                    >
                      <span>🇺🇸</span>
                      <strong>{fmtUSD(saldo)}</strong>
                    </div>
                  )}
                  {moedaExibicao !== "EUR" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: theme.textSec,
                        fontSize: "0.95rem",
                      }}
                      title={`Cotação: R$ ${cotacoes.eur.toFixed(2)}`}
                    >
                      <span>🇪🇺</span>
                      <strong>{fmtEUR(saldo)}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "2rem",
                backgroundColor: theme.bgCard,
                borderRadius: "20px",
                boxShadow: theme.shadow,
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  margin: "0 0 20px 0",
                  color: theme.textMain,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                {t.newTransaction}
              </h4>
              <form
                onSubmit={handleAddTransaction}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    backgroundColor: theme.inputBg,
                    borderRadius: "30px",
                    padding: "4px",
                    border: `1px solid ${theme.border}`,
                    width: isMobile ? "100%" : "fit-content",
                    margin: "0 auto 5px auto",
                  }}
                >
                  {(["EXPENSE", "INCOME"] as const).map((type) => {
                    const isSelected = tipoTransacaoSelecionado === type;
                    const isExpense = type === "EXPENSE";
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTipoTransacaoSelecionado(type)}
                        style={{
                          background: isSelected
                            ? isExpense
                              ? isDarkMode
                                ? "#4a1c1c"
                                : "#ffebee"
                              : isDarkMode
                                ? "#1b3320"
                                : "#e8f5e9"
                            : "transparent",
                          border: "none",
                          padding: "8px 25px",
                          borderRadius: "25px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: isSelected
                            ? isExpense
                              ? theme.red
                              : theme.green
                            : theme.textMuted,
                          boxShadow: isSelected
                            ? "0 2px 5px rgba(0,0,0,0.2)"
                            : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {isExpense ? "- " + t.expense : "+ " + t.income}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div ref={menuCategoriaRef} style={{ position: "relative" }}>
                    <p
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "0.75rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t.selCategory}
                    </p>
                    <div
                      onClick={() =>
                        setMenuCategoriaAberto(!menuCategoriaAberto)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>
                          {catSelecionadaData.emoji}
                        </span>
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: theme.textMain,
                            fontWeight: "500",
                          }}
                        >
                          {catSelecionadaData[idioma]}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: theme.textMuted,
                          transform: menuCategoriaAberto
                            ? "rotate(180deg)"
                            : "none",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                    {menuCategoriaAberto && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          left: 0,
                          width: "100%",
                          backgroundColor: theme.bgCard,
                          borderRadius: "12px",
                          boxShadow: theme.shadow,
                          padding: "6px",
                          zIndex: 1002,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {getCategoriasDisponiveis().map((catKey) => (
                          <CategoryOption
                            key={catKey}
                            catKey={catKey}
                            idiom={idioma}
                            theme={theme}
                            isSelected={categoriaSelecionada === catKey}
                            onSelect={() => {
                              setCategoriaSelecionada(catKey);
                              setMenuCategoriaAberto(false);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div ref={menuCartaoRef} style={{ position: "relative" }}>
                    <p
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "0.75rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {tipoTransacaoSelecionado === "EXPENSE"
                        ? t.paymentHistoryLabel || "Forma de Pagamento"
                        : t.receiptMethodLabel || "Forma de Recebimento"}
                    </p>
                    <div
                      onClick={() => {
                        setMenuCartaoAberto(!menuCartaoAberto);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        cursor: "pointer",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {formaPagamento === "PIX" ? (
                          <>
                            <span style={{ fontSize: "1.1rem" }}>⚡</span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              Pix
                            </span>
                          </>
                        ) : formaPagamento === "ACCOUNT" ? (
                          <>
                            <span style={{ fontSize: "1.1rem" }}>🏦</span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {t.transferLabel || "Transferência"}
                            </span>
                          </>
                        ) : formaPagamento === "BALANCE" ? (
                          <>
                            <span style={{ fontSize: "1.1rem" }}>💰</span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {t.balanceOption || "Saldo em Conta"}
                            </span>
                          </>
                        ) : cartaoSelecionado ? (
                          <>
                            <span
                              style={{
                                fontSize: "1.1rem",
                                color:
                                  cartaoSelecionado.color ||
                                  cartaoSelecionado.cor ||
                                  "#8A05BE",
                              }}
                            >
                              💳
                            </span>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {cartaoSelecionado.nome || cartaoSelecionado.name}{" "}
                              ({cartaoSelecionado.lastDigits})
                            </span>
                          </>
                        ) : null}
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: theme.textMuted,
                          transform: menuCartaoAberto
                            ? "rotate(180deg)"
                            : "none",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                    {menuCartaoAberto && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          left: 0,
                          width: "100%",
                          backgroundColor: theme.bgCard,
                          borderRadius: "12px",
                          boxShadow: theme.shadow,
                          padding: "6px",
                          zIndex: 1002,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {opcoesPagamento.map((opt) => (
                          <PaymentMethodOption
                            key={opt.id}
                            tipo={opt.type}
                            card={opt.type === "CARD" ? opt.card : undefined}
                            label={opt.label}
                            theme={theme}
                            onSelect={() => {
                              setFormaPagamento(opt.id);
                              setMenuCartaoAberto(false);
                            }}
                            isSelected={formaPagamento === opt.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "0.75rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t.descriptionLabel || "Descrição"}
                    </p>
                    <input
                      type="text"
                      required
                      value={novaDescricao}
                      onChange={handleDescricaoChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textMain,
                        outline: "none",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "15px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div ref={dataPickerRef} style={{ position: "relative" }}>
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "0.75rem",
                          color: theme.textMuted,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {t.dateLabel || "Data"}
                      </p>
                      <div
                        onClick={() => {
                          if (!isDataPickerOpen) {
                            const [ano, mes] = dataTransacao.split("-");
                            setPickerInsertYear(parseInt(ano, 10));
                            setPickerInsertMonth(parseInt(mes, 10));
                            setPickerInsertMode("day");
                          }
                          setIsDataPickerOpen(!isDataPickerOpen);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.inputBg,
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: theme.textMain,
                            fontWeight: "500",
                          }}
                        >
                          {formatarDataInput(dataTransacao)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: theme.textMuted,
                            transform: isDataPickerOpen
                              ? "rotate(180deg)"
                              : "none",
                            transition: "transform 0.2s",
                          }}
                        >
                          ▼
                        </span>
                      </div>

                      {isDataPickerOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            backgroundColor: theme.bgCard,
                            borderRadius: "16px",
                            boxShadow: theme.shadow,
                            padding: "16px",
                            zIndex: 1005,
                            width: "250px",
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {pickerInsertMode === "month" ? (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "16px",
                                  padding: "0 4px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerInsertYear((y) => y - 1);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.1rem",
                                    color: theme.textSec,
                                  }}
                                >
                                  ❮
                                </button>
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                    color: theme.textMain,
                                  }}
                                >
                                  {pickerInsertYear}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerInsertYear((y) => y + 1);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.1rem",
                                    color: theme.textSec,
                                  }}
                                >
                                  ❯
                                </button>
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: "8px",
                                }}
                              >
                                {t.months.map(
                                  (monthName: string, index: number) => {
                                    const isSelected =
                                      pickerInsertMonth === index + 1 &&
                                      pickerInsertYear ===
                                        parseInt(
                                          dataTransacao.split("-")[0],
                                          10,
                                        );
                                    return (
                                      <button
                                        type="button"
                                        key={index}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPickerInsertMonth(index + 1);
                                          setPickerInsertMode("day");
                                        }}
                                        style={{
                                          padding: "10px 0",
                                          border: "none",
                                          borderRadius: "10px",
                                          backgroundColor: isSelected
                                            ? "#d91616"
                                            : theme.inputBg,
                                          color: isSelected
                                            ? "#fff"
                                            : theme.textSec,
                                          fontWeight: isSelected
                                            ? "bold"
                                            : "500",
                                          cursor: "pointer",
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        {monthName.slice(0, 3)}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "12px",
                                  padding: "0 4px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPickerInsertMode("month");
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    color: theme.textSec,
                                    fontWeight: "bold",
                                  }}
                                >
                                  ❮ {t.back || "Voltar"}
                                </button>
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    color: theme.textMain,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {t.months[pickerInsertMonth - 1]}{" "}
                                  {pickerInsertYear}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(7, 1fr)",
                                  gap: "4px",
                                }}
                              >
                                {Array.from(
                                  {
                                    length: new Date(
                                      pickerInsertYear,
                                      pickerInsertMonth,
                                      0,
                                    ).getDate(),
                                  },
                                  (_, i) => i + 1,
                                ).map((dia) => {
                                  const dataFormatadaStr = `${pickerInsertYear}-${String(pickerInsertMonth).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                                  const isSelected =
                                    dataTransacao === dataFormatadaStr;
                                  return (
                                    <button
                                      type="button"
                                      key={dia}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDataTransacao(dataFormatadaStr);
                                        setIsDataPickerOpen(false);
                                      }}
                                      style={{
                                        padding: "8px 0",
                                        borderRadius: "8px",
                                        border: "none",
                                        cursor: "pointer",
                                        backgroundColor: isSelected
                                          ? "#d91616"
                                          : theme.inputBg,
                                        color: isSelected
                                          ? "#fff"
                                          : theme.textSec,
                                        fontWeight: isSelected ? "bold" : "500",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {dia}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "0.75rem",
                          color: theme.textMuted,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          textAlign: isMobile ? "left" : "right",
                        }}
                      >
                        {t.valueLabel || "Valor"}
                      </p>
                      <input
                        type="text"
                        required
                        value={novoValor}
                        onChange={handleValorChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.inputBg,
                          color: theme.textMain,
                          outline: "none",
                          textAlign: isMobile ? "left" : "right",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                          fontWeight: "600",
                          transition: "border-color 0.2s",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "12px 20px",
                    backgroundColor: "#d91616",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    alignSelf: isMobile ? "stretch" : "center",
                    minWidth: isMobile ? "auto" : "200px",
                    boxShadow: "0 4px 12px rgba(217, 22, 22, 0.2)",
                  }}
                >
                  {t.btnRegister}
                </button>
              </form>
            </div>

            {/* Histórico Filtrado na Home - AGRUPADO POR DIA */}
            <div
              style={{
                marginTop: "1.5rem",
                backgroundColor: theme.bgCard,
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                transition: "background-color 0.3s ease",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: theme.textMain,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                {t.history}
              </h3>

              {agruparTransacoesPorDia(
                transacoes.filter(
                  (t_row) => t_row.type === tipoTransacaoSelecionado,
                ),
              ).map(([dataGrupo, itensDoGrupo]) => (
                <div key={dataGrupo} style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.85rem",
                      color: theme.textMain,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      borderBottom: `1px solid ${theme.border}`,
                      paddingBottom: "5px",
                    }}
                  >
                    {dataGrupo}
                  </h4>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {itensDoGrupo.map((t_row, i) => {
                        const isExpense = t_row.type === "EXPENSE";
                        const infoExibicao = getValorExibicao(
                          Math.abs(t_row.amount || 0),
                        );
                        const categoriaVisual =
                          categoryMap[t_row.category || "OTHER"] ||
                          categoryMap["OTHER"];
                        const isOutros =
                          !t_row.category || t_row.category === "OTHER";
                        const corDeFundoIcone = isOutros
                          ? isExpense
                            ? isDarkMode
                              ? "#4a1c1c"
                              : "#ffebee"
                            : isDarkMode
                              ? "#1b3320"
                              : "#e8f5e9"
                          : categoriaVisual.bgColor;

                        return (
                          <tr
                            key={t_row.id || i}
                            style={{
                              borderBottom: `1px solid ${theme.border}`,
                            }}
                          >
                            <td
                              style={{
                                padding: "14px 0",
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  backgroundColor: corDeFundoIcone,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: "1.2rem",
                                }}
                                title={categoriaVisual[idioma]}
                              >
                                {categoriaVisual.emoji}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "500",
                                    color: theme.textMain,
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {t_row.description}
                                </div>
                                <div
                                  style={{
                                    color: theme.textMuted,
                                    fontSize: "0.75rem",
                                    marginTop: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: isExpense
                                        ? theme.red
                                        : theme.green,
                                      fontWeight: "bold",
                                      marginRight: "6px",
                                    }}
                                  >
                                    {categoriaVisual[idioma]}
                                  </span>
                                  {t_row.card ? (
                                    <span
                                      style={{
                                        color:
                                          t_row.card.color ||
                                          t_row.card.cor ||
                                          theme.textMuted,
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 💳 {t_row.card.name || t_row.card.nome}
                                    </span>
                                  ) : t_row.paymentMethod === "PIX" ? (
                                    <span
                                      style={{
                                        color: "#32bcad",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • ⚡ Pix
                                    </span>
                                  ) : t_row.paymentMethod === "BALANCE" ? (
                                    <span
                                      style={{
                                        color: "#827717",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 💰 {t.balanceOption || "Saldo em Conta"}
                                    </span>
                                  ) : t_row.paymentMethod === "ACCOUNT" ? (
                                    <span
                                      style={{
                                        color: "#0277bd",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 🏦 {t.transferLabel || "Transferência"}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        color: theme.textMuted,
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 🏦 {t.transferLabel || "Transferência"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td
                              style={{ padding: "14px 0", textAlign: "right" }}
                            >
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: isExpense ? theme.red : theme.green,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {isExpense ? "- " : "+ "} {infoExibicao.simbolo}{" "}
                                {infoExibicao.valorFormatado}
                              </div>
                            </td>
                            <td style={{ width: "40px", textAlign: "right" }}>
                              <button
                                onClick={() =>
                                  handleDeleteTransaction(t_row.id)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: theme.textMuted,
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                }}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              {transacoes.filter(
                (t_row) => t_row.type === tipoTransacaoSelecionado,
              ).length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: theme.textMuted,
                    fontSize: "0.9rem",
                    marginTop: "20px",
                  }}
                >
                  {t.noTransactions}
                </p>
              )}
            </div>
          </>
        )}

        {/* ================= ABA 2: EXTRATO DETALHADO (ACCORDION CARDS) ================= */}
        {abaAtiva === "statement" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Header com as 3 caixas de resumo (Entrada, Saída, Balanço) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  borderBottom: `4px solid ${theme.green}`,
                  transition: "background-color 0.3s ease",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: theme.textMuted,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {t.entries}
                </p>
                <h3
                  style={{
                    margin: "10px 0 0 0",
                    color: theme.textMain,
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: theme.green,
                      marginRight: "4px",
                    }}
                  >
                    {getValorExibicao(totalEntradasMes).simbolo}
                  </span>
                  {getValorExibicao(totalEntradasMes).valorFormatado}
                </h3>
              </div>
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  borderBottom: `4px solid ${theme.red}`,
                  transition: "background-color 0.3s ease",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: theme.textMuted,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {t.exits}
                </p>
                <h3
                  style={{
                    margin: "10px 0 0 0",
                    color: theme.textMain,
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: theme.red,
                      marginRight: "4px",
                    }}
                  >
                    {getValorExibicao(totalSaidasMes).simbolo}
                  </span>
                  {getValorExibicao(totalSaidasMes).valorFormatado}
                </h3>
              </div>
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  borderBottom: `4px solid ${saldoMes >= 0 ? theme.green : theme.red}`,
                  transition: "background-color 0.3s ease",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: theme.textMuted,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {t.balanceTotal}
                </p>
                <h3
                  style={{
                    margin: "10px 0 0 0",
                    color: theme.textMain,
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: saldoMes >= 0 ? theme.green : theme.red,
                      marginRight: "4px",
                    }}
                  >
                    {getValorExibicao(saldoMes).simbolo}
                  </span>
                  {getValorExibicao(saldoMes).valorFormatado}
                </h3>
              </div>
            </div>

            {/* Container Principal do Extrato */}
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                transition: "background-color 0.3s ease",
              }}
            >
              {/* Título e Date Picker juntos */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: theme.textMain,
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  {t.periodTransactions}
                </h3>

                {/* Filtro de Data (Mês e Dia) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: theme.inputBg,
                    borderRadius: "12px",
                    padding: "4px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <button
                    onClick={handleMesAnterior}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 12px",
                      fontSize: "1.1rem",
                      color: theme.textSec,
                      borderRadius: "8px",
                    }}
                  >
                    ❮
                  </button>
                  <div ref={monthPickerRef} style={{ position: "relative" }}>
                    <div
                      onClick={() => {
                        if (!isMonthPickerOpen) {
                          setPickerYear(anoFiltro);
                          setPickerMode("month");
                        }
                        setIsMonthPickerOpen(!isMonthPickerOpen);
                      }}
                      style={{
                        minWidth: "150px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: theme.textMain,
                        fontSize: "1rem",
                        userSelect: "none",
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: "8px",
                      }}
                    >
                      {diaFiltro
                        ? `${diaFiltro} ${t.months[mesFiltro - 1].slice(0, 3)} ${anoFiltro}`
                        : `${t.months[mesFiltro - 1]} ${anoFiltro}`}
                    </div>
                    {isMonthPickerOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: theme.bgCard,
                          borderRadius: "16px",
                          boxShadow: theme.shadow,
                          padding: "16px",
                          zIndex: 1005,
                          width: "250px",
                          border: `1px solid ${theme.border}`,
                          marginTop: "8px",
                        }}
                      >
                        {pickerMode === "month" ? (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                                padding: "0 4px",
                              }}
                            >
                              <button
                                onClick={() => setPickerYear((y) => y - 1)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                  color: theme.textSec,
                                }}
                              >
                                ❮
                              </button>
                              <span
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "1.1rem",
                                  color: theme.textMain,
                                }}
                              >
                                {pickerYear}
                              </span>
                              <button
                                onClick={() => setPickerYear((y) => y + 1)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.1rem",
                                  color: theme.textSec,
                                }}
                              >
                                ❯
                              </button>
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "8px",
                              }}
                            >
                              {t.months.map(
                                (monthName: string, index: number) => {
                                  const isSelected =
                                    mesFiltro === index + 1 &&
                                    anoFiltro === pickerYear;
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => {
                                        setMesFiltro(index + 1);
                                        setAnoFiltro(pickerYear);
                                        setPickerMode("day"); // Muda a tela para escolher o dia
                                      }}
                                      style={{
                                        padding: "10px 0",
                                        border: "none",
                                        borderRadius: "10px",
                                        backgroundColor: isSelected
                                          ? "#d91616"
                                          : theme.inputBg,
                                        color: isSelected
                                          ? "#fff"
                                          : theme.textSec,
                                        fontWeight: isSelected ? "bold" : "500",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      {monthName.slice(0, 3)}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                padding: "0 4px",
                              }}
                            >
                              <button
                                onClick={() => setPickerMode("month")}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "0.9rem",
                                  color: theme.textSec,
                                  fontWeight: "bold",
                                }}
                              >
                                ❮ {t.back || "Voltar"}
                              </button>
                              <span
                                style={{
                                  fontWeight: "bold",
                                  color: theme.textMain,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {t.months[mesFiltro - 1]} {anoFiltro}
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setDiaFiltro(null);
                                setIsMonthPickerOpen(false);
                              }}
                              style={{
                                width: "100%",
                                padding: "8px",
                                marginBottom: "12px",
                                borderRadius: "8px",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor:
                                  diaFiltro === null
                                    ? "#d91616"
                                    : theme.inputBg,
                                color:
                                  diaFiltro === null ? "#fff" : theme.textSec,
                                fontWeight: diaFiltro === null ? "bold" : "500",
                                fontSize: "0.9rem",
                              }}
                            >
                              {t.entireMonth || "Mês Inteiro"}
                            </button>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                                gap: "4px",
                              }}
                            >
                              {Array.from(
                                {
                                  length: new Date(
                                    anoFiltro,
                                    mesFiltro,
                                    0,
                                  ).getDate(),
                                },
                                (_, i) => i + 1,
                              ).map((dia) => (
                                <button
                                  key={dia}
                                  onClick={() => {
                                    setDiaFiltro(dia);
                                    setIsMonthPickerOpen(false);
                                  }}
                                  style={{
                                    padding: "8px 0",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    backgroundColor:
                                      diaFiltro === dia
                                        ? "#d91616"
                                        : theme.inputBg,
                                    color:
                                      diaFiltro === dia
                                        ? "#fff"
                                        : theme.textSec,
                                    fontWeight:
                                      diaFiltro === dia ? "bold" : "500",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {dia}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleMesSeguinte}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 12px",
                      fontSize: "1.1rem",
                      color: theme.textSec,
                      borderRadius: "8px",
                    }}
                  >
                    ❯
                  </button>
                </div>
              </div>

              {/* LISTA DE CARDS ACORDEÃO */}
              {statementGroups.map((group) => {
                const isExpanded = expandedStatementGroup === group.id;
                const currentFilter = statementInnerFilter[group.id] || "ALL";

                // Filtro interno para Pix e Transferência
                const filteredGroupTxs = group.transactions.filter((tx) => {
                  if (currentFilter === "ALL") return true;
                  return tx.type === currentFilter;
                });

                // Reutilizamos a função para agrupar as transações desse card específico por dias
                const diasAgrupados = agruparTransacoesPorDia(filteredGroupTxs);

                return (
                  <div key={group.id} style={{ marginBottom: "1rem" }}>
                    {/* O Card Clicável (Cabeçalho do Acordeão) */}
                    <div
                      onClick={() =>
                        setExpandedStatementGroup(isExpanded ? null : group.id)
                      }
                      style={{
                        backgroundColor: group.bgColor,
                        color: group.color,
                        padding: "1.2rem 1.5rem",
                        borderRadius: isExpanded ? "16px 16px 0 0" : "16px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        transition: "all 0.3s",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <span style={{ fontSize: "1.8rem" }}>{group.icon}</span>
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.1rem",
                              fontWeight: "600",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {group.title}
                          </h3>
                          {group.subtitle && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "0.8rem",
                                opacity: 0.8,
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              {group.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <span
                          style={{ fontSize: "0.9rem", fontWeight: "bold" }}
                        >
                          {group.transactions.length} {t.transactionsCount}
                        </span>
                        <span
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.3s",
                            fontSize: "0.8rem",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo Expandido (As transações do Cartão/Pix/Conta) */}
                    {isExpanded && (
                      <div
                        style={{
                          backgroundColor: theme.bgCard,
                          padding: "1.5rem",
                          borderRadius: "0 0 16px 16px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                          border: `1px solid ${theme.border}`,
                          borderTop: "none",
                          marginTop: "-5px",
                          paddingTop: "20px", // compensa a margem negativa
                        }}
                      >
                        {/* Botões de Filtro Interno (Só não exibe se for cartão ou saldo em conta) */}
                        {!group.isCard && group.id !== "balance" && (
                          <div
                            style={{
                              display: "flex",
                              gap: "5px",
                              marginBottom: "20px",
                              backgroundColor: theme.inputBg,
                              padding: "4px",
                              borderRadius: "10px",
                              width: "fit-content",
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <button
                              onClick={() =>
                                setStatementInnerFilter((p) => ({
                                  ...p,
                                  [group.id]: "ALL",
                                }))
                              }
                              style={{
                                background:
                                  currentFilter === "ALL"
                                    ? theme.highlightBg
                                    : "transparent",
                                border: "none",
                                padding: "6px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color: theme.textMain,
                              }}
                            >
                              {t.all || "Todos"}
                            </button>
                            <button
                              onClick={() =>
                                setStatementInnerFilter((p) => ({
                                  ...p,
                                  [group.id]: "INCOME",
                                }))
                              }
                              style={{
                                background:
                                  currentFilter === "INCOME"
                                    ? theme.highlightBg
                                    : "transparent",
                                border: "none",
                                padding: "6px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color:
                                  currentFilter === "INCOME"
                                    ? theme.green
                                    : theme.textMain,
                              }}
                            >
                              {t.received || "Recebidos"}
                            </button>
                            <button
                              onClick={() =>
                                setStatementInnerFilter((p) => ({
                                  ...p,
                                  [group.id]: "EXPENSE",
                                }))
                              }
                              style={{
                                background:
                                  currentFilter === "EXPENSE"
                                    ? theme.highlightBg
                                    : "transparent",
                                border: "none",
                                padding: "6px 15px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color:
                                  currentFilter === "EXPENSE"
                                    ? theme.red
                                    : theme.textMain,
                              }}
                            >
                              {t.sent || "Enviados"}
                            </button>
                          </div>
                        )}

                        {/* Lista de Transações daquele Método (Agrupada por Dias) */}
                        {diasAgrupados.length === 0 ? (
                          <p
                            style={{
                              textAlign: "center",
                              color: theme.textMuted,
                              fontSize: "0.9rem",
                            }}
                          >
                            {t.noTransactions}
                          </p>
                        ) : (
                          diasAgrupados.map(([dataGrupo, itensDoGrupo]) => (
                            <div
                              key={dataGrupo}
                              style={{ marginBottom: "1.5rem" }}
                            >
                              <h4
                                style={{
                                  margin: "0 0 10px 0",
                                  fontSize: "0.85rem",
                                  color: theme.textMain,
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                  borderBottom: `1px solid ${theme.border}`,
                                  paddingBottom: "5px",
                                }}
                              >
                                {dataGrupo}
                              </h4>
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                }}
                              >
                                <tbody>
                                  {itensDoGrupo.map((t_row, i) => {
                                    const isExpense = t_row.type === "EXPENSE";
                                    const infoExibicao = getValorExibicao(
                                      Math.abs(t_row.amount || 0),
                                    );
                                    const categoriaVisual =
                                      categoryMap[t_row.category || "OTHER"] ||
                                      categoryMap["OTHER"];
                                    const isOutros =
                                      !t_row.category ||
                                      t_row.category === "OTHER";
                                    const corDeFundoIcone = isOutros
                                      ? isExpense
                                        ? isDarkMode
                                          ? "#4a1c1c"
                                          : "#ffebee"
                                        : isDarkMode
                                          ? "#1b3320"
                                          : "#e8f5e9"
                                      : categoriaVisual.bgColor;

                                    return (
                                      <tr
                                        key={t_row.id || i}
                                        style={{
                                          borderBottom: `1px solid ${theme.border}`,
                                        }}
                                      >
                                        <td
                                          style={{
                                            padding: "14px 0",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "15px",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: "40px",
                                              height: "40px",
                                              borderRadius: "10px",
                                              backgroundColor: corDeFundoIcone,
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              fontSize: "1.2rem",
                                            }}
                                            title={categoriaVisual[idioma]}
                                          >
                                            {categoriaVisual.emoji}
                                          </div>
                                          <div>
                                            <div
                                              style={{
                                                fontWeight: "500",
                                                color: theme.textMain,
                                                fontSize: "0.95rem",
                                              }}
                                            >
                                              {t_row.description}
                                            </div>
                                            <div
                                              style={{
                                                color: theme.textMuted,
                                                fontSize: "0.75rem",
                                                marginTop: "4px",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  color: isExpense
                                                    ? theme.red
                                                    : theme.green,
                                                  fontWeight: "bold",
                                                  marginRight: "6px",
                                                }}
                                              >
                                                {categoriaVisual[idioma]}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            padding: "14px 0",
                                            textAlign: "right",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontWeight: "600",
                                              color: isExpense
                                                ? theme.red
                                                : theme.green,
                                              fontSize: "0.95rem",
                                            }}
                                          >
                                            {isExpense ? "- " : "+ "}{" "}
                                            {infoExibicao.simbolo}{" "}
                                            {infoExibicao.valorFormatado}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            width: "40px",
                                            textAlign: "right",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              handleDeleteTransaction(t_row.id)
                                            }
                                            style={{
                                              background: "none",
                                              border: "none",
                                              color: theme.textMuted,
                                              cursor: "pointer",
                                              fontSize: "1.2rem",
                                            }}
                                          >
                                            ×
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ABA 3: MEUS CARTÕES ================= */}
        {abaAtiva === "cards" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "1.5rem 2rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                maxWidth: "750px",
                transition: "background-color 0.3s ease",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{ color: theme.textMain, margin: 0, fontSize: "1.3rem" }}
              >
                💳 {t.cards}
              </h2>
              <button
                onClick={() => setIsCardModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#d91616",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 10px rgba(217,22,22,0.2)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {t.newCard}
              </button>
            </div>

            {/* Contêiner da Grade de Cartões */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(260px, 280px))",
                gap: "25px",
                width: "100%",
                maxWidth: "750px",
                justifyContent: "center",
              }}
            >
              {cartoes.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: theme.textMuted,
                    gridColumn: "1 / -1",
                    padding: "2rem",
                  }}
                >
                  Nenhum cartão cadastrado ainda.
                </p>
              )}
              {cartoes.map((cartao) => {
                const percUsado =
                  cartao.totalLimit > 0
                    ? ((cartao.currentInvoice || 0) / cartao.totalLimit) * 100
                    : 0;

                return (
                  <div
                    key={cartao.id}
                    style={{
                      backgroundColor: cartao.cor || cartao.color || "#333",
                      color: "white",
                      padding: "1.2rem",
                      borderRadius: "14px",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      aspectRatio: "1.58 / 1",
                      width: "100%",
                      margin: "0 auto",
                      boxSizing: "border-box",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 25px rgba(0,0,0,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 15px rgba(0,0,0,0.3)";
                    }}
                  >
                    {/* Efeito de brilho de fundo */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-40%",
                        right: "-15%",
                        width: "130px",
                        height: "130px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: "50%",
                        transform: "rotate(25deg)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Botão Fechar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCartao(cartao.id);
                      }}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(0,0,0,0.2)",
                        border: "none",
                        color: "white",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        fontSize: "1rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "rgba(0,0,0,0.2)")
                      }
                      title="Excluir Cartão"
                    >
                      ×
                    </button>

                    {/* Topo: Nome e Bandeira */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: "bold",
                          letterSpacing: "1px",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "160px",
                        }}
                      >
                        {cartao.nome || cartao.name}
                      </span>
                      <div
                        style={{
                          marginRight: "22px",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {renderBandeira(cartao)}
                      </div>
                    </div>

                    {/* Chip */}
                    <div style={{ marginTop: "10px", zIndex: 1 }}>
                      <ChipSVG />
                    </div>

                    {/* Número do Cartão */}
                    <div
                      style={{
                        zIndex: 1,
                        marginTop: isMobile ? "6px" : "10px",
                        flexGrow: 1,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: isMobile ? "1.05rem" : "1.15rem", // Fonte levemente menor
                          letterSpacing: isMobile ? "1.5px" : "2px", // Espaçamento mais enxuto
                          fontFamily: "monospace",
                          textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                          whiteSpace: "nowrap", // A MÁGICA: proíbe de pular para a linha de baixo!
                        }}
                      >
                        **** **** **** {cartao.lastDigits}
                      </p>
                    </div>

                    {/* Rodapé: Fatura, Limite e Barra de Uso */}
                    <div style={{ zIndex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          marginBottom: "6px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.6rem",
                              opacity: 0.8,
                              textTransform: "uppercase",
                            }}
                          >
                            {t.currentInvoice}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                            }}
                          >
                            R${" "}
                            {(cartao.currentInvoice || 0).toLocaleString(
                              "pt-BR",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.6rem",
                              opacity: 0.8,
                              textTransform: "uppercase",
                            }}
                          >
                            {t.availableLimit}
                          </p>
                          <p
                            style={{ margin: "2px 0 0 0", fontSize: "0.85rem" }}
                          >
                            R${" "}
                            {(
                              cartao.totalLimit - (cartao.currentInvoice || 0)
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Progresso de Uso */}
                      <div
                        style={{
                          width: "100%",
                          height: "3px",
                          backgroundColor: "rgba(255,255,255,0.3)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(percUsado, 100)}%`,
                            backgroundColor:
                              percUsado > 90 ? "#ff4d4d" : "#fff",
                            transition: "width 0.5s ease-in-out",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= ABA 4: CONFIGURAÇÕES ================= */}
        {abaAtiva === "settings" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "1.5rem 2rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background-color 0.3s ease",
              }}
            >
              <h2
                style={{ color: theme.textMain, margin: 0, fontSize: "1.3rem" }}
              >
                ⚙️ {t.settings}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem",
              }}
            >
              {/* CARTÃO 1: PERFIL */}
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  transition: "background-color 0.3s ease",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: theme.textMain,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  👤 {t.profileTitle || "Meu Perfil"}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      {t.fullNameLabel || "Nome Completo"}
                    </label>
                    <input
                      type="text"
                      value={perfilUsuario.fullName || nomeUsuario}
                      disabled
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textSec,
                        fontSize: "0.95rem",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      {t.emailLabel || "E-mail"}
                    </label>
                    <input
                      type="text"
                      value={perfilUsuario.email || "---"}
                      disabled
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textSec,
                        fontSize: "0.95rem",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      {t.phoneLabel || "Telefone"}
                    </label>
                    <input
                      type="text"
                      value={perfilUsuario.phone || "---"}
                      disabled
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textSec,
                        fontSize: "0.95rem",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    margin: "15px 0 0 0",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                  }}
                >
                  {t.profileDesc ||
                    "Dados pessoais vinculados ao seu cadastro. Para alterações, entre em contato com o suporte."}
                </p>
              </div>

              {/* CARTÃO 2: IDIOMA */}
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  transition: "background-color 0.3s ease",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: theme.textMain,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🌐 {t.languageTitle || "Idioma"}
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {idiomasOrdenados.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setIdioma(lang)}
                      style={{
                        background:
                          idioma === lang ? theme.highlightBg : theme.inputBg,
                        border: `1px solid ${
                          idioma === lang ? theme.red : theme.border
                        }`,
                        padding: "10px 15px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.9rem",
                        color: theme.textMain,
                        fontWeight: idioma === lang ? "bold" : "normal",
                        transition: "all 0.2s",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>
                        {translations[lang].flag}
                      </span>{" "}
                      {t.langs[lang]}
                    </button>
                  ))}
                </div>
                <p
                  style={{
                    margin: "15px 0 0 0",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                  }}
                >
                  {t.languageDesc || "Altera o idioma de toda a aplicação."}
                </p>
              </div>

              {/* CARTÃO 3: APARÊNCIA */}
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  transition: "background-color 0.3s ease",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: theme.textMain,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🌗 {t.appearanceTitle || "Aparência"}
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        color: theme.textMain,
                        fontSize: "0.95rem",
                      }}
                    >
                      {t.darkModeLabel || "Modo Escuro (Dark Mode)"}
                    </strong>
                    <span
                      style={{ fontSize: "0.8rem", color: theme.textMuted }}
                    >
                      {t.darkModeDesc || "Altera o tema visual do aplicativo."}
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      const newMode = !isDarkMode;
                      setIsDarkMode(newMode);
                      localStorage.setItem("theme", newMode ? "dark" : "light");
                    }}
                    style={{
                      width: "50px",
                      height: "26px",
                      backgroundColor: isDarkMode ? "#d91616" : "#ccc",
                      borderRadius: "30px",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "2px",
                        left: isDarkMode ? "26px" : "2px",
                        transition: "left 0.3s",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CARTÃO 4: SEGURANÇA */}
              <div
                style={{
                  backgroundColor: theme.bgCard,
                  padding: "2rem",
                  borderRadius: "16px",
                  boxShadow: theme.shadow,
                  transition: "background-color 0.3s ease",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: theme.textMain,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🔒 {t.securityTitle || "Segurança"}
                </h3>
                <form
                  onSubmit={handleMudarSenha}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        color: theme.textMuted,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      {t.currentPassword || "Senha Atual"}
                    </label>
                    <input
                      type="password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textMain,
                        outline: "none",
                        fontSize: "0.95rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.8rem",
                          color: theme.textMuted,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                        }}
                      >
                        {t.newPassword || "Nova Senha"}
                      </label>
                      <input
                        type="password"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.inputBg,
                          color: theme.textMain,
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
                          fontSize: "0.8rem",
                          color: theme.textMuted,
                          fontWeight: "600",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                        }}
                      >
                        {t.confirmNewPassword || "Confirmar Nova Senha"}
                      </label>
                      <input
                        type="password"
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: `1px solid ${theme.border}`,
                          backgroundColor: theme.inputBg,
                          color: theme.textMain,
                          outline: "none",
                          fontSize: "0.95rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: "10px",
                      alignSelf: isMobile ? "stretch" : "flex-end",
                      padding: "10px 24px",
                      backgroundColor: "#d91616",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(217,22,22,0.2)",
                    }}
                  >
                    {t.updatePassword || "Atualizar Senha"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NOVO CARTÃO */}
      {isCardModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: theme.bgCard,
              padding: "2rem",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "450px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: theme.textMain,
                fontSize: "1.2rem",
              }}
            >
              {t.modalCardTitle}
            </h3>

            {/* PRESETS DE CARTÕES */}
            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "0.85rem",
                  color: theme.textMuted,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {t.chooseModel}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {PRESET_CARDS.map((preset) => {
                  const isSelected =
                    novoCartaoNome === preset.name &&
                    novoCartaoCor === preset.color;
                  const displayName =
                    preset.name === "Personalizado" ? t.custom : preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNovoCartaoNome(
                          preset.name === "Personalizado" ? "" : preset.name,
                        );
                        setNovoCartaoCor(preset.color);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: `1px solid ${isSelected ? preset.color : theme.border}`,
                        backgroundColor: isSelected
                          ? `${preset.color}20`
                          : theme.inputBg,
                        color: isSelected ? preset.color : theme.textSec,
                        fontWeight: isSelected ? "bold" : "500",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleAddCartao}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  {t.cardName}
                </label>
                <input
                  value={novoCartaoNome}
                  onChange={(e) => setNovoCartaoNome(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.inputBg,
                    color: theme.textMain,
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: theme.textMuted,
                      fontWeight: "600",
                      marginBottom: "5px",
                    }}
                  >
                    {t.cardEndingModal}
                  </label>
                  <input
                    maxLength={4}
                    value={novoCartaoFinal}
                    onChange={(e) =>
                      setNovoCartaoFinal(e.target.value.replace(/\D/g, ""))
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textMain,
                      fontSize: "0.95rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: theme.textMuted,
                      fontWeight: "600",
                      marginBottom: "5px",
                    }}
                  >
                    {t.totalLimit}
                  </label>
                  <input
                    value={novoCartaoLimite}
                    onChange={(e) => setNovoCartaoLimite(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textMain,
                      fontSize: "0.95rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  {t.cardColor}
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    backgroundColor: theme.inputBg,
                    padding: "10px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {[
                    "#8A05BE", // Nubank
                    "#EC7000", // Itaú
                    "#CC092F", // Bradesco
                    "#EC0000", // Santander
                    "#F9D308", // BB
                    "#005CA9", // Caixa
                    "#FF7A00", // Inter
                    "#242424", // C6
                    "#000000", // XP
                    "#107c10", // Verde genérico
                    "#E53935", // Vermelho genérico
                  ].map((cor) => (
                    <div
                      key={cor}
                      onClick={() => setNovoCartaoCor(cor)}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: cor,
                        cursor: "pointer",
                        border:
                          novoCartaoCor === cor
                            ? "3px solid #ccc"
                            : "2px solid transparent",
                        transform:
                          novoCartaoCor === cor ? "scale(1.1)" : "none",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  style={{
                    padding: "10px 15px",
                    border: "none",
                    background: "transparent",
                    color: theme.textMuted,
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#d91616",
                    color: "white",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 10px rgba(217,22,22,0.2)",
                  }}
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DICIONÁRIOS E MAPEAMENTOS
// ==========================================

const translations = {
  pt: {
    flag: "🇧🇷",
    langs: {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês",
      de: "Alemão",
    },
    title: "GlobalWallet",
    subtitle: "Seu controle financeiro",
    home: "Início",
    statement: "Extrato Detalhado",
    cards: "Meus Cartões",
    settings: "Configurações",
    welcome: "Olá",
    logout: "Sair",
    balance: "Saldo Disponível",
    newTransaction: "Registrar Nova Transação",
    income: "Entrada",
    expense: "Saída",
    btnRegister: "Registrar",
    history: "Últimas Transações",
    noTransactions: "Nenhuma transação.",
    confirmDelete: "Excluir transação?",
    errorValue: "Valor inválido.",
    selCategory: "Categoria",
    entries: "Entradas",
    exits: "Saídas",
    balanceTotal: "Balanço",
    periodTransactions: "Transações do Período",
    noTransactionsMonth: "Nenhuma transação encontrada neste mês.",
    newCard: "+ Novo Cartão",
    currentInvoice: "Fatura Atual",
    availableLimit: "Limite Disp.",
    cardEnding: "Final",
    modalCardTitle: "Adicionar Novo Cartão",
    cardColor: "Cor do Cartão",
    cancel: "Cancelar",
    save: "Salvar",
    accountBalance: "Saldo em Conta",
    balanceOption: "Saldo em Conta",
    descriptionLabel: "Descrição",
    valueLabel: "Valor",
    dateLabel: "Data",
    entireMonth: "Mês Inteiro",
    back: "Voltar",
    paymentHistoryLabel: "Forma de Pagamento",
    receiptMethodLabel: "Forma de Recebimento",
    transferLabel: "Transferência",
    profileTitle: "Meu Perfil",
    fullNameLabel: "Nome Completo",
    emailLabel: "E-mail",
    phoneLabel: "Telefone",
    profileDesc:
      "Dados pessoais vinculados ao seu cadastro. Para alterações, entre em contato com o suporte.",
    appearanceTitle: "Aparência",
    darkModeLabel: "Modo Escuro (Dark Mode)",
    darkModeDesc: "Altera o tema visual do aplicativo.",
    securityTitle: "Segurança",
    currentPassword: "Senha Atual",
    newPassword: "Nova Senha",
    confirmNewPassword: "Confirmar Nova Senha",
    updatePassword: "Atualizar Senha",
    errorSamePassword: "A nova senha deve ser diferente da atual.",
    errorMismatch: "As novas senhas não coincidem.",
    errorShortPassword: "A senha deve ter no mínimo 6 caracteres.",
    successPasswordUpdate: "Senha atualizada com sucesso!",
    errorPasswordUpdate:
      "Erro ao trocar senha. Verifique se a senha atual está correta.",
    languageTitle: "Idioma",
    languageDesc: "Altera o idioma de toda a aplicação.",
    all: "Todos",
    received: "Recebidos",
    sent: "Enviados",
    transactionsCount: "transações",
    chooseModel: "Escolha um modelo",
    custom: "Personalizado",
    cardName: "Nome do Cartão",
    cardEndingModal: "Final (4 dígitos)",
    totalLimit: "Limite Total",
    months: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
  },
  en: {
    flag: "🇺🇸",
    langs: {
      pt: "Portuguese",
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
    },
    title: "GlobalWallet",
    subtitle: "Your financial control",
    home: "Home",
    statement: "Statement",
    cards: "My Cards",
    settings: "Settings",
    welcome: "Hello",
    logout: "Logout",
    balance: "Available Balance",
    newTransaction: "New Transaction",
    income: "Income",
    expense: "Expense",
    btnRegister: "Register",
    history: "Recent Transactions",
    noTransactions: "No transactions yet.",
    confirmDelete: "Delete transaction?",
    errorValue: "Invalid value.",
    selCategory: "Category",
    entries: "Incomes",
    exits: "Expenses",
    balanceTotal: "Balance",
    periodTransactions: "Period Transactions",
    noTransactionsMonth: "No transactions found this month.",
    newCard: "+ New Card",
    currentInvoice: "Current Invoice",
    availableLimit: "Avail. Limit",
    cardEnding: "Ending",
    modalCardTitle: "Add New Card",
    cardColor: "Card Color",
    cancel: "Cancel",
    save: "Save",
    accountBalance: "Account Balance",
    balanceOption: "Account Balance",
    descriptionLabel: "Description",
    valueLabel: "Value",
    dateLabel: "Date",
    entireMonth: "Entire Month",
    back: "Back",
    paymentHistoryLabel: "Payment Method",
    receiptMethodLabel: "Receipt Method",
    transferLabel: "Bank Transfer",
    profileTitle: "My Profile",
    fullNameLabel: "Full Name",
    emailLabel: "E-mail",
    phoneLabel: "Phone",
    profileDesc:
      "Personal data linked to your account. For modifications, please contact support.",
    appearanceTitle: "Appearance",
    darkModeLabel: "Dark Mode",
    darkModeDesc: "Changes the visual theme of the application.",
    securityTitle: "Security",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    errorSamePassword:
      "The new password must be different from the current one.",
    errorMismatch: "The new passwords do not match.",
    errorShortPassword: "The password must be at least 6 characters long.",
    successPasswordUpdate: "Password updated successfully!",
    errorPasswordUpdate:
      "Error changing password. Please check if your current password is correct.",
    languageTitle: "Language",
    languageDesc: "Change the application language.",
    all: "All",
    received: "Received",
    sent: "Sent",
    transactionsCount: "transactions",
    chooseModel: "Choose a preset",
    custom: "Custom",
    cardName: "Card Name",
    cardEndingModal: "Ending (4 digits)",
    totalLimit: "Total Limit",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  es: {
    flag: "🇪🇸",
    langs: {
      pt: "Portugués",
      en: "Inglés",
      es: "Español",
      fr: "Francés",
      de: "Alemán",
    },
    title: "GlobalWallet",
    subtitle: "Tu control financiero",
    home: "Inicio",
    statement: "Estado",
    cards: "Mis Tarjetas",
    settings: "Ajustes",
    welcome: "Hola",
    logout: "Salir",
    balance: "Saldo Disponible",
    newTransaction: "Nueva Transacción",
    income: "Ingreso",
    expense: "Gasto",
    btnRegister: "Registrar",
    history: "Últimas Transações",
    noTransactions: "Aún no hay transacciones.",
    confirmDelete: "¿Eliminar?",
    errorValue: "Valor inválido.",
    selCategory: "Categoría",
    entries: "Ingresos",
    exits: "Gastos",
    balanceTotal: "Balance",
    periodTransactions: "Transacciones del Período",
    noTransactionsMonth: "No se encontraron transacciones este mes.",
    newCard: "+ Nueva Tarjeta",
    currentInvoice: "Factura Actual",
    availableLimit: "Límite Disp.",
    cardEnding: "Termina en",
    modalCardTitle: "Agregar Nueva Tarjeta",
    cardColor: "Color de Tarjeta",
    cancel: "Cancelar",
    save: "Guardar",
    accountBalance: "Saldo en Cuenta",
    balanceOption: "Saldo en Cuenta",
    descriptionLabel: "Descripción",
    valueLabel: "Valor",
    dateLabel: "Fecha",
    entireMonth: "Mes Entero",
    back: "Atrás",
    paymentHistoryLabel: "Método de Pago",
    receiptMethodLabel: "Forma de Cobro",
    transferLabel: "Transferencia",
    profileTitle: "Mi Perfil",
    fullNameLabel: "Nombre Completo",
    emailLabel: "Correo",
    phoneLabel: "Teléfono",
    profileDesc:
      "Datos personales vinculados a tu cuenta. Para modificaciones, contacta soporte.",
    appearanceTitle: "Apariencia",
    darkModeLabel: "Modo Oscuro (Dark Mode)",
    darkModeDesc: "Cambia el tema visual de la aplicación.",
    securityTitle: "Seguridad",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar Nueva Contraseña",
    updatePassword: "Actualizar Contraseña",
    errorSamePassword: "La nueva contraseña debe ser diferente a la actual.",
    errorMismatch: "Las nuevas contraseñas no coinciden.",
    errorShortPassword: "La contraseña debe tener al menos 6 caracteres.",
    successPasswordUpdate: "¡Contraseña actualizada con éxito!",
    errorPasswordUpdate:
      "Error al cambiar la contraseña. Verifica si tu contraseña actual es correcta.",
    languageTitle: "Idioma",
    languageDesc: "Cambiar el idioma de la aplicación.",
    all: "Todos",
    received: "Recibidos",
    sent: "Enviados",
    transactionsCount: "transacciones",
    chooseModel: "Elige un modelo",
    custom: "Personalizado",
    cardName: "Nombre de la Tarjeta",
    cardEndingModal: "Termina en (4 dígitos)",
    totalLimit: "Límite Total",
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
  },
  fr: {
    flag: "🇫🇷",
    langs: {
      pt: "Portugais",
      en: "Anglais",
      es: "Espagnol",
      fr: "Français",
      de: "Allemand",
    },
    title: "GlobalWallet",
    subtitle: "Votre contrôle financier",
    home: "Accueil",
    statement: "Relevé",
    cards: "Mes Cartes",
    settings: "Paramètres",
    welcome: "Bonjour",
    logout: "Quitter",
    balance: "Solde Disponible",
    newTransaction: "Nouvelle Transaction",
    income: "Revenu",
    expense: "Dépense",
    btnRegister: "Enregistrer",
    history: "Dernières Transactions",
    noTransactions: "Aucune transaction.",
    confirmDelete: "Supprimer?",
    errorValue: "Valeur invalide.",
    selCategory: "Catégorie",
    entries: "Revenus",
    exits: "Dépenses",
    balanceTotal: "Bilan",
    periodTransactions: "Transactions de la Période",
    noTransactionsMonth: "Aucune transaction trouvée ce mois-ci.",
    newCard: "+ Nouvelle Carte",
    currentInvoice: "Facture Actuelle",
    availableLimit: "Limite Disp.",
    cardEnding: "Se termine par",
    modalCardTitle: "Ajouter une Carte",
    cardColor: "Couleur de la Carte",
    cancel: "Annuler",
    save: "Sauvegarder",
    accountBalance: "Solde du Compte",
    balanceOption: "Solde du Compte",
    descriptionLabel: "Description",
    valueLabel: "Valeur",
    dateLabel: "Date",
    entireMonth: "Mois Entier",
    back: "Retour",
    paymentHistoryLabel: "Méthode de Paiement",
    receiptMethodLabel: "Méthode d'Encaissement",
    transferLabel: "Virement",
    profileTitle: "Mon Profil",
    fullNameLabel: "Nom Complet",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    profileDesc:
      "Données personnelles liées à votre compte. Pour modifier, contactez le support.",
    appearanceTitle: "Apparence",
    darkModeLabel: "Mode Sombre",
    darkModeDesc: "Modifie le thème visuel de l'application.",
    securityTitle: "Sécurité",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    updatePassword: "Mettre à jour le mot de passe",
    errorSamePassword:
      "Le nouveau mot de passe doit être différent de l'actuel.",
    errorMismatch: "Les nouveaux mots de passe ne correspondent pas.",
    errorShortPassword: "Le mot de passe doit comporter au moins 6 caractères.",
    successPasswordUpdate: "Mot de passe mis à jour avec succès !",
    errorPasswordUpdate:
      "Erreur lors du changement. Vérifiez votre mot de passe actuel.",
    languageTitle: "Langue",
    languageDesc: "Changer la langue de l'application.",
    all: "Tous",
    received: "Reçus",
    sent: "Envoyés",
    transactionsCount: "transactions",
    chooseModel: "Choisissez un modèle",
    custom: "Personnalisé",
    cardName: "Nom de la Carte",
    cardEndingModal: "Se termine par (4 chiffres)",
    totalLimit: "Limite Totale",
    months: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembro",
      "Décembre",
    ],
  },
  de: {
    flag: "🇩🇪",
    langs: {
      pt: "Portugiesisch",
      en: "Englisch",
      es: "Spanisch",
      fr: "Französisch",
      de: "Deutsch",
    },
    title: "GlobalWallet",
    subtitle: "Ihre Finanzkontrolle",
    home: "Startseite",
    statement: "Auszug",
    cards: "Meine Karten",
    settings: "Einstellungen",
    welcome: "Hallo",
    logout: "Abmelden",
    balance: "Verfügbares Guthaben",
    newTransaction: "Neue Transaktion",
    income: "Einnahme",
    expense: "Ausgabe",
    btnRegister: "Registrieren",
    history: "Letzte Transaktionen",
    noTransactions: "Noch keine Transaktionen.",
    confirmDelete: "Löschen?",
    errorValue: "Ungültiger Wert.",
    selCategory: "Kategorie",
    entries: "Einnahmen",
    exits: "Ausgaben",
    balanceTotal: "Bilanz",
    periodTransactions: "Transaktionen im Zeitraum",
    noTransactionsMonth: "In diesem Monat wurden keine Transaktionen gefunden.",
    newCard: "+ Neue Karte",
    currentInvoice: "Aktuelle Rechnung",
    availableLimit: "Verf. Limit",
    cardEnding: "Endet com",
    modalCardTitle: "Neue Karte hinzufügen",
    cardColor: "Kartenfarbe",
    cancel: "Abbrechen",
    save: "Speichern",
    accountBalance: "Kontostand",
    balanceOption: "Kontostand",
    descriptionLabel: "Beschreibung",
    valueLabel: "Wert",
    dateLabel: "Datum",
    entireMonth: "Ganzer Monat",
    back: "Zurück",
    paymentHistoryLabel: "Zahlungsmethode",
    receiptMethodLabel: "Empfangsmethode",
    transferLabel: "Überweisung",
    profileTitle: "Mein Profil",
    fullNameLabel: "Vollständiger Name",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    profileDesc:
      "Personenbezogene Daten. Für Änderungen kontaktieren Sie den Support.",
    appearanceTitle: "Erscheinungsbild",
    darkModeLabel: "Dunkler Modus",
    darkModeDesc: "Ändert das visuelle Design der App.",
    securityTitle: "Sicherheit",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    updatePassword: "Passwort aktualisieren",
    errorSamePassword:
      "Das neue Passwort muss sich vom aktuellen unterscheiden.",
    errorMismatch: "Die neuen Passwörter stimmen nicht überein.",
    errorShortPassword: "Das Passwort muss mindestens 6 Zeichen lang sein.",
    successPasswordUpdate: "Passwort erfolgreich aktualisiert!",
    errorPasswordUpdate:
      "Fehler beim Ändern. Überprüfen Sie Ihr aktuelles Passwort.",
    languageTitle: "Sprache",
    languageDesc: "Ändern Sie die Sprache der Anwendung.",
    all: "Alle",
    received: "Erhalten",
    sent: "Gesendet",
    transactionsCount: "Transaktionen",
    chooseModel: "Wählen Sie eine Vorlage",
    custom: "Benutzerdefiniert",
    cardName: "Kartenname",
    cardEndingModal: "Endet mit (4 Ziffern)",
    totalLimit: "Gesamtlimit",
    months: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
  },
};

const categoryMap: Record<
  string,
  {
    pt: string;
    en: string;
    es: string;
    fr: string;
    de: string;
    emoji: string;
    color: string;
    bgColor: string;
  }
> = {
  SALARY: {
    pt: "Salário",
    en: "Salary",
    es: "Salario",
    fr: "Salaire",
    de: "Gehalt",
    emoji: "💰",
    color: "#2e7d32",
    bgColor: "#e8f5e9",
  },
  SALES: {
    pt: "Vendas",
    en: "Sales",
    es: "Ventas",
    fr: "Ventes",
    de: "Verkäufe",
    emoji: "🛍️",
    color: "#0277bd",
    bgColor: "#e3f2fd",
  },
  INVESTMENTS: {
    pt: "Investimentos",
    en: "Investments",
    es: "Inversiones",
    fr: "Investissements",
    de: "Investitionen",
    emoji: "📈",
    color: "#fbc02d",
    bgColor: "#fffde7",
  },
  FOOD: {
    pt: "Alimentação",
    en: "Food",
    es: "Alimentación",
    fr: "Alimentation",
    de: "Essen",
    emoji: "🍔",
    color: "#e65100",
    bgColor: "#fff3e0",
  },
  MARKET: {
    pt: "Mercado",
    en: "Market",
    es: "Mercado",
    fr: "Marché",
    de: "Markt",
    emoji: "🛒",
    color: "#d84315",
    bgColor: "#fbe9e7",
  },
  TRANSPORT: {
    pt: "Transporte",
    en: "Transport",
    es: "Transporte",
    fr: "Transport",
    de: "Transport",
    emoji: "🚌",
    color: "#1565c0",
    bgColor: "#e3f2fd",
  },
  ENTERTAINMENT: {
    pt: "Lazer",
    en: "Entertainment",
    es: "Entretenimiento",
    fr: "Loisirs",
    de: "Freizeit",
    emoji: "🍿",
    color: "#6a1b9a",
    bgColor: "#f3e5f5",
  },
  BILLS: {
    pt: "Contas",
    en: "Bills",
    es: "Cuentas",
    fr: "Factures",
    de: "Rechnungen",
    emoji: "📄",
    color: "#00695c",
    bgColor: "#e0f2f1",
  },
  OTHER: {
    pt: "Outros",
    en: "Other",
    es: "Otros",
    fr: "Autres",
    de: "Andere",
    emoji: "📌",
    color: "#616161",
    bgColor: "#f5f5f5",
  },
};
