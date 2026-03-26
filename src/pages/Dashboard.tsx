import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Importando a logo .png limpa
import logoImg from "../assets/logo.jpeg";

// --- DICIONÁRIOS ---
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
    descPlaceholder: "Descrição (ex: Mercado)",
    valPlaceholder: "0,00",
    btnRegister: "Registrar",
    history: "Últimas Transações",
    noTransactions: "Nenhuma transação.",
    confirmDelete: "Excluir transação?",
    errorValue: "Valor inválido.",
    selCategory: "Categoria",
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
    descPlaceholder: "Description (ex: Grocery)",
    valPlaceholder: "0.00",
    btnRegister: "Register",
    history: "Recent Transactions",
    noTransactions: "No transactions yet.",
    confirmDelete: "Delete transaction?",
    errorValue: "Invalid value.",
    selCategory: "Category",
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
    descPlaceholder: "Descripción (ej: Mercado)",
    valPlaceholder: "0,00",
    btnRegister: "Registrar",
    history: "Últimas Transações",
    noTransactions: "Aún no hay transações.",
    confirmDelete: "¿Eliminar?",
    errorValue: "Valor inválido.",
    selCategory: "Categoría",
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
    descPlaceholder: "Description (ex: Marché)",
    valPlaceholder: "0,00",
    btnRegister: "Enregistrer",
    history: "Dernières Transactions",
    noTransactions: "Aucune transaction.",
    confirmDelete: "Supprimer?",
    errorValue: "Valeur invalide.",
    selCategory: "Catégorie",
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
    descPlaceholder: "Beschreibung (z.B. Markt)",
    valPlaceholder: "0,00",
    btnRegister: "Registrieren",
    history: "Letzte Transaktionen",
    noTransactions: "Noch keine Transaktionen.",
    confirmDelete: "Löschen?",
    errorValue: "Ungültiger Wert.",
    selCategory: "Kategorie",
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
    newTransaction: "Nuova Transação",
    income: "Entrata",
    expense: "Uscita",
    descPlaceholder: "Descrizione (es: Mercato)",
    valPlaceholder: "0,00",
    btnRegister: "Registra",
    history: "Ultime Transazioni",
    noTransactions: "Nessuna transazione.",
    confirmDelete: "Eliminare?",
    errorValue: "Valore non valido.",
    selCategory: "Categoria",
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
    descPlaceholder: "説明 (例: スーパー)",
    valPlaceholder: "0.00",
    btnRegister: "登録",
    history: "最近の取引",
    noTransactions: "取引はまだありません。",
    confirmDelete: "削除しますか？",
    errorValue: "無効な値です。",
    selCategory: "カテゴリ",
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
    descPlaceholder: "描述 (例: 超市)",
    valPlaceholder: "0.00",
    btnRegister: "注册",
    history: "最近交易",
    noTransactions: "暂无交易。",
    confirmDelete: "删除交易？",
    errorValue: "无效值。",
    selCategory: "类别",
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
    descPlaceholder: "설명 (예: 시장)",
    valPlaceholder: "0.00",
    btnRegister: "등록",
    history: "최근 거래",
    noTransactions: "아직 거래가 없습니다.",
    confirmDelete: "삭제하시겠습니까?",
    errorValue: "잘못된 값입니다.",
    selCategory: "카테고리",
  },
};

// --- DICIONÁRIO E ESTILO DAS CATEGORIAS ---
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

type IdiomaType = keyof typeof translations;
type AbaType = "home" | "statement" | "cards" | "settings";

interface Transacao {
  id?: number;
  description?: string;
  amount?: number;
  transactionDate?: string;
  type?: string;
  category?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState<AbaType>("home");
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

  const [menuAberto, setMenuAberto] = useState(false);
  const [idioma, setIdioma] = useState<IdiomaType>("pt");
  const [menuIdiomaAberto, setMenuIdiomaAberto] = useState(false);
  const t = translations[idioma];
  const menuIdiomaRef = useRef<HTMLDivElement>(null);

  const [moedaExibicao, setMoedaExibicao] = useState<"BRL" | "USD" | "EUR">(
    "BRL",
  );
  const [cotacoes, setCotacoes] = useState({ usd: 0, eur: 0 });
  const nomeUsuario = localStorage.getItem("usuario") || "haike_dev";

  const buscarTudo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
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
      console.error("Erro ao buscar cotações:", erro);
    }
  };

  useEffect(() => {
    buscarTudo();
    buscarCotacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (
        menuIdiomaRef.current &&
        !menuIdiomaRef.current.contains(event.target as Node)
      ) {
        setMenuIdiomaAberto(false);
      }
      if (
        menuCategoriaRef.current &&
        !menuCategoriaRef.current.contains(event.target as Node)
      ) {
        setMenuCategoriaAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const idiomasOrdenados = (Object.keys(translations) as IdiomaType[]).sort(
    (a, b) => {
      const nomeA = t.langs[a];
      const nomeB = t.langs[b];
      return nomeA.localeCompare(nomeB);
    },
  );

  const getCategoriasDisponiveis = () => {
    const catKeys =
      tipoTransacaoSelecionado === "INCOME"
        ? ["SALARY", "SALES"]
        : ["BILLS", "ENTERTAINMENT", "FOOD", "MARKET", "TRANSPORT"];

    catKeys.sort((a, b) => {
      const catA = categoryMap[a] as Record<string, string>;
      const catB = categoryMap[b] as Record<string, string>;
      return catA[idioma].localeCompare(catB[idioma]);
    });

    return [...catKeys, "OTHER"];
  };

  useEffect(() => {
    const categoriasValidas = getCategoriasDisponiveis();
    if (!categoriasValidas.includes(categoriaSelecionada)) {
      setCategoriaSelecionada(
        tipoTransacaoSelecionado === "INCOME" ? "SALARY" : "OTHER",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTransacaoSelecionado]);

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovaDescricao(e.target.value.replace(/[0-9]/g, ""));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovoValor(e.target.value.replace(/[^0-9.,]/g, ""));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const valorCorrigido = novoValor.replace(",", ".");
      const valorNumerico = Math.abs(parseFloat(valorCorrigido));
      if (isNaN(valorNumerico)) {
        alert(t.errorValue);
        return;
      }
      const descFormatada =
        novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1);

      let valorParaSalvar = valorNumerico;
      if (moedaExibicao === "USD" && cotacoes.usd > 0)
        valorParaSalvar = valorNumerico * cotacoes.usd;
      if (moedaExibicao === "EUR" && cotacoes.eur > 0)
        valorParaSalvar = valorNumerico * cotacoes.eur;

      const dataHojeLocal = new Date();
      const ano = dataHojeLocal.getFullYear();
      const mes = String(dataHojeLocal.getMonth() + 1).padStart(2, "0");
      const dia = String(dataHojeLocal.getDate()).padStart(2, "0");
      const dataSeguraParaBanco = `${ano}-${mes}-${dia}`;

      await axios.post(
        "https://swiss-project-api.onrender.com/api/v1/transactions",
        {
          description: descFormatada,
          amount: valorParaSalvar,
          transactionDate: dataSeguraParaBanco,
          type: tipoTransacaoSelecionado,
          category: categoriaSelecionada,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setNovaDescricao("");
      setNovoValor("");
      buscarTudo();
    } catch (erro) {
      console.error(erro);
      alert(
        "Erro ao salvar! Certifique-se de que reiniciou o servidor Java para aplicar a categoria Mercado.",
      );
    }
  };

  const handleDeleteTransaction = async (id?: number) => {
    if (!id || !window.confirm(t.confirmDelete)) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://swiss-project-api.onrender.com/api/v1/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      buscarTudo();
    } catch (erro) {
      console.error(erro);
    }
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
    const apenasData = dataString.split("T")[0];
    const partes = apenasData.split("-");
    if (partes.length !== 3) return dataString;
    const dataObj = new Date(
      Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])),
    );
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
    return dataObj.toLocaleDateString(mapaLocais[idioma], {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const CategoryOption = ({ catKey }: { catKey: string }) => {
    const cat = categoryMap[catKey];
    const isSelected = categoriaSelecionada === catKey;
    const catName = cat[idioma as keyof typeof cat] as string;

    return (
      <div
        onClick={() => {
          setCategoriaSelecionada(catKey);
          setMenuCategoriaAberto(false);
        }}
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: isSelected ? "#f4f6f8" : "transparent",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          marginBottom: "2px",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
        <span
          style={{
            fontWeight: isSelected ? "600" : "400",
            color: isSelected ? "#111" : "#555",
            fontSize: "0.9rem",
          }}
        >
          {catName}
        </span>
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

  const catSelecionadaData =
    categoryMap[categoriaSelecionada] || categoryMap["OTHER"];
  const catSelecionadaName = catSelecionadaData[
    idioma as keyof typeof catSelecionadaData
  ] as string;

  // --- COMPONENTE DA LOGO ATUALIZADA (AUMENTADA) ---
  const AppLogo = ({ size = 45 }: { size?: number }) => (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px", // Borda um pouco mais arredondada para o tamanho maior
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
        style={{ height: "100%", width: "100%", objectFit: "cover", transform: "scale(1.3)" }} // Pequeno zoom para preencher melhor o espaço
      />
    </div>
  );

  // --- COMPONENTE DO MENU LATERAL (SIDEBAR ITEM) ---
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

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        paddingBottom: "2rem",
      }}
    >
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

      {/* --- MENU LATERAL (SIDEBAR) --- */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: menuAberto ? 0 : "-280px",
          width: "280px",
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
            onClick={() => window.location.reload()}
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

      {/* --- CABEÇALHO PRINCIPAL (HEADER) - ATUALIZADO (IGUAL FLANEWS) --- */}
      <header
        style={{
          backgroundColor: "#EC0000",
          color: "white",
          padding: "0 1.5rem", // Padding vertical removido para grudar no topo
          height: "75px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "0 0 22px 22px", // Arredonda apenas embaixo
          boxShadow: "0 8px 20px rgba(100, 98, 98, 0.35)", // Sombreado estilo FlaNews
          marginBottom: "2rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Lado Esquerdo: Menu e Logo agrupados */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            height: "100%",
          }}
        >
          {/* Três tracinhos PRIMEIRO - TAMANHO AUMENTADO */}
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

          {/* Logo e Nome LOGO DEPOIS - TAMANHO AUMENTADO */}
          <div
            onClick={() => window.location.reload()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              cursor: "pointer",
              height: "100%",
            }}
          >
            <AppLogo size={45} />
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

        {/* Lado Direito: Idiomas e User - TAMANHO AUMENTADO */}
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
              title="Trocar Idioma"
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

      {/* Margem superior ajustada para o conteúdo principal começar abaixo do cabeçalho maior */}
      <div
        style={{
          padding: "0 2rem 2rem 2rem",
          maxWidth: "750px",
          margin: "0 auto",
        }}
      >
        {/* --- ABA HOME --- */}
        {abaAtiva === "home" && (
          <>
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
                  <button
                    onClick={() => setMoedaExibicao("BRL")}
                    style={{
                      background:
                        moedaExibicao === "BRL" ? "#fff" : "transparent",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: moedaExibicao === "BRL" ? "bold" : "normal",
                      color: "#333",
                      boxShadow:
                        moedaExibicao === "BRL"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                    }}
                  >
                    BRL
                  </button>
                  <button
                    onClick={() => setMoedaExibicao("USD")}
                    style={{
                      background:
                        moedaExibicao === "USD" ? "#fff" : "transparent",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: moedaExibicao === "USD" ? "bold" : "normal",
                      color: "#333",
                      boxShadow:
                        moedaExibicao === "USD"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                    }}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setMoedaExibicao("EUR")}
                    style={{
                      background:
                        moedaExibicao === "EUR" ? "#fff" : "transparent",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: moedaExibicao === "EUR" ? "bold" : "normal",
                      color: "#333",
                      boxShadow:
                        moedaExibicao === "EUR"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                    }}
                  >
                    EUR
                  </button>
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
                padding: "1.5rem",
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
                {t.newTransaction}
              </h4>
              <form onSubmit={handleAddTransaction}>
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "15px" }}
                >
                  <button
                    type="button"
                    onClick={() => setTipoTransacaoSelecionado("INCOME")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      border:
                        tipoTransacaoSelecionado === "INCOME"
                          ? "1px solid #2e7d32"
                          : "1px solid #eaeaea",
                      backgroundColor:
                        tipoTransacaoSelecionado === "INCOME"
                          ? "#e8f5e9"
                          : "#fafafa",
                      color:
                        tipoTransacaoSelecionado === "INCOME"
                          ? "#2e7d32"
                          : "#999",
                    }}
                  >
                    + {t.income}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransacaoSelecionado("EXPENSE")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      border:
                        tipoTransacaoSelecionado === "EXPENSE"
                          ? "1px solid #EC0000"
                          : "1px solid #eaeaea",
                      backgroundColor:
                        tipoTransacaoSelecionado === "EXPENSE"
                          ? "#ffebee"
                          : "#fafafa",
                      color:
                        tipoTransacaoSelecionado === "EXPENSE"
                          ? "#EC0000"
                          : "#999",
                    }}
                  >
                    - {t.expense}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div
                    ref={menuCategoriaRef}
                    style={{ position: "relative", minWidth: "160px" }}
                  >
                    <div
                      onClick={() =>
                        setMenuCategoriaAberto(!menuCategoriaAberto)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        border: "1px solid #eaeaea",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>
                          {catSelecionadaData.emoji}
                        </span>
                        <span
                          style={{
                            fontSize: "0.95rem",
                            color: "#333",
                            fontWeight: "500",
                          }}
                        >
                          {catSelecionadaName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#ccc",
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
                          top: "calc(100% + 8px)",
                          left: 0,
                          width: "100%",
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                          padding: "8px",
                          zIndex: 1002,
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        {getCategoriasDisponiveis().map((catKey) => (
                          <CategoryOption key={catKey} catKey={catKey} />
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder={t.descPlaceholder}
                    required
                    value={novaDescricao}
                    onChange={handleDescricaoChange}
                    style={{
                      flex: 2,
                      minWidth: "180px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid #eaeaea",
                      backgroundColor: "#fafafa",
                      outline: "none",
                      fontSize: "0.9rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder={t.valPlaceholder}
                    required
                    value={novoValor}
                    onChange={handleValorChange}
                    style={{
                      flex: 1,
                      minWidth: "100px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: "1px solid #eaeaea",
                      backgroundColor: "#fafafa",
                      outline: "none",
                      textAlign: "right",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
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
                    {t.btnRegister}
                  </button>
                </div>
              </form>
            </div>

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
                    const valorAbsoluto = Math.abs(t_row.amount || 0);
                    const infoExibicao = getValorExibicao(valorAbsoluto);

                    const categoriaVisual =
                      categoryMap[t_row.category || "OTHER"] ||
                      categoryMap["OTHER"];
                    const nomeCategoriaTraduzido = categoriaVisual[
                      idioma as keyof typeof categoriaVisual
                    ] as string;

                    // --- NOVA LÓGICA DE COR DE FUNDO PARA 'OUTROS' ---
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
                            title={nomeCategoriaTraduzido}
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
                                {nomeCategoriaTraduzido}
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

        {/* --- ABA EXTRATO DETALHADO --- */}
        {abaAtiva === "statement" && (
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
              📊 {t.statement}
            </h2>
            <p style={{ color: "#777", maxWidth: "400px", margin: "0 auto" }}>
              Aqui vamos construir um extrato avançado, com filtros por mês, por
              categoria e opção de exportar para PDF ou Excel!
            </p>
          </div>
        )}

        {/* --- ABA MEUS CARTÕES --- */}
        {abaAtiva === "cards" && (
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
              💳 {t.cards}
            </h2>
            <p style={{ color: "#777", maxWidth: "400px", margin: "0 auto" }}>
              Área reservada para cadastrar seus cartões de crédito e visualizar
              limites e datas de fechamento.
            </p>
          </div>
        )}

        {/* --- ABA CONFIGURAÇÕES --- */}
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
    </div>
  );
}
