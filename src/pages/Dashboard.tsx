import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type IdiomaType = "pt" | "en" | "es" | "fr" | "de" | "it" | "ja" | "zh" | "ko";
type AbaType = "home" | "statement" | "cards" | "settings";

interface Transacao {
  id?: number;
  description?: string;
  amount?: number;
  transactionDate?: string;
  type?: string;
  category?: string;
  card?: Cartao;
  paymentMethod?: string; // NOVO: "PIX", "ACCOUNT" ou "CARD"
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
        if (!isSelected) e.currentTarget.style.backgroundColor = theme.highlightBg;
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
  tipo: "ACCOUNT" | "PIX" | "CARD";
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
        if (!isSelected) e.currentTarget.style.backgroundColor = theme.highlightBg;
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
    (localStorage.getItem("abaAtiva") as AbaType) || "home"
  );

  const [idioma, setIdioma] = useState<IdiomaType>(
    (localStorage.getItem("idioma") as IdiomaType) || "pt"
  );

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [menuAberto, setMenuAberto] = useState(false);
  const [moedaExibicao, setMoedaExibicao] = useState<"BRL" | "USD" | "EUR">("BRL");
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
  const [tipoTransacaoSelecionado, setTipoTransacaoSelecionado] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("OTHER");
  const [menuCategoriaAberto, setMenuCategoriaAberto] = useState(false);
  const menuCategoriaRef = useRef<HTMLDivElement>(null);

  const [formaPagamento, setFormaPagamento] = useState<string>("PIX");
  const [menuCartaoAberto, setMenuCartaoAberto] = useState(false);
  const menuCartaoRef = useRef<HTMLDivElement>(null);

  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState<number>(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState<number>(dataAtual.getFullYear());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(dataAtual.getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

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
      if (menuCategoriaRef.current && !menuCategoriaRef.current.contains(event.target as Node)) {
        setMenuCategoriaAberto(false);
      }
      if (menuCartaoRef.current && !menuCartaoRef.current.contains(event.target as Node)) {
        setMenuCartaoAberto(false);
      }
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  useEffect(() => {
    const categoriasValidas = getCategoriasDisponiveis();
    if (!categoriasValidas.includes(categoriaSelecionada)) {
      setCategoriaSelecionada(
        tipoTransacaoSelecionado === "INCOME" ? "SALARY" : "OTHER"
      );
    }
    
    // Se mudou para entrada, reseta a forma de pagamento para PIX se estiver com cartão selecionado
    if (tipoTransacaoSelecionado === "INCOME") {
      if (formaPagamento !== "ACCOUNT" && formaPagamento !== "PIX") {
        setFormaPagamento("PIX");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTransacaoSelecionado]);

  const handleMudarSenha = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha === senhaAtual) {
      showToast(t.errorSamePassword || "A nova senha deve ser diferente da atual.", "error");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      showToast(t.errorMismatch, "error");
      return;
    }
    if (novaSenha.length < 6) {
      showToast(t.errorShortPassword || "A senha deve ter no mínimo 6 caracteres.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "https://swiss-project-api.onrender.com/api/v1/auth/change-password",
        { currentPassword: senhaAtual, newPassword: novaSenha },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(t.successPasswordUpdate || "Senha atualizada com sucesso!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    } catch (erro) {
      console.error(erro);
      showToast(
        t.errorPasswordUpdate || "Erro ao trocar senha. Verifique se a senha atual está correta.",
        "error"
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
        axios.get("https://swiss-project-api.onrender.com/api/v1/transactions/balance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://swiss-project-api.onrender.com/api/v1/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://swiss-project-api.onrender.com/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSaldo(
        resSaldo.data.balance !== undefined
          ? resSaldo.data.balance
          : resSaldo.data
      );
      setTransacoes(
        Array.isArray(resTrans.data)
          ? resTrans.data
          : resTrans.data.content || []
      );
      if (resPerfil && resPerfil.data) setPerfilUsuario(resPerfil.data);
    } catch (erro) {
      console.error(erro);
      navigate("/");
    }
  };

  const buscarCotacoes = async () => {
    try {
      const res = await axios.get("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL");
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

      const dataSeguraParaBanco = new Date().toISOString().split("T")[0];
      const isCard = formaPagamento !== "ACCOUNT" && formaPagamento !== "PIX";

      setIsLoading(true);
      await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/transactions",
        {
          description: novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1),
          amount: valorParaSalvar,
          transactionDate: dataSeguraParaBanco,
          type: tipoTransacaoSelecionado,
          category: categoriaSelecionada,
          cardId: isCard ? Number(formaPagamento) : null,
          paymentMethod: isCard ? "CARD" : formaPagamento, // MANDANDO PRO BACKEND (PIX ou ACCOUNT)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNovaDescricao("");
      setNovoValor("");
      setFormaPagamento("PIX");
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
        `https://swiss-project-api.onrender.com/api/v1/transactions/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
    if (mesFiltro === 1) {
      setMesFiltro(12);
      setAnoFiltro(anoFiltro - 1);
    } else {
      setMesFiltro(mesFiltro - 1);
    }
  };

  const handleMesSeguinte = () => {
    if (mesFiltro === 12) {
      setMesFiltro(1);
      setAnoFiltro(anoFiltro + 1);
    } else {
      setMesFiltro(mesFiltro + 1);
    }
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    if (!t.transactionDate) return false;
    const [anoStr, mesStr] = t.transactionDate.split("-");
    return parseInt(anoStr, 10) === anoFiltro && parseInt(mesStr, 10) === mesFiltro;
  });

  const totalEntradasMes = transacoesFiltradas
    .filter((t) => t.type === "INCOME" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
  const totalSaidasMes = transacoesFiltradas
    .filter((t) => t.type === "EXPENSE" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
  const saldoMes = totalEntradasMes - totalSaidasMes;

  const transacoesAgrupadas = transacoesFiltradas.reduce((grupos, transacao) => {
    const isCard = !!transacao.card;
    const isPix = transacao.paymentMethod === "PIX";
    
    // Agrupa inteligente na aba de Extrato (Statement)
    const key = isCard ? `card-${transacao.card?.id}` : isPix ? "pix" : "account";
    const label = isCard
      ? `💳 ${transacao.card?.nome || transacao.card?.name} (${transacao.card?.lastDigits})`
      : isPix 
        ? `⚡ Pix` 
        : `🏦 ${t.transferLabel || "Transferência"}`;

    if (!grupos[key]) {
      grupos[key] = {
        label,
        items: [],
        color: isCard
          ? transacao.card?.color || transacao.card?.cor || theme.textMain
          : isPix 
            ? "#32bcad" 
            : "#0277bd",
      };
    }
    grupos[key].items.push(transacao);
    return grupos;
  }, {} as Record<string, { label: string; items: Transacao[]; color: string }>);

  const buscarCartoes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const resposta = await axios.get(
        "https://swiss-project-api.onrender.com/api/v1/cards",
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.delete(`https://swiss-project-api.onrender.com/api/v1/cards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      novoCartaoLimite.replace(/[^0-9.,]/g, "").replace(",", ".")
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
        "https://swiss-project-api.onrender.com/api/v1/cards",
        {
          name: novoCartaoNome,
          lastDigits: novoCartaoFinal,
          totalLimit: limiteNumerico,
          color: novoCartaoCor,
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
  // FUNÇÕES DE EXIBIÇÃO
  // ==========================================
  const getCategoriasDisponiveis = () => {
    const catKeys =
      tipoTransacaoSelecionado === "INCOME"
        ? ["SALARY", "SALES"]
        : ["BILLS", "ENTERTAINMENT", "FOOD", "MARKET", "TRANSPORT"];
    
    catKeys.sort((a, b) =>
      categoryMap[a][idioma].localeCompare(categoryMap[b][idioma])
    );
    return [...catKeys, "OTHER"];
  };

  // Função que retorna a lista de formas de pagamento em Ordem Alfabética (A-Z)
  const getPaymentOptions = () => {
    const options: Array<{ type: "PIX" | "ACCOUNT" | "CARD"; id: string; label: string; card?: Cartao }> = [];
    
    options.push({ type: "PIX", id: "PIX", label: "Pix" });
    options.push({ type: "ACCOUNT", id: "ACCOUNT", label: t.transferLabel || "Transferência" });

    if (tipoTransacaoSelecionado === "EXPENSE") {
      cartoes.forEach((c) => {
        options.push({
          type: "CARD",
          id: String(c.id),
          label: c.nome || c.name || "",
          card: c,
        });
      });
    }

    // Ordenação Alfabética considerando o idioma
    options.sort((a, b) => a.label.localeCompare(b.label, idioma));
    return options;
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
      it: "it-IT",
      ja: "ja-JP",
      zh: "zh-CN",
      ko: "ko-KR",
    };
    return new Date(
      Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]))
    ).toLocaleDateString(mapaLocais[idioma], {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const cartaoSelecionado = cartoes.find((c) => String(c.id) === formaPagamento);
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

  const SidebarItem = ({ id, icon, label }: { id: AbaType; icon: string; label: string }) => {
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
          borderLeft: isAtivo ? `4px solid ${theme.red}` : "4px solid transparent",
          backgroundColor: isAtivo ? theme.highlightBg : "transparent",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          if (!isAtivo) e.currentTarget.style.backgroundColor = theme.sidebarHover;
        }}
        onMouseLeave={(e) => {
          if (!isAtivo) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ marginRight: "8px" }}>{icon}</span> {label}
      </li>
    );
  };

  const idiomasOrdenados = (Object.keys(translations) as IdiomaType[]).sort((a, b) =>
    t.langs[a].localeCompare(t.langs[b])
  );
  
  const catSelecionadaData = categoryMap[categoriaSelecionada] || categoryMap["OTHER"];

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
      {/* CÓDIGO DO TOAST (NOTIFICAÇÃO) */}
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

      {/* CÓDIGO DO LOADING GERAL (OVERLAY) */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
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

      {/* OVERLAY DO MENU MOBILE */}
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

      {/* SIDEBAR (MENU LATERAL) */}
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

      {/* HEADER (CABEÇALHO) */}
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

      {/* ÁREA DE CONTEÚDO */}
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
            {/* Card Saldo Principal */}
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
                          moedaExibicao === moeda ? theme.highlightBg : "transparent",
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

            {/* Formulário de Transação */}
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
                  gap: "20px",
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
                    margin: "0 auto",
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
                              ? isDarkMode ? "#4a1c1c" : "#ffebee"
                              : isDarkMode ? "#1b3320" : "#e8f5e9"
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
                          boxShadow: isSelected ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
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
                      onClick={() => setMenuCategoriaAberto(!menuCategoriaAberto)}
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
                          transform: menuCategoriaAberto ? "rotate(180deg)" : "none",
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
                        ? (t.paymentHistoryLabel || "Forma de Pagamento") 
                        : (t.receiptMethodLabel || "Forma de Recebimento")}
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
                              {cartaoSelecionado.nome || cartaoSelecionado.name} (
                              {cartaoSelecionado.lastDigits})
                            </span>
                          </>
                        ) : null}
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: theme.textMuted,
                          transform: menuCartaoAberto ? "rotate(180deg)" : "none",
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
                            card={opt.card}
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
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                    gap: "15px",
                    alignItems: "flex-end",
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

                <button
                  type="submit"
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#d91616",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    alignSelf: isMobile ? "stretch" : "center",
                    minWidth: isMobile ? "auto" : "150px",
                    boxShadow: "0 4px 12px rgba(217, 22, 22, 0.2)",
                  }}
                >
                  {t.btnRegister}
                </button>
              </form>
            </div>

            {/* Histórico Filtrado na Home */}
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {transacoes
                    .filter((t_row) => t_row.type === tipoTransacaoSelecionado)
                    .map((t_row, i) => {
                      const isExpense = t_row.type === "EXPENSE";
                      const infoExibicao = getValorExibicao(Math.abs(t_row.amount || 0));
                      const categoriaVisual =
                        categoryMap[t_row.category || "OTHER"] || categoryMap["OTHER"];
                      const isOutros = !t_row.category || t_row.category === "OTHER";
                      const corDeFundoIcone = isOutros
                        ? isExpense
                          ? isDarkMode ? "#4a1c1c" : "#ffebee"
                          : isDarkMode ? "#1b3320" : "#e8f5e9"
                        : categoriaVisual.bgColor;

                      return (
                        <tr
                          key={t_row.id || i}
                          style={{ borderBottom: `1px solid ${theme.border}` }}
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
                                    color: isExpense ? theme.red : theme.green,
                                    fontWeight: "bold",
                                    marginRight: "6px",
                                  }}
                                >
                                  {categoriaVisual[idioma]}
                                </span>
                                • {formatarDataLocal(t_row.transactionDate)}
                                
                                {/* Lógica Visual: Pix vs Transferência vs Cartão */}
                                {t_row.card ? (
                                  <span
                                    style={{
                                      marginLeft: "6px",
                                      color: t_row.card.color || t_row.card.cor || theme.textMuted,
                                      fontWeight: "600",
                                    }}
                                  >
                                    • 💳 {t_row.card.name || t_row.card.nome}
                                  </span>
                                ) : t_row.paymentMethod === "PIX" ? (
                                  <span
                                    style={{
                                      marginLeft: "6px",
                                      color: "#32bcad",
                                      fontWeight: "600",
                                    }}
                                  >
                                    • ⚡ Pix
                                  </span>
                                ) : t_row.paymentMethod === "ACCOUNT" ? (
                                  <span
                                    style={{
                                      marginLeft: "6px",
                                      color: "#0277bd",
                                      fontWeight: "600",
                                    }}
                                  >
                                    • 🏦 {t.transferLabel || "Transferência"}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      marginLeft: "6px",
                                      color: theme.textMuted,
                                      fontWeight: "600",
                                    }}
                                  >
                                    • 🏦 {t.transferLabel || "Transferência"} / ⚡ Pix
                                  </span>
                                )}

                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 0", textAlign: "right" }}>
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
                              onClick={() => handleDeleteTransaction(t_row.id)}
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
              {transacoes.filter((t_row) => t_row.type === tipoTransacaoSelecionado).length === 0 && (
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

        {/* ================= ABA 2: EXTRATO DETALHADO ================= */}
        {abaAtiva === "statement" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: isMobile ? "1.2rem 1rem" : "1.5rem 2rem",
                borderRadius: "16px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? "15px" : "0",
                boxShadow: theme.shadow,
                transition: "background-color 0.3s ease",
              }}
            >
              <h2 style={{ color: theme.textMain, margin: 0, fontSize: "1.3rem" }}>
                📊 {t.statement}
              </h2>
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
                      setPickerYear(anoFiltro);
                      setIsMonthPickerOpen(!isMonthPickerOpen);
                    }}
                    style={{
                      minWidth: "140px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: theme.textMain,
                      fontSize: "1rem",
                      userSelect: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "8px",
                    }}
                  >
                    {t.months[mesFiltro - 1]} {anoFiltro}
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
                        width: "240px",
                        border: `1px solid ${theme.border}`,
                        marginTop: "8px",
                      }}
                    >
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
                        {t.months.map((monthName: string, index: number) => {
                          const isSelected =
                            mesFiltro === index + 1 && anoFiltro === pickerYear;
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setMesFiltro(index + 1);
                                setAnoFiltro(pickerYear);
                                setIsMonthPickerOpen(false);
                              }}
                              style={{
                                padding: "10px 0",
                                border: "none",
                                borderRadius: "10px",
                                backgroundColor: isSelected
                                  ? "#d91616"
                                  : theme.inputBg,
                                color: isSelected ? "#fff" : theme.textSec,
                                fontWeight: isSelected ? "bold" : "500",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}
                            >
                              {monthName.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
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

            <div
              style={{
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
                {t.periodTransactions}
              </h3>
              {Object.entries(transacoesAgrupadas).map(([key, grupo]) => (
                <div key={key} style={{ marginBottom: "2.5rem" }}>
                  <h4
                    style={{
                      color: grupo.color,
                      borderBottom: `2px solid ${grupo.color}30`,
                      paddingBottom: "8px",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1.0rem",
                      fontWeight: "600",
                    }}
                  >
                    {grupo.label}
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {grupo.items.map((t_row, i) => {
                        const isExpense = t_row.type === "EXPENSE";
                        const infoExibicao = getValorExibicao(Math.abs(t_row.amount || 0));
                        const categoriaVisual =
                          categoryMap[t_row.category || "OTHER"] || categoryMap["OTHER"];
                        const isOutros = !t_row.category || t_row.category === "OTHER";
                        const corDeFundoIcone = isOutros
                          ? isExpense
                            ? isDarkMode ? "#4a1c1c" : "#ffebee"
                            : isDarkMode ? "#1b3320" : "#e8f5e9"
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
                                      color: isExpense ? theme.red : theme.green,
                                      fontWeight: "bold",
                                      marginRight: "6px",
                                    }}
                                  >
                                    {categoriaVisual[idioma]}
                                  </span>
                                  • {formatarDataLocal(t_row.transactionDate)}
                                  
                                  {/* Lógica Visual do Extrato: Pix vs Transferência vs Cartão */}
                                  {t_row.card ? (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        color: t_row.card.color || t_row.card.cor || theme.textMuted,
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 💳 {t_row.card.name || t_row.card.nome}
                                    </span>
                                  ) : t_row.paymentMethod === "PIX" ? (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        color: "#32bcad",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • ⚡ Pix
                                    </span>
                                  ) : t_row.paymentMethod === "ACCOUNT" ? (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        color: "#0277bd",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 🏦 {t.transferLabel || "Transferência"}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        marginLeft: "6px",
                                        color: theme.textMuted,
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 🏦 {t.transferLabel || "Transferência"} / ⚡ Pix
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
                                {isExpense ? "- " : "+ "}
                                {infoExibicao.simbolo} {infoExibicao.valorFormatado}
                              </div>
                            </td>
                            <td style={{ width: "40px", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteTransaction(t_row.id)}
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
              {transacoesFiltradas.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <span style={{ fontSize: "2rem" }}>📭</span>
                  <p
                    style={{
                      color: theme.textMuted,
                      fontSize: "0.95rem",
                      marginTop: "10px",
                    }}
                  >
                    {t.noTransactionsMonth}
                  </p>
                </div>
              )}
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
              <h2 style={{ color: theme.textMain, margin: 0, fontSize: "1.3rem" }}>
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
                }}
              >
                {t.newCard}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "35px",
                width: "100%",
                maxWidth: "650px",
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
              {cartoes.map((cartao) => (
                <div
                  key={cartao.id}
                  style={{
                    backgroundColor: cartao.cor || cartao.color || "#333",
                    color: "white",
                    padding: "1.2rem",
                    borderRadius: "14px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "1.58 / 1",
                    width: "280px",
                    margin: "0 auto",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-40%",
                      right: "-15%",
                      width: "150px",
                      height: "150px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderRadius: "50%",
                      transform: "rotate(25deg)",
                    }}
                  />
                  <button
                    onClick={() => handleDeleteCartao(cartao.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "transparent",
                      border: "none",
                      color: "white",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      opacity: 0.7,
                    }}
                    title="Excluir Cartão"
                  >
                    ×
                  </button>
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
                        fontSize: "1.0rem",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {cartao.nome || cartao.name}
                    </span>
                    <span style={{ fontSize: "1.2rem", marginRight: "20px" }}>
                      💳
                    </span>
                  </div>
                  <div style={{ zIndex: 1, marginTop: "5px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        opacity: 0.8,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                      }}
                    >
                      {t.cardEnding}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "1.1rem",
                        letterSpacing: "2.5px",
                      }}
                    >
                      **** **** **** {cartao.lastDigits}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      zIndex: 1,
                      marginTop: "auto",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.65rem",
                          opacity: 0.8,
                          textTransform: "uppercase",
                        }}
                      >
                        {t.currentInvoice}
                      </p>
                      <p
                        style={{
                          margin: "1px 0 0 0",
                          fontSize: "1.0rem",
                          fontWeight: "bold",
                        }}
                      >
                        R${" "}
                        {(cartao.currentInvoice || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "2px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.65rem",
                          opacity: 0.8,
                          textTransform: "uppercase",
                        }}
                      >
                        {t.availableLimit}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        R${" "}
                        {(cartao.totalLimit - (cartao.currentInvoice || 0)).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "1px",
                          marginTop: "2px",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#d91616",
                            opacity: 0.8,
                          }}
                        ></div>
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: "#F79E1B",
                            marginLeft: "-6px",
                            opacity: 0.8,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 4: CONFIGURAÇÕES ================= */}
        {abaAtiva === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
              <h2 style={{ color: theme.textMain, margin: 0, fontSize: "1.3rem" }}>
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
                    <span style={{ fontSize: "0.8rem", color: theme.textMuted }}>
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
              maxWidth: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
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
            <form
              onSubmit={handleAddCartao}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                placeholder={t.cardNamePlaceholder}
                value={novoCartaoNome}
                onChange={(e) => setNovoCartaoNome(e.target.value)}
                required
                style={{
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
              <input
                placeholder={t.cardEndPlaceholder}
                maxLength={4}
                value={novoCartaoFinal}
                onChange={(e) =>
                  setNovoCartaoFinal(e.target.value.replace(/\D/g, ""))
                }
                required
                style={{
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
              <input
                placeholder={t.cardLimitPlaceholder}
                value={novoCartaoLimite}
                onChange={(e) => setNovoCartaoLimite(e.target.value)}
                required
                style={{
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
              <div>
                <p
                  style={{
                    margin: "5px 0 10px 0",
                    fontSize: "0.9rem",
                    color: theme.textMuted,
                    fontWeight: "500",
                  }}
                >
                  {t.cardColor}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {[
                    "#8A05BE",
                    "#FF7A00",
                    "#FFC107",
                    "#107c10",
                    "#0277bd",
                    "#111111",
                    "#E53935",
                  ].map((cor) => (
                    <div
                      key={cor}
                      onClick={() => setNovoCartaoCor(cor)}
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        backgroundColor: cor,
                        cursor: "pointer",
                        border:
                          novoCartaoCor === cor
                            ? "3px solid #ccc"
                            : "2px solid transparent",
                        transform: novoCartaoCor === cor ? "scale(1.1)" : "none",
                        transition: "all 0.2s",
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
      it: "Italiano",
      ja: "Japonês",
      zh: "Chinês",
      ko: "Coreano",
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
    cardNamePlaceholder: "Nome (ex: Nubank)",
    cardEndPlaceholder: "Final (ex: 4321)",
    cardLimitPlaceholder: "Limite (R$)",
    cardColor: "Cor do Cartão",
    cancel: "Cancelar",
    save: "Salvar",
    accountBalance: "Saldo em Conta",
    descriptionLabel: "Descrição",
    valueLabel: "Valor",
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
      it: "Italian",
      ja: "Japanese",
      zh: "Chinese",
      ko: "Korean",
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
    descPlaceholder: "Ex: Grocery",
    valPlaceholder: "0.00",
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
    cardNamePlaceholder: "Name (ex: Nubank)",
    cardEndPlaceholder: "Ending (ex: 4321)",
    cardLimitPlaceholder: "Limit ($)",
    cardColor: "Card Color",
    cancel: "Cancel",
    save: "Save",
    accountBalance: "Account Balance",
    descriptionLabel: "Description",
    valueLabel: "Value",
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
      it: "Italiano",
      ja: "Japonés",
      zh: "Chino",
      ko: "Coreano",
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
    descPlaceholder: "Ej: Mercado",
    valPlaceholder: "0,00",
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
    cardNamePlaceholder: "Nombre (ej: Nubank)",
    cardEndPlaceholder: "Termina en (ej: 4321)",
    cardLimitPlaceholder: "Límite ($)",
    cardColor: "Color de Tarjeta",
    cancel: "Cancelar",
    save: "Guardar",
    accountBalance: "Saldo en Cuenta",
    descriptionLabel: "Descripción",
    valueLabel: "Valor",
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
      it: "Italien",
      ja: "Japonais",
      zh: "Chinois",
      ko: "Coréen",
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
    descPlaceholder: "Ex: Marché",
    valPlaceholder: "0,00",
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
    cardNamePlaceholder: "Nom (ex: Nubank)",
    cardEndPlaceholder: "Finissant par (ex: 4321)",
    cardLimitPlaceholder: "Limite (€)",
    cardColor: "Couleur de la Carte",
    cancel: "Annuler",
    save: "Sauvegarder",
    accountBalance: "Solde du Compte",
    descriptionLabel: "Description",
    valueLabel: "Valeur",
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
      "Octubre",
      "Novembre",
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
      it: "Italienisch",
      ja: "Japanisch",
      zh: "Chinesisch",
      ko: "Koreanisch",
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
    descPlaceholder: "Bsp: Markt",
    valPlaceholder: "0,00",
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
    cardNamePlaceholder: "Name (z.B. Nubank)",
    cardEndPlaceholder: "Endet mit (z.B. 4321)",
    cardLimitPlaceholder: "Limit (€)",
    cardColor: "Kartenfarbe",
    cancel: "Abbrechen",
    save: "Speichern",
    accountBalance: "Kontostand",
    descriptionLabel: "Beschreibung",
    valueLabel: "Wert",
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
    title: "GlobalWallet",
    subtitle: "Il tuo controle",
    home: "Inizio",
    statement: "Estratto",
    cards: "Le Mie Carte",
    settings: "Impostazioni",
    welcome: "Ciao",
    logout: "Esci",
    balance: "Saldo Disponibile",
    newTransaction: "Nuova Transazione",
    income: "Entrata",
    expense: "Uscita",
    descPlaceholder: "Es: Mercato",
    valPlaceholder: "0,00",
    btnRegister: "Registra",
    history: "Ultime Transazioni",
    noTransactions: "Nessuna transazione.",
    confirmDelete: "Eliminare?",
    errorValue: "Valore non valido.",
    selCategory: "Categoria",
    entries: "Entrate",
    exits: "Uscite",
    balanceTotal: "Bilancio",
    periodTransactions: "Transazioni del Periodo",
    noTransactionsMonth: "Nessuna transazione trovata in questo mese.",
    newCard: "+ Nuova Carta",
    currentInvoice: "Fatura Attuale",
    availableLimit: "Limite Disp.",
    cardEnding: "Termina con",
    modalCardTitle: "Aggiungi Nuova Carta",
    cardNamePlaceholder: "Nome (es: Nubank)",
    cardEndPlaceholder: "Termina con (es: 4321)",
    cardLimitPlaceholder: "Limite (€)",
    cardColor: "Colore Carta",
    cancel: "Annulla",
    save: "Salva",
    accountBalance: "Saldo in Conto",
    descriptionLabel: "Descrizione",
    valueLabel: "Valore",
    paymentHistoryLabel: "Metodo di Pagamento",
    receiptMethodLabel: "Metodo di Ricezione",
    transferLabel: "Bonifico",
    profileTitle: "Il Mio Profilo",
    fullNameLabel: "Nome Completo",
    emailLabel: "E-mail",
    phoneLabel: "Telefono",
    profileDesc:
      "Dati personali collegati. Per modifiche, contattare il supporto.",
    appearanceTitle: "Aspetto",
    darkModeLabel: "Modalità Scura",
    darkModeDesc: "Modifica il tema visivo dell'applicazione.",
    securityTitle: "Sicurezza",
    currentPassword: "Password Attuale",
    newPassword: "Nuova Password",
    confirmNewPassword: "Conferma Nuova Password",
    updatePassword: "Aggiorna Password",
    errorSamePassword:
      "La nuova password deve essere diversa da quella attuale.",
    errorMismatch: "Le nuove password non corrispondono.",
    errorShortPassword: "La password deve contenere almeno 6 caratteri.",
    successPasswordUpdate: "Password aggiornata con successo!",
    errorPasswordUpdate:
      "Errore. Verifica se la tua password attuale è corretta.",
    languageTitle: "Lingua",
    languageDesc: "Cambia la lingua dell'applicazione.",
    months: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
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
    title: "GlobalWallet",
    subtitle: "財務管理",
    home: "ホーム",
    statement: "明細",
    cards: "カード",
    settings: "設定",
    welcome: "こんにちは",
    logout: "ログアウト",
    balance: "利用可能残高",
    newTransaction: "新規取引",
    income: "収入",
    expense: "支出",
    descPlaceholder: "例: スーパー",
    valPlaceholder: "0.00",
    btnRegister: "登録",
    history: "最近の取引",
    noTransactions: "取引はまだありません。",
    confirmDelete: "削除しますか？",
    errorValue: "無効な値です。",
    selCategory: "カテゴリ",
    entries: "収入",
    exits: "支出",
    balanceTotal: "残高",
    periodTransactions: "期間の取引",
    noTransactionsMonth: "今月の取引は見つかりませんでした。",
    newCard: "+ 新しいカード",
    currentInvoice: "現在の請求額",
    availableLimit: "利用可能枠",
    cardEnding: "末尾",
    modalCardTitle: "新しいカードを追加",
    cardNamePlaceholder: "名前 (例: Nubank)",
    cardEndPlaceholder: "末尾 (例: 4321)",
    cardLimitPlaceholder: "限度額 (¥)",
    cardColor: "カードの色",
    cancel: "キャンセル",
    save: "保存",
    accountBalance: "口座残高",
    descriptionLabel: "説明",
    valueLabel: "価値",
    paymentHistoryLabel: "支払方法",
    receiptMethodLabel: "受取方法",
    transferLabel: "振込",
    profileTitle: "マイプロフィール",
    fullNameLabel: "フルネーム",
    emailLabel: "メール",
    phoneLabel: "電話番号",
    profileDesc:
      "アカウントに関連付けられた個人データです。変更についてはサポートにお問い合わせください。",
    appearanceTitle: "外観",
    darkModeLabel: "ダークモード",
    darkModeDesc: "アプリの視覚テーマを変更します。",
    securityTitle: "セキュリティ",
    currentPassword: "現在のパスワード",
    newPassword: "新しいパスワード",
    confirmNewPassword: "新しいパスワードの確認",
    updatePassword: "パスワードを更新",
    errorSamePassword:
      "新しいパスワードは現在のパスワードと異なる必要があります。",
    errorMismatch: "新しいパスワードが一致しません。",
    errorShortPassword: "パスワードは6文字以上にする必要があります。",
    successPasswordUpdate: "パスワードが正常に更新されました！",
    errorPasswordUpdate: "エラー。現在のパスワードが正しいか確認してください。",
    languageTitle: "言語",
    languageDesc: "アプリケーションの言語を変更します。",
    months: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
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
    title: "GlobalWallet",
    subtitle: "你的财务控制",
    home: "首页",
    statement: "声明",
    cards: "我的卡",
    settings: "设置",
    welcome: "你好",
    logout: "退出",
    balance: "可用余额",
    newTransaction: "新交易",
    income: "收入",
    expense: "支出",
    descPlaceholder: "例: 超市",
    valPlaceholder: "0.00",
    btnRegister: "注册",
    history: "最近交易",
    noTransactions: "暂无交易。",
    confirmDelete: "删除交易？",
    errorValue: "无效值。",
    selCategory: "类别",
    entries: "收入",
    exits: "支出",
    balanceTotal: "余额",
    periodTransactions: "期间交易",
    noTransactionsMonth: "本月未找到交易。",
    newCard: "+ 新卡",
    currentInvoice: "当前账单",
    availableLimit: "可用额度",
    cardEnding: "尾号",
    modalCardTitle: "添加新卡",
    cardNamePlaceholder: "名称 (例: Nubank)",
    cardEndPlaceholder: "尾号 (例: 4321)",
    cardLimitPlaceholder: "额度 (¥)",
    cardColor: "卡片颜色",
    cancel: "取消",
    save: "保存",
    accountBalance: "账户余额",
    descriptionLabel: "描述",
    valueLabel: "价值",
    paymentHistoryLabel: "支付方式",
    receiptMethodLabel: "收款方式",
    transferLabel: "转账",
    profileTitle: "我的资料",
    fullNameLabel: "全名",
    emailLabel: "电子邮件",
    phoneLabel: "电话号码",
    profileDesc: "与您的注册相关的个人数据。如需修改，请联系支持。",
    appearanceTitle: "外观",
    darkModeLabel: "深色模式",
    darkModeDesc: "更改应用程序的视觉主题。",
    securityTitle: "安全",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmNewPassword: "确认新密码",
    updatePassword: "更新密码",
    errorSamePassword: "新密码必须与当前密码不同。",
    errorMismatch: "新密码不匹配。",
    errorShortPassword: "密码必须至少有 6 个字符。",
    successPasswordUpdate: "密码更新成功！",
    errorPasswordUpdate: "更改错误。请检查当前密码。",
    languageTitle: "语言",
    languageDesc: "更改应用程序语言。",
    months: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
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
    title: "GlobalWallet",
    subtitle: "귀하의 재정 관리",
    home: "홈",
    statement: "명세서",
    cards: "내 카드",
    settings: "설정",
    welcome: "안녕하세요",
    logout: "로그아웃",
    balance: "사용 가능 잔액",
    newTransaction: "새 거래",
    income: "수입",
    expense: "지출",
    descPlaceholder: "예: 마트",
    valPlaceholder: "0.00",
    btnRegister: "등록",
    history: "최근 거래",
    noTransactions: "아직 거래가 없습니다.",
    confirmDelete: "삭제하시겠습니까?",
    errorValue: "잘못된 값입니다.",
    selCategory: "카테고리",
    entries: "수입",
    exits: "지출",
    balanceTotal: "잔액",
    periodTransactions: "기간 거래",
    noTransactionsMonth: "이번 달에 거래가 없습니다.",
    newCard: "+ 새 카드",
    currentInvoice: "현재 청구서",
    availableLimit: "사용 가능 한도",
    cardEnding: "끝자리",
    modalCardTitle: "새 카드 추가",
    cardNamePlaceholder: "이름 (예: Nubank)",
    cardEndPlaceholder: "끝자리 (예: 4321)",
    cardLimitPlaceholder: "한도 (₩)",
    cardColor: "카드 색상",
    cancel: "취소",
    save: "저장",
    accountBalance: "계좌 잔액",
    descriptionLabel: "설명",
    valueLabel: "가치",
    paymentHistoryLabel: "결제 방법",
    receiptMethodLabel: "수취 방법",
    transferLabel: "계좌 이체",
    profileTitle: "내 프로필",
    fullNameLabel: "성명",
    emailLabel: "이메일",
    phoneLabel: "전화번호",
    profileDesc:
      "귀하의 계정과 연결된 개인 데이터입니다. 수정을 원하시면 지원팀에 문의하십시오.",
    appearanceTitle: "모양",
    darkModeLabel: "다크 모드",
    darkModeDesc: "앱의 시각적 테마를 변경합니다.",
    securityTitle: "보안",
    currentPassword: "현재 비밀번호",
    newPassword: "새 비밀번호",
    confirmNewPassword: "새 비밀번호 확인",
    updatePassword: "비밀번호 업데이트",
    errorSamePassword: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    errorMismatch: "새 비밀번호가 일치하지 않습니다.",
    errorShortPassword: "비밀번호는 6자 이상이어야 합니다.",
    successPasswordUpdate: "비밀번호가 성공적으로 업데이트되었습니다!",
    errorPasswordUpdate: "변경 오류. 현재 비밀번호를 확인하십시오.",
    languageTitle: "언어",
    languageDesc: "애플리케이션 언어를 변경합니다.",
    months: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
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
    it: string;
    ja: string;
    zh: string;
    ko: string;
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
    it: "Stipendio",
    ja: "給与",
    zh: "工资",
    ko: "급여",
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
    it: "Vendite",
    ja: "売上",
    zh: "销售",
    ko: "판매",
    emoji: "🛍️",
    color: "#0277bd",
    bgColor: "#e3f2fd",
  },
  FOOD: {
    pt: "Alimentação",
    en: "Food",
    es: "Alimentación",
    fr: "Alimentation",
    de: "Essen",
    it: "Cibo",
    ja: "食事",
    zh: "食物",
    ko: "음식",
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
    it: "Mercato",
    ja: "市場",
    zh: "市场",
    ko: "시장",
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
    it: "Trasporto",
    ja: "交通",
    zh: "交通",
    ko: "교통",
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
    it: "Svago",
    ja: "娯楽",
    zh: "娱乐",
    ko: "오락",
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
    it: "Bollette",
    ja: "請求書",
    zh: "账单",
    ko: "청구서",
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
    it: "Altro",
    ja: "その他",
    zh: "其他",
    ko: "기타",
    emoji: "📌",
    color: "#616161",
    bgColor: "#f5f5f5",
  },
};