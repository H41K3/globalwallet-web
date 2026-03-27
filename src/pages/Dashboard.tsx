import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logoImg from "../assets/logo.jpeg";

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

// ==========================================
// CUSTOM COMPONENTS FOR MODERN FORM (INTERNAL)
// ==========================================

const CategoryOption = ({ catKey, idiom, onSelect }: { catKey: string; idiom: IdiomaType; onSelect: () => void }) => {
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
        backgroundColor: "transparent",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>{catData.emoji}</span>
      <span
        style={{
          color: "#555",
          fontSize: "0.85rem",
          fontWeight: "500"
        }}
      >
        {catData[idiom]}
      </span>
    </div>
  );
};

const PaymentMethodOption = ({ card, t, onSelect, isSelected }: { card?: Cartao; t: typeof translations["pt"]; onSelect: () => void; isSelected: boolean }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: isSelected ? "#f4f6f8" : "transparent",
        borderRadius: "8px",
        marginBottom: "2px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {card ? (
        <>
          <span style={{ fontSize: "1.1rem", color: card.color || card.cor || "#8A05BE" }}>💳</span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? "#111" : "#555",
              fontSize: "0.85rem",
            }}
          >
            {card.nome || card.name} ({card.lastDigits})
          </span>
        </>
      ) : (
        <>
          <span style={{ fontSize: "1.1rem" }}>🏦</span>
          <span
            style={{
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? "#111" : "#555",
              fontSize: "0.85rem",
            }}
          >
            {t.accountBalance}
          </span>
        </>
      )}
      {isSelected && (
        <span
          style={{
            marginLeft: "auto",
            color: "#EC0000",
            fontSize: "0.85rem",
          }}
        >
          ✔
        </span>
      )}
    </div>
  );
};

export function Dashboard() {
  const navigate = useNavigate();

  // ==========================================
  // 1. ESTADOS GLOBAIS
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState<AbaType>(
    (localStorage.getItem("abaAtiva") as AbaType) || "home",
  );
  const [idioma, setIdioma] = useState<IdiomaType>(
    (localStorage.getItem("idioma") as IdiomaType) || "pt",
  );
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuIdiomaAberto, setMenuIdiomaAberto] = useState(false);
  const [moedaExibicao, setMoedaExibicao] = useState<"BRL" | "USD" | "EUR">(
    "BRL",
  );
  const [cotacoes, setCotacoes] = useState({ usd: 0, eur: 0 });

  const menuIdiomaRef = useRef<HTMLDivElement>(null);
  const nomeUsuario = localStorage.getItem("usuario") || "haike_dev";
  const t = translations[idioma];

  // ==========================================
  // 2. ESTADOS: INÍCIO (HOME)
  // ==========================================
  const [saldo, setSaldo] = useState<number | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [tipoTransacaoSelecionado, setTipoTransacaoSelecionado] = useState<
    "INCOME" | "EXPENSE"
  >("EXPENSE");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState<string>("OTHER");
  const [menuCategoriaAberto, setMenuCategoriaAberto] = useState(false);
  const menuCategoriaRef = useRef<HTMLDivElement>(null);

  const [cartaoSelecionadoId, setCartaoSelecionadoId] = useState<string>("");
  const [menuCartaoAberto, setMenuCartaoAberto] = useState(false);
  const menuCartaoRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 3. ESTADOS: EXTRATO DETALHADO
  // ==========================================
  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState<number>(dataAtual.getMonth() + 1);
  const [anoFiltro, setAnoFiltro] = useState<number>(dataAtual.getFullYear());

  // NOVO: Estados e Ref para o Date Picker Customizado
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(dataAtual.getFullYear());
  const monthPickerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 4. ESTADOS: MEUS CARTÕES
  // ==========================================
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [novoCartaoNome, setNovoCartaoNome] = useState("");
  const [novoCartaoFinal, setNovoCartaoFinal] = useState("");
  const [novoCartaoLimite, setNovoCartaoLimite] = useState("");
  const [novoCartaoCor, setNovoCartaoCor] = useState("#8A05BE");

  // ==========================================
  // EFEITOS (LIFECYCLE)
  // ==========================================
  useEffect(() => {
    localStorage.setItem("abaAtiva", abaAtiva);
  }, [abaAtiva]);
  useEffect(() => {
    localStorage.setItem("idioma", idioma);
  }, [idioma]);

  useEffect(() => {
    buscarTudo();
    buscarCotacoes();
    buscarCartoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (
        menuIdiomaRef.current &&
        !menuIdiomaRef.current.contains(event.target as Node)
      )
        setMenuIdiomaAberto(false);
      if (
        menuCategoriaRef.current &&
        !menuCategoriaRef.current.contains(event.target as Node)
      )
        setMenuCategoriaAberto(false);
      if (
        menuCartaoRef.current &&
        !menuCartaoRef.current.contains(event.target as Node)
      )
        setMenuCartaoAberto(false);
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(event.target as Node)
      )
        setIsMonthPickerOpen(false);
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
      setCartaoSelecionadoId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTransacaoSelecionado]);

  // ==========================================
  // FUNÇÕES GLOBAIS E API
  // ==========================================
  const buscarTudo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      const [resSaldo, resTrans] = await Promise.all([
        axios.get(
          "https://swiss-project-api.onrender.com/api/v1/transactions/balance",
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        axios.get(
          "https://swiss-project-api.onrender.com/api/v1/transactions",
          { headers: { Authorization: `Bearer ${token}` } },
        ),
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

  // ==========================================
  // FUNÇÕES: INÍCIO (HOME)
  // ==========================================

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
      if (isNaN(valorNumerico)) return alert(t.errorValue);

      let valorParaSalvar = valorNumerico;
      if (moedaExibicao === "USD" && cotacoes.usd > 0)
        valorParaSalvar = valorNumerico * cotacoes.usd;
      if (moedaExibicao === "EUR" && cotacoes.eur > 0)
        valorParaSalvar = valorNumerico * cotacoes.eur;

      const dataSeguraParaBanco = new Date().toISOString().split("T")[0];

      await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/transactions",
        {
          description:
            novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1),
          amount: valorParaSalvar,
          transactionDate: dataSeguraParaBanco,
          type: tipoTransacaoSelecionado,
          category: categoriaSelecionada,
          cardId: cartaoSelecionadoId ? Number(cartaoSelecionadoId) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNovaDescricao("");
      setNovoValor("");
      setCartaoSelecionadoId(""); 
      buscarTudo();
      buscarCartoes(); 
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar! Verifique o servidor.");
    }
  };

  const handleDeleteTransaction = async (id?: number) => {
    if (!id || !window.confirm(t.confirmDelete)) return;
    try {
      await axios.delete(
        `https://swiss-project-api.onrender.com/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      buscarTudo();
      buscarCartoes(); 
    } catch (erro) {
      console.error(erro);
    }
  };

  // ==========================================
  // FUNÇÕES: EXTRATO DETALHADO
  // ==========================================
  const handleMesAnterior = () => {
    if (mesFiltro === 1) {
      setMesFiltro(12);
      setAnoFiltro(anoFiltro - 1);
    } else setMesFiltro(mesFiltro - 1);
  };

  const handleMesSeguinte = () => {
    if (mesFiltro === 12) {
      setMesFiltro(1);
      setAnoFiltro(anoFiltro + 1);
    } else setMesFiltro(mesFiltro + 1);
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    if (!t.transactionDate) return false;
    const [anoStr, mesStr] = t.transactionDate.split("-");
    return (
      parseInt(anoStr, 10) === anoFiltro && parseInt(mesStr, 10) === mesFiltro
    );
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
    const key = isCard ? `card-${transacao.card?.id}` : "account";
    const label = isCard 
        ? `💳 ${transacao.card?.nome || transacao.card?.name} (${transacao.card?.lastDigits})` 
        : `🏦 ${t.accountBalance}`;
    
    if (!grupos[key]) {
      grupos[key] = { 
        label, 
        items: [], 
        color: isCard ? (transacao.card?.color || transacao.card?.cor || "#333") : "#107c10" 
      };
    }
    grupos[key].items.push(transacao);
    return grupos;
  }, {} as Record<string, { label: string, items: Transacao[], color: string }>);


  // ==========================================
  // FUNÇÕES: MEUS CARTÕES
  // ==========================================
  const buscarCartoes = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const resposta = await axios.get(
        "https://swiss-project-api.onrender.com/api/v1/cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
      await axios.delete(
        `https://swiss-project-api.onrender.com/api/v1/cards/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      buscarCartoes();
    } catch (erro) {
      console.error("Erro ao excluir cartão:", erro);
      alert("Erro ao excluir o cartão.");
    }
  };

  const handleAddCartao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartaoNome || !novoCartaoFinal || !novoCartaoLimite) return;

    const limiteNumerico = parseFloat(
      novoCartaoLimite.replace(/[^0-9.,]/g, "").replace(",", "."),
    );
    if (isNaN(limiteNumerico)) return alert(t.errorValue);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/cards",
        {
          name: novoCartaoNome,
          lastDigits: novoCartaoFinal,
          totalLimit: limiteNumerico,
          color: novoCartaoCor,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setIsCardModalOpen(false);
      setNovoCartaoNome("");
      setNovoCartaoFinal("");
      setNovoCartaoLimite("");
      setNovoCartaoCor("#8A05BE");

      buscarCartoes();
    } catch (erro) {
      console.error("Erro ao criar cartão:", erro);
      alert("Erro ao salvar o cartão. Verifique os dados.");
    }
  };

  // ==========================================
  // HELPERS DE FORMATAÇÃO E COMPONENTES MENORES
  // ==========================================
  const getCategoriasDisponiveis = () => {
    const catKeys =
      tipoTransacaoSelecionado === "INCOME"
        ? ["SALARY", "SALES"]
        : ["BILLS", "ENTERTAINMENT", "FOOD", "MARKET", "TRANSPORT"];
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
      it: "it-IT",
      ja: "ja-JP",
      zh: "zh-CN",
      ko: "ko-KR",
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
        src={logoImg}
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

  const SidebarItem = ({ id, icon, label }: { id: AbaType; icon: string; label: string; }) => {
    const isAtivo = abaAtiva === id;
    return (
      <li
        onClick={() => {
          setAbaAtiva(id);
          setMenuAberto(false);
        }}
        style={{
          padding: "1.2rem 1.5rem",
          borderBottom: "1px solid #f0f0f0",
          cursor: "pointer",
          fontWeight: isAtivo ? "bold" : "normal",
          color: isAtivo ? "#EC0000" : "#666",
          borderLeft: isAtivo ? "4px solid #EC0000" : "4px solid transparent",
          backgroundColor: isAtivo ? "#fff9f9" : "transparent",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => {
          if (!isAtivo) e.currentTarget.style.backgroundColor = "#fafafa";
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

  const cartaoSelecionado = cartoes.find(c => String(c.id) === cartaoSelecionadoId);

  // ==========================================
  // RENDERIZAÇÃO PRINCIPAL (JSX)
  // ==========================================
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        paddingBottom: "2rem",
      }}
    >
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
            backgroundColor: "rgba(0,0,0,0.4)",
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
          backgroundColor: "#fff",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          transition: "left 0.3s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "#EC0000",
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
          backgroundColor: "#EC0000",
          color: "white",
          padding: "0 1.5rem",
          height: "80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0 0 22px 22px",
          boxShadow: "0 8px 20px rgba(100, 98, 98, 0.35)",
          marginBottom: "2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
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
            }}
          >
            ☰
          </button>
          <div
            onClick={handleLogoClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              cursor: "pointer",
              height: "100%",
            }}
          >
            <AppLogo size={40} />
            <h2
              style={{
                margin: 0,
                fontSize: "1.6rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              {t.title}
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div ref={menuIdiomaRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuIdiomaAberto(!menuIdiomaAberto)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "22px",
                padding: "10px 13px",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                color: "white",
              }}
            >
              {t.flag}{" "}
              <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>▼</span>
            </button>
            {menuIdiomaAberto && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
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
                      fontSize: "0.9rem",
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
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "1.0rem" }}>
              {t.welcome}, <strong>{nomeUsuario}</strong>
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
                padding: "10px 20px",
                borderRadius: "25px",
                fontSize: "1.0rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <div
        style={{
          padding: "0 2rem 2rem 2rem",
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
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "16px",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                position: "relative",
              }}
            >
              {cotacoes.usd > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    display: "flex",
                    gap: "5px",
                    backgroundColor: "#f5f5f5",
                    padding: "4px",
                    borderRadius: "8px",
                  }}
                >
                  {(["BRL", "USD", "EUR"] as const).map((moeda) => (
                    <button
                      key={moeda}
                      onClick={() => setMoedaExibicao(moeda)}
                      style={{
                        background:
                          moedaExibicao === moeda ? "#fff" : "transparent",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: moedaExibicao === moeda ? "bold" : "normal",
                        color: "#333",
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
                  color: "#888",
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
                  color: "#111",
                  fontWeight: "600",
                }}
              >
                {saldo !== null ? (
                  <>
                    <span
                      style={{
                        fontSize: "1.2rem",
                        color: "#888",
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
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  {moedaExibicao !== "BRL" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#555",
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
                        color: "#555",
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
                        color: "#555",
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
                backgroundColor: "#fff",
                borderRadius: "20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              }}
            >
              <h4 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "1.1rem", fontWeight: "600" }}>
                {t.newTransaction}
              </h4>
              <form onSubmit={handleAddTransaction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    backgroundColor: "#f9fafb",
                    borderRadius: "30px",
                    padding: "4px",
                    border: "1px solid #eaeaea",
                    width: "fit-content",
                    margin: "0 auto",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
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
                          background: isSelected ? (isExpense ? "#ffebee" : "#e8f5e9") : "transparent",
                          border: "none",
                          padding: "8px 25px",
                          borderRadius: "25px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          color: isSelected ? (isExpense ? "#EC0000" : "#2e7d32") : "#888",
                          boxShadow: isSelected ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
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
                    gridTemplateColumns: tipoTransacaoSelecionado === "EXPENSE" ? "1fr 1fr" : "1fr",
                    gap: "15px",
                  }}
                >
                  
                  <div ref={menuCategoriaRef} style={{ position: "relative" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fafafa",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#eaeaea")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.1rem" }}>{catSelecionadaData.emoji}</span>
                        <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: "500" }}>
                          {catSelecionadaData[idioma]}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "#aaa", transform: menuCategoriaAberto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
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
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                          padding: "6px",
                          zIndex: 1002,
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {getCategoriasDisponiveis().map((catKey) => (
                          <CategoryOption key={catKey} catKey={catKey} idiom={idioma} onSelect={() => {
                            setCategoriaSelecionada(catKey);
                            setMenuCategoriaAberto(false);
                          }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {tipoTransacaoSelecionado === "EXPENSE" && (
                    <div ref={menuCartaoRef} style={{ position: "relative" }}>
                      <p style={{ margin: "0 0 6px 0", fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {t.paymentHistoryLabel || "Forma de Pagamento"}
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
                          border: "1px solid #eaeaea",
                          backgroundColor: "#fafafa",
                          cursor: "pointer",
                          opacity: 1,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                          transition: "border-color 0.2s, background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#ccc";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#eaeaea";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {cartaoSelecionado ? (
                            <>
                              <span style={{ fontSize: "1.1rem", color: cartaoSelecionado.color || cartaoSelecionado.cor || "#8A05BE" }}>💳</span>
                              <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: "500" }}>
                                {cartaoSelecionado.nome || cartaoSelecionado.name} ({cartaoSelecionado.lastDigits})
                              </span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: "1.1rem" }}>🏦</span>
                              <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: "500" }}>
                                {t.accountBalance}
                              </span>
                            </>
                          )}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#aaa", transform: menuCartaoAberto ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
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
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                            padding: "6px",
                            zIndex: 1002,
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <PaymentMethodOption t={t} onSelect={() => {
                            setCartaoSelecionadoId("");
                            setMenuCartaoAberto(false);
                          }} isSelected={cartaoSelecionadoId === ""} />
                          
                          {cartoes.map((c) => (
                            <PaymentMethodOption key={c.id} card={c} t={t} onSelect={() => {
                              setCartaoSelecionadoId(String(c.id));
                              setMenuCartaoAberto(false);
                            }} isSelected={cartaoSelecionadoId === String(c.id)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "15px", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {t.descriptionLabel || "Descrição"}
                    </p>
                    <input
                      type="text"
                      placeholder={t.descPlaceholder}
                      required
                      value={novaDescricao}
                      onChange={handleDescricaoChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fafafa",
                        outline: "none",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#EC0000")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#eaeaea")}
                    />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px 0", fontSize: "0.75rem", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>
                      {t.valueLabel || "Valor"}
                    </p>
                    <input
                      type="text"
                      placeholder={t.valPlaceholder}
                      required
                      value={novoValor}
                      onChange={handleValorChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fafafa",
                        outline: "none",
                        textAlign: "right",
                        fontSize: "0.9rem",
                        boxSizing: "border-box",
                        fontWeight: "600",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#EC0000")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#eaeaea")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#EC0000",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(236,0,0,0.2)",
                    transition: "background-color 0.2s, transform 0.1s",
                    alignSelf: "center",
                    minWidth: "150px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D50000")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EC0000")}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {t.btnRegister}
                </button>
              </form>
            </div>

            {/* Histórico Geral */}
            <div
              style={{
                marginTop: "1.5rem",
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: "#333",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                {t.history}
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {transacoes.map((t_row, i) => {
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
                        ? "#ffebee"
                        : "#e8f5e9"
                      : categoriaVisual.bgColor;

                    return (
                      <tr
                        key={t_row.id || i}
                        style={{ borderBottom: "1px solid #f5f5f5" }}
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
                                color: "#333",
                                fontSize: "0.95rem",
                              }}
                            >
                              {t_row.description}
                            </div>
                            <div
                              style={{
                                color: "#aaa",
                                fontSize: "0.75rem",
                                marginTop: "4px",
                              }}
                            >
                              <span
                                style={{
                                  color: isExpense ? "#EC0000" : "#107c10",
                                  fontWeight: "bold",
                                  marginRight: "6px",
                                }}
                              >
                                {categoriaVisual[idioma]}
                              </span>
                              • {formatarDataLocal(t_row.transactionDate)}

                              {t_row.card && (
                                <span style={{ marginLeft: "6px", color: t_row.card.color || t_row.card.cor || "#888", fontWeight: "600" }}>
                                  • 💳 {t_row.card.name || t_row.card.nome}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 0", textAlign: "right" }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: isExpense ? "#EC0000" : "#107c10",
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
                              color: "#ccc",
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
              {transacoes.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#999",
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "1.5rem 2rem",
                borderRadius: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <h2 style={{ color: "#333", margin: 0, fontSize: "1.3rem" }}>
                📊 {t.statement}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  padding: "4px",
                  border: "1px solid #eaeaea",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
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
                    color: "#555",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eee")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
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
                      color: "#333",
                      fontSize: "1rem",
                      userSelect: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#eee"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {t.months[mesFiltro - 1]} {anoFiltro}
                  </div>

                  {isMonthPickerOpen && (
                    <div style={{
                      position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                      backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      padding: "16px", zIndex: 1005, width: "240px", border: "1px solid #f0f0f0", marginTop: "8px"
                    }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
                         <button onClick={() => setPickerYear(y => y - 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#555" }}>❮</button>
                         <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#111" }}>{pickerYear}</span>
                         <button onClick={() => setPickerYear(y => y + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#555" }}>❯</button>
                       </div>
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                         {t.months.map((monthName, index) => {
                            const isSelected = mesFiltro === index + 1 && anoFiltro === pickerYear;
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setMesFiltro(index + 1);
                                  setAnoFiltro(pickerYear);
                                  setIsMonthPickerOpen(false);
                                }}
                                style={{
                                  padding: "10px 0", border: "none", borderRadius: "10px",
                                  backgroundColor: isSelected ? "#EC0000" : "#f9fafb",
                                  color: isSelected ? "#fff" : "#555",
                                  fontWeight: isSelected ? "bold" : "500",
                                  cursor: "pointer", fontSize: "0.85rem",
                                  transition: "background-color 0.2s"
                                }}
                                onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = "#eee" }}
                                onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb" }}
                              >
                                 {monthName.slice(0, 3)}
                              </button>
                            )
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
                    color: "#555",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#eee")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
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
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  borderBottom: "4px solid #107c10",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#888",
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
                    color: "#111",
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "#107c10",
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
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  borderBottom: "4px solid #EC0000",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#888",
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
                    color: "#111",
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "#EC0000",
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
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  borderBottom: `4px solid ${saldoMes >= 0 ? "#107c10" : "#EC0000"}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#888",
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
                    color: "#111",
                    fontSize: "1.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: saldoMes >= 0 ? "#107c10" : "#EC0000",
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
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: "#333",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                {t.periodTransactions}
              </h3>
              
              {Object.entries(transacoesAgrupadas).map(([key, grupo]) => (
                <div key={key} style={{ marginBottom: "2.5rem" }}>
                  <h4 style={{ 
                    color: grupo.color, 
                    borderBottom: `2px solid ${grupo.color}30`, 
                    paddingBottom: "8px", 
                    marginBottom: "15px", 
                    display: "flex", 
                    alignItems: "center", 
                    fontSize: "1.0rem",
                    fontWeight: "600"
                  }}>
                    {grupo.label}
                  </h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {grupo.items.map((t_row, i) => {
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
                            ? "#ffebee"
                            : "#e8f5e9"
                          : categoriaVisual.bgColor;

                        return (
                          <tr
                            key={t_row.id || i}
                            style={{ borderBottom: "1px solid #f5f5f5" }}
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
                                    color: "#333",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {t_row.description}
                                </div>
                                <div
                                  style={{
                                    color: "#aaa",
                                    fontSize: "0.75rem",
                                    marginTop: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: isExpense ? "#EC0000" : "#107c10",
                                      fontWeight: "bold",
                                      marginRight: "6px",
                                    }}
                                  >
                                    {categoriaVisual[idioma]}
                                  </span>
                                  • {formatarDataLocal(t_row.transactionDate)}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 0", textAlign: "right" }}>
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: isExpense ? "#EC0000" : "#107c10",
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
                                  color: "#ccc",
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
                      color: "#999",
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
                backgroundColor: "#fff",
                padding: "1.5rem 2rem",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                maxWidth: "750px",
              }}
            >
              <h2 style={{ color: "#333", margin: 0, fontSize: "1.3rem" }}>
                💳 {t.cards}
              </h2>
              <button
                onClick={() => setIsCardModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#EC0000",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  boxShadow: "0 4px 10px rgba(236,0,0,0.2)",
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
                    color: "#999",
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
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "1.58 / 1",
                    width: "280px",
                    margin: "0 auto",
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
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.7")
                    }
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
                        {(
                          cartao.totalLimit - (cartao.currentInvoice || 0)
                        ).toLocaleString("pt-BR", {
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
                            backgroundColor: "#EB001B",
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
          <div
            style={{
              backgroundColor: "#fff",
              padding: "3rem 2rem",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <h2 style={{ color: "#333", marginBottom: "10px" }}>
              ⚙️ {t.settings}
            </h2>
            <p style={{ color: "#777", maxWidth: "400px", margin: "0 auto" }}>
              Gerencie as preferências da sua conta, troque sua senha e ative o
              modo escuro (Dark Mode).
            </p>
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
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#333",
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
                  border: "1px solid #ddd",
                  fontSize: "0.95rem",
                  outline: "none",
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
                  border: "1px solid #ddd",
                  fontSize: "0.95rem",
                  outline: "none",
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
                  border: "1px solid #ddd",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              <div>
                <p
                  style={{
                    margin: "5px 0 10px 0",
                    fontSize: "0.9rem",
                    color: "#555",
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
                        transform:
                          novoCartaoCor === cor ? "scale(1.1)" : "none",
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
                    color: "#777",
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
                    background: "#EC0000",
                    color: "white",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 10px rgba(236,0,0,0.2)",
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
// DICIONÁRIOS E MAPEAMENTOS (FINAL DO ARQUIVO)
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
    descPlaceholder: "Ex: Mercado",
    valPlaceholder: "0,00",
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
    accountBalance: "Saldo em Conta", // ATUALIZADO
    descriptionLabel: "Descrição",
    valueLabel: "Valor",
    paymentHistoryLabel: "Forma de Pagamento",
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
    noTransactions: "Aún no hay transações.",
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
    noTransactionsMonth:
      "In diesem Monat wurden keine Transaktionen gefunden.",
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
    ko: "オ락",
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