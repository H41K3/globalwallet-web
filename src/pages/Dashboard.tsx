import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://globalwallet-api-9ffu.onrender.com";

type IdiomaType = "pt" | "en" | "es";
type AbaType = "home" | "statement" | "cards" | "statistics" | "settings";

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
  closingDate?: number;
  dueDate?: number;
  bandeira?: string;
  flag?: string;
  brand?: string;
  type?: string;
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

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const translations = {
  pt: {
    flag: "🇧🇷",
    langs: { pt: "Português", en: "Inglês", es: "Espanhol" },
    title: "GlobalWallet",
    subtitle: "Seu controle financeiro",
    home: "Início",
    statistics: "Estatísticas",
    budgetControl: "Controle de Orçamento",
    expensesByCategory: "Gastos por Categoria",
    fixedCostsTitle: "Custos Fixos",
    fixedCostsDesc: "Assinaturas e Contas",
    annualProjection: "Projeção Anual",
    spentOf: "Você já gastou {0} da sua renda este mês.",
    noIncome: "Registre uma renda este mês para ver o controle de orçamento.",
    export: "Exportar",
    exportCSV: "Exportar CSV",
    exportPDF: "Exportar PDF",
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
    searchPlaceholder: "Pesquisar...",
    noTransactionsMonth: "Nenhuma transação.",
    tryAnotherMonth:
      "Tente selecionar outro mês ou registre uma nova transação.",
    newCard: "Adicionar novo cartão",
    currentInvoice: "Fatura",
    availableLimit: "Limite Disp.",
    cardEnding: "Final",
    modalCardTitle: "Adicionar Novo Cartão",
    cardType: "Tipo de Cartão",
    flagLabel: "Bandeira",
    initialBalance: "Saldo Inicial",
    cardColor: "Cor de Identificação",
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
    pixSubtitle: "Transferência",
    directDebit: "Débito direto",
    tedDoc: "TED/DOC",
    inCash: "À vista",
    installments: "Parcelamento",
    moreOptions: "Mais...",
    loading: "Carregando...",
    emptyChart: "Nenhum gasto registrado neste período.",
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
    bankName: "Nome do Banco",
    closingDay: "Dia de Fechamento",
    dueDay: "Dia de Vencimento",
    cardEndingModal: "Final (4 dígitos)",
    totalLimit: "Limite de Crédito",
    cardTypes: {
      CREDIT: "Crédito",
      DEBIT: "Débito",
      VR: "Vale Refeição",
      VA: "Vale Aliment.",
    },
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
    noCardsYet: "Nenhum cartão cadastrado ainda.",
  },
  en: {
    flag: "🇺🇸",
    langs: { pt: "Portuguese", en: "English", es: "Spanish" },
    title: "GlobalWallet",
    subtitle: "Your financial control",
    home: "Home",
    statistics: "Statistics",
    budgetControl: "Budget Control",
    expensesByCategory: "Expenses by Category",
    fixedCostsTitle: "Fixed Costs",
    fixedCostsDesc: "Subscriptions & Bills",
    annualProjection: "Annual Projection",
    spentOf: "You have spent {0} of your income this month.",
    noIncome: "Register an income this month to see the budget control.",
    export: "Export",
    exportCSV: "Export CSV",
    exportPDF: "Export PDF",
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
    searchPlaceholder: "Search...",
    noTransactionsMonth: "No transactions.",
    tryAnotherMonth:
      "Try selecting another month or register a new transaction.",
    newCard: "Add new card",
    currentInvoice: "Invoice",
    availableLimit: "Avail. Limit",
    cardEnding: "Ending",
    modalCardTitle: "Add New Card",
    cardType: "Card Type",
    flagLabel: "Flag",
    initialBalance: "Initial Balance",
    cardColor: "Identification Color",
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
    pixSubtitle: "Transfer",
    directDebit: "Direct Debit",
    tedDoc: "Wire Transfer",
    inCash: "In cash",
    installments: "Installments",
    moreOptions: "More...",
    loading: "Loading...",
    emptyChart: "No expenses recorded in this period.",
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
    bankName: "Bank / Provider",
    closingDay: "Closing Day",
    dueDay: "Due Day",
    cardEndingModal: "Ending (4 digits)",
    totalLimit: "Credit Limit",
    cardTypes: {
      CREDIT: "Credit",
      DEBIT: "Debit",
      VR: "Meal Voucher",
      VA: "Food Voucher",
    },
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
    noCardsYet: "No cards registered yet.",
  },
  es: {
    flag: "🇪🇸",
    langs: { pt: "Portugués", en: "Inglés", es: "Español" },
    title: "GlobalWallet",
    subtitle: "Tu control financiero",
    home: "Inicio",
    statistics: "Estadísticas",
    budgetControl: "Control de Presupuesto",
    expensesByCategory: "Gastos por Categoría",
    fixedCostsTitle: "Costos Fijos",
    fixedCostsDesc: "Suscripciones y Cuentas",
    annualProjection: "Proyección Anual",
    spentOf: "Has gastado el {0} de tus ingresos este mes.",
    noIncome:
      "Registra un ingreso este mes para ver el control de presupuesto.",
    export: "Exportar",
    exportCSV: "Exportar CSV",
    exportPDF: "Exportar PDF",
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
    searchPlaceholder: "Buscar...",
    noTransactionsMonth: "Aún no hay transacciones.",
    tryAnotherMonth:
      "Intenta seleccionar otro mes o registrar una nueva transacción.",
    newCard: "Agregar nueva tarjeta",
    currentInvoice: "Factura",
    availableLimit: "Límite Disp.",
    cardEnding: "Termina en",
    modalCardTitle: "Agregar Nueva Tarjeta",
    cardType: "Tipo de Tarjeta",
    flagLabel: "Marca",
    initialBalance: "Saldo Inicial",
    cardColor: "Color de Identificación",
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
    pixSubtitle: "Transferencia",
    directDebit: "Débito directo",
    tedDoc: "Transferencia",
    inCash: "Al contado",
    installments: "Cuotas",
    moreOptions: "Más...",
    loading: "Cargando...",
    emptyChart: "No hay gastos registrados en este período.",
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
    bankName: "Nombre del Banco",
    closingDay: "Día de Cierre",
    dueDay: "Día de Vencimiento",
    cardEndingModal: "Termina en (4 dígitos)",
    totalLimit: "Límite de Crédito",
    cardTypes: {
      CREDIT: "Crédito",
      DEBIT: "Débito",
      VR: "Vale Comida",
      VA: "Vale Despensa",
    },
    months: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julho",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    noCardsYet: "Aún no hay tarjetas registradas.",
  },
};

const categoryMap: Record<
  string,
  {
    pt: string;
    en: string;
    es: string;
    emoji: string;
    color: string;
    bgColor: string;
  }
> = {
  SALARY: {
    pt: "Salário",
    en: "Salary",
    es: "Salario",
    emoji: "💰",
    color: "#2e7d32",
    bgColor: "#e8f5e9",
  },
  SALES: {
    pt: "Venda",
    en: "Sale",
    es: "Venta",
    emoji: "🛍️",
    color: "#0277bd",
    bgColor: "#e3f2fd",
  },
  INVESTMENTS: {
    pt: "Investimento",
    en: "Investment",
    es: "Inversión",
    emoji: "📈",
    color: "#fbc02d",
    bgColor: "#fffde7",
  },
  FOOD: {
    pt: "Alimentação",
    en: "Food",
    es: "Alimentación",
    emoji: "🍔",
    color: "#e65100",
    bgColor: "#fff3e0",
  },
  MARKET: {
    pt: "Mercado",
    en: "Market",
    es: "Mercado",
    emoji: "🛒",
    color: "#d84315",
    bgColor: "#fbe9e7",
  },
  TRANSPORT: {
    pt: "Transporte",
    en: "Transport",
    es: "Transporte",
    emoji: "🚙",
    color: "#1565c0",
    bgColor: "#e3f2fd",
  },
  ENTERTAINMENT: {
    pt: "Lazer",
    en: "Entertainment",
    es: "Entretenimiento",
    emoji: "🍿",
    color: "#6a1b9a",
    bgColor: "#f3e5f5",
  },
  BILLS: {
    pt: "Conta",
    en: "Bill",
    es: "Cuenta",
    emoji: "📄",
    color: "#00695c",
    bgColor: "#e0f2f1",
  },
  SUBSCRIPTION: {
    pt: "Assinatura",
    en: "Subscription",
    es: "Suscripción",
    emoji: "📱",
    color: "#00838f",
    bgColor: "#e0f2f1",
  },
  TELEPHONY: {
    pt: "Telefonia",
    en: "Telephony",
    es: "Telefonía",
    emoji: "📞",
    color: "#283593",
    bgColor: "#e8eaf6",
  },
  DRINK: {
    pt: "Bebida",
    en: "Drink",
    es: "Bebida",
    emoji: "🥤",
    color: "#c62828",
    bgColor: "#ffebee",
  },
  OTHER: {
    pt: "Outros",
    en: "Other",
    es: "Otros",
    emoji: "📌",
    color: "#616161",
    bgColor: "#f5f5f5",
  },
};

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
      color: "#1A1F71",
      fontSize: "18px",
      fontWeight: "900",
      fontStyle: "italic",
      fontFamily: "'Arial Black', Impact, sans-serif",
      letterSpacing: "-1px",
      flexShrink: 0,
      lineHeight: 1,
      userSelect: "none",
    }}
  >
    VISA
  </div>
);

const GenericFlagSVG = ({ name }: { name: string }) => {
  const nameUpper = name.toUpperCase();
  const bgColors: Record<string, string> = {
    ELO: "#00A4E0",
    SODEXO: "#000000",
    ALELO: "#00823B",
    TICKET: "#EF3E4A",
    CAJU: "#FF4B5A",
    FLASH: "#E5185E",
    VR: "#00A650",
  };

  const bgColor = bgColors[nameUpper] || "#333333";

  return (
    <div
      style={{
        color: "#fff",
        backgroundColor: bgColor,
        fontSize: "9px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "1px",
        padding: "5px 6px",
        borderRadius: "4px",
        flexShrink: 0,
        userSelect: "none",
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      {nameUpper === "SODEXO / PLUXEE" ? "SODEXO" : nameUpper}
    </div>
  );
};

const renderBandeira = (cartao: Cartao) => {
  const typeDB = cartao.type?.toUpperCase();
  const flagDB =
    cartao.bandeira?.toUpperCase() ||
    cartao.flag?.toUpperCase() ||
    cartao.brand?.toUpperCase() ||
    "";

  if (flagDB !== "VISA" && flagDB !== "MASTERCARD" && flagDB !== "") {
    return <GenericFlagSVG name={flagDB} />;
  }

  if (flagDB === "VISA") return <VisaSVG />;
  if (flagDB === "MASTERCARD") return <MastercardSVG />;

  return (
    <GenericFlagSVG
      name={typeDB === "VR" ? "VR" : typeDB === "VA" ? "VA" : "CARD"}
    />
  );
};

const obterDataAtualLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

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
              fontWeight: "500",
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
              fontWeight: "500",
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
              fontWeight: "500",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              transform: "scale(0.65)",
            }}
          >
            {renderBandeira(card)}
          </div>
          <span
            style={{
              fontWeight: "500",
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

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação do PWA");
        }
        setDeferredPrompt(null);
      });
    }
  };

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

  const [parcelas, setParcelas] = useState<number>(1);
  const [isCustomParcela, setIsCustomParcela] = useState(false);
  const [parcelasInput, setParcelasInput] = useState("");

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

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transacao | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editValor, setEditValor] = useState("");

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
  const [novoCartaoFechamento, setNovoCartaoFechamento] = useState("");
  const [novoCartaoVencimento, setNovoCartaoVencimento] = useState("");
  const [novoCartaoBandeira, setNovoCartaoBandeira] = useState("MASTERCARD");
  const [novoCartaoTipo, setNovoCartaoTipo] = useState<
    "CREDIT" | "DEBIT" | "VR" | "VA"
  >("CREDIT");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  useEffect(() => {
    if (novoCartaoTipo === "CREDIT" || novoCartaoTipo === "DEBIT") {
      setNovoCartaoBandeira("MASTERCARD");
    } else {
      setNovoCartaoBandeira("SODEXO");
    }
  }, [novoCartaoTipo]);

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
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
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

  useEffect(() => {
    if (
      formaPagamento === "PIX" ||
      formaPagamento === "ACCOUNT" ||
      formaPagamento === "BALANCE"
    ) {
      setParcelas(1);
      setIsCustomParcela(false);
    }
  }, [formaPagamento]);

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
        `${BASE_URL}/api/v1/auth/password`,
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
        axios.get(`${BASE_URL}/api/v1/transactions/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/v1/auth/me`, {
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
      const url = `${BASE_URL}/api/v1/transactions`;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const descCapitalized =
        novaDescricao.charAt(0).toUpperCase() + novaDescricao.slice(1);

      let finalDescription = descCapitalized;
      if (isCard && tipoTransacaoSelecionado === "EXPENSE") {
        if (parcelas > 1) {
          finalDescription = `${descCapitalized} (${parcelas}x)`;
        } else {
          finalDescription = `${descCapitalized} (${t.inCash || "À vista"})`;
        }
      }

      const payload = {
        description: finalDescription,
        amount: valorParaSalvar,
        transactionDate: dataTransacao,
        type: tipoTransacaoSelecionado,
        category: categoriaSelecionada,
        cardId: isCard ? Number(formaPagamento) : null,
        paymentMethod: isCard ? "CARD" : formaPagamento,
      };

      await axios.post(url, payload, config);

      setNovaDescricao("");
      setNovoValor("");
      setFormaPagamento("PIX");
      setDataTransacao(obterDataAtualLocal());
      setParcelas(1);
      setIsCustomParcela(false);
      setParcelasInput("");

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
      await axios.delete(`${BASE_URL}/api/v1/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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

  const handleEditTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const token = localStorage.getItem("token");
    try {
      const valorNumerico = Math.abs(parseFloat(editValor.replace(",", ".")));
      if (isNaN(valorNumerico)) {
        showToast(t.errorValue, "error");
        return;
      }

      setIsLoading(true);
      const url = `${BASE_URL}/api/v1/transactions/${editingTransaction.id}`;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        description: editDescricao,
        amount: valorNumerico,
      };

      await axios.put(url, payload, config);
      setEditingTransaction(null);
      await buscarTudo();
      await buscarCartoes();
      showToast("Transação editada com sucesso!", "success");
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao editar transação.", "error");
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

  const getInvoicePeriod = (dateStr: string, closingDay: number) => {
    const [yStr, mStr, dStr] = dateStr.split("T")[0].split("-");
    let month = parseInt(mStr, 10);
    let year = parseInt(yStr, 10);
    const day = parseInt(dStr, 10);

    if (day > closingDay) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return { month, year };
  };

  const expandInstallments = (txList: Transacao[]) => {
    const expanded: Transacao[] = [];

    txList.forEach((tx) => {
      if (tx.type === "EXPENSE" && tx.card && tx.description) {
        const match = tx.description.match(/(.+?)\s*\((\d+)x\)$/);
        if (match) {
          const baseDesc = match[1].trim();
          const parcelas = parseInt(match[2], 10);

          if (parcelas > 1 && tx.amount) {
            const valorParcela = parseFloat((tx.amount / parcelas).toFixed(2));
            const diferencaCentavos = parseFloat(
              (tx.amount - valorParcela * (parcelas - 1)).toFixed(2),
            );

            const dataStr = tx.transactionDate || obterDataAtualLocal();
            const [anoStr, mesStr, diaStr] = dataStr.split("T")[0].split("-");
            const anoBase = parseInt(anoStr, 10);
            const mesBase = parseInt(mesStr, 10);
            const diaBase = parseInt(diaStr, 10);

            for (let i = 1; i <= parcelas; i++) {
              const dateOfInst = new Date(
                anoBase,
                mesBase - 1 + (i - 1),
                diaBase,
              );
              const y = dateOfInst.getFullYear();
              const m = String(dateOfInst.getMonth() + 1).padStart(2, "0");
              const d = String(dateOfInst.getDate()).padStart(2, "0");

              expanded.push({
                ...tx,
                description: `${baseDesc} (${i}/${parcelas})`,
                amount: i === parcelas ? diferencaCentavos : valorParcela,
                transactionDate: `${y}-${m}-${d}`,
              });
            }
            return;
          }
        }
      }
      expanded.push(tx);
    });

    return expanded;
  };

  const transacoesExpandidas = expandInstallments(transacoes);

  const transacoesFiltradasSemBusca = transacoesExpandidas.filter((t_row) => {
    if (!t_row.transactionDate) return false;

    const [anoStr, mesStr, diaStr] = t_row.transactionDate.split("-");

    if (t_row.card && t_row.type === "EXPENSE") {
      const closingDay = t_row.card.closingDate || 31;
      const period = getInvoicePeriod(t_row.transactionDate, closingDay);

      const periodMatch =
        period.month === mesFiltro && period.year === anoFiltro;
      const diaMatch = diaFiltro === null || parseInt(diaStr, 10) === diaFiltro;

      return periodMatch && diaMatch;
    }

    const anoMatch = parseInt(anoStr, 10) === anoFiltro;
    const mesMatch = parseInt(mesStr, 10) === mesFiltro;
    const diaMatch = diaFiltro === null || parseInt(diaStr, 10) === diaFiltro;
    return anoMatch && mesMatch && diaMatch;
  });

  const transacoesFiltradas = transacoesFiltradasSemBusca.filter((t_row) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const descMatch = t_row.description?.toLowerCase().includes(lowerSearch);
    const amountMatch = t_row.amount?.toString().includes(lowerSearch);
    return descMatch || amountMatch;
  });

  const totalEntradasMes = transacoesFiltradas
    .filter((t) => t.type === "INCOME" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalSaidasMes = transacoesFiltradas
    .filter((t) => t.type === "EXPENSE" && !t.card)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const saldoMes = totalEntradasMes - totalSaidasMes;

  const handleExportCSV = () => {
    if (transacoesFiltradas.length === 0) {
      showToast(t.noTransactionsMonth, "error");
      return;
    }

    const headers = [
      "Data",
      "Descrição",
      "Categoria",
      "Tipo",
      "Forma de Pagamento",
      "Valor",
    ];
    const rows = transacoesFiltradas.map((t_row) => {
      const date = formatarDataLocal(t_row.transactionDate);
      const desc = `"${(t_row.description || "").replace(/"/g, '""')}"`;
      const cat = categoryMap[t_row.category || "OTHER"][idioma];
      const type = t_row.type === "EXPENSE" ? t.expense : t.income;
      const payment = t_row.card
        ? t_row.card.name || t_row.card.nome
        : t_row.paymentMethod === "PIX"
          ? "Pix"
          : t_row.paymentMethod === "BALANCE"
            ? t.balanceOption
            : t.transferLabel;
      const val = t_row.amount?.toFixed(2) || "0.00";
      return [date, desc, cat, type, payment, val].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_${mesFiltro}_${anoFiltro}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (transacoesFiltradas.length === 0) {
      showToast(t.noTransactionsMonth, "error");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Extrato - ${t.months[mesFiltro - 1]} ${anoFiltro}`, 14, 20);

    const tableColumn = [
      "Data",
      "Descrição",
      "Categoria",
      "Tipo",
      "Pagamento",
      "Valor",
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRows: any[] = [];

    transacoesFiltradas.forEach((t_row) => {
      const date = formatarDataLocal(t_row.transactionDate);
      const desc = t_row.description || "";
      const cat = categoryMap[t_row.category || "OTHER"][idioma];
      const type = t_row.type === "EXPENSE" ? t.expense : t.income;
      const payment = t_row.card
        ? t_row.card.name || t_row.card.nome
        : t_row.paymentMethod === "PIX"
          ? "Pix"
          : t_row.paymentMethod === "BALANCE"
            ? t.balanceOption
            : t.transferLabel;

      const absAmount = Math.abs(t_row.amount || 0);
      const prefix = t_row.type === "EXPENSE" ? "- " : "+ ";
      const exibe = getValorExibicao(absAmount);
      const val = `${prefix}${exibe.simbolo} ${exibe.valorFormatado}`;

      tableRows.push([date, desc, cat, type, payment, val]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [217, 22, 22] },
    });

    doc.save(`extrato_${mesFiltro}_${anoFiltro}.pdf`);
    showToast("PDF gerado com sucesso!", "success");
  };

  const totalDespesasStats = transacoesFiltradas
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalRendasStats = transacoesFiltradas
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const percentualGasto =
    totalRendasStats > 0 ? (totalDespesasStats / totalRendasStats) * 100 : 0;

  const totalCustosFixos = transacoesFiltradas
    .filter(
      (t) =>
        t.type === "EXPENSE" &&
        (t.category === "SUBSCRIPTION" || t.category === "BILLS"),
    )
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const despesasPorCategoria = transacoesFiltradas
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, curr) => {
        const cat = curr.category || "OTHER";
        acc[cat] = (acc[cat] || 0) + (curr.amount || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

  const pieData = Object.keys(despesasPorCategoria)
    .map((catKey) => {
      const dataCat = categoryMap[catKey] || categoryMap["OTHER"];
      return {
        name: dataCat[idioma],
        value: despesasPorCategoria[catKey],
        color: dataCat.color,
      };
    })
    .sort((a, b) => b.value - a.value);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: theme.bgCard,
            padding: "10px",
            border: `1px solid ${theme.border}`,
            borderRadius: "8px",
            color: theme.textMain,
            boxShadow: theme.shadow,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{payload[0].name}</p>
          <p style={{ margin: "5px 0 0 0", color: theme.red }}>
            {getValorExibicao(payload[0].value).simbolo}{" "}
            {getValorExibicao(payload[0].value).valorFormatado}
          </p>
        </div>
      );
    }
    return null;
  };

  const getPaymentOptions = () => {
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
      cardOptions.sort((a, b) => a.label.localeCompare(b.label, idioma));
    }

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
      cardObj?: Cartao;
      transactions: Transacao[];
    }> = [];

    const cartoesOrdenados = [...cartoes].sort((a, b) => {
      const nomeA = a.nome || a.name || "";
      const nomeB = b.nome || b.name || "";
      return nomeA.localeCompare(nomeB, idioma);
    });

    cartoesOrdenados.forEach((c) => {
      const typeStr = c.type
        ? t.cardTypes[c.type as keyof typeof t.cardTypes]
        : t.cardTypes.CREDIT;
      groupsList.push({
        id: `card-${c.id}`,
        title: c.nome || c.name || "Cartão",
        subtitle: `${typeStr} • ${t.cardEnding} ${c.lastDigits}`,
        icon: "",
        color: "#fff",
        bgColor: c.color || c.cor || "#333",
        isCard: true,
        cardObj: c,
        transactions: [],
      });
    });

    groupsList.push({
      id: "pix",
      title: "Pix",
      subtitle: t.pixSubtitle || "Transferência",
      icon: "⚡",
      color: "#fff",
      bgColor: "#32bcad",
      isCard: false,
      transactions: [],
    });

    groupsList.push({
      id: "balance",
      title: t.balanceOption || "Saldo em Conta",
      subtitle: t.directDebit || "Débito direto",
      icon: "💰",
      color: "#fff",
      bgColor: "#827717",
      isCard: false,
      transactions: [],
    });

    groupsList.push({
      id: "account",
      title: t.transferLabel || "Transferência",
      subtitle: t.tedDoc || "TED/DOC",
      icon: "🏦",
      color: "#fff",
      bgColor: "#0277bd",
      isCard: false,
      transactions: [],
    });

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
      const resposta = await axios.get(`${BASE_URL}/api/v1/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await axios.delete(`${BASE_URL}/api/v1/cards/${id}`, {
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
        `${BASE_URL}/api/v1/cards`,
        {
          name: novoCartaoNome,
          lastDigits: novoCartaoFinal,
          totalLimit: limiteNumerico,
          color: novoCartaoCor,
          closingDate:
            novoCartaoTipo === "CREDIT" ? Number(novoCartaoFechamento) : 1,
          dueDate:
            novoCartaoTipo === "CREDIT" ? Number(novoCartaoVencimento) : 1,
          // Cobrindo possíveis nomenclaturas que o backend espera
          flag: novoCartaoBandeira.toUpperCase(),
          bandeira: novoCartaoBandeira.toUpperCase(),
          brand: novoCartaoBandeira.toUpperCase(),
          type: novoCartaoTipo,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsCardModalOpen(false);
      setNovoCartaoNome("");
      setNovoCartaoFinal("");
      setNovoCartaoLimite("");
      setNovoCartaoCor("#8A05BE");
      setNovoCartaoFechamento("");
      setNovoCartaoVencimento("");
      setNovoCartaoBandeira("MASTERCARD");
      setNovoCartaoTipo("CREDIT");
      await buscarCartoes();
      showToast("Cartão adicionado com sucesso!", "success");
    } catch (erro) {
      console.error("Erro ao criar cartão:", erro);
      showToast("Erro ao salvar o cartão. Verifique os dados.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
            "SUBSCRIPTION",
            "TELEPHONY",
            "DRINK",
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

  const isFormaPagamentoCartao =
    formaPagamento !== "PIX" &&
    formaPagamento !== "ACCOUNT" &&
    formaPagamento !== "BALANCE";

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
        /* Animações Globais Premium */
        @keyframes fadeUp { 
            from { opacity: 0; transform: translateY(15px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideUpToast { 
            from { bottom: -50px; opacity: 0; } 
            to { bottom: 30px; opacity: 1; } 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }

        .fade-in {
            animation: fadeUp 0.4s ease-out forwards;
        }

        /* Campos e Foco Elegante */
        .custom-input, .custom-select {
            transition: all 0.3s ease !important;
        }
        .custom-input:focus, .custom-select:focus {
            border-color: #d91616 !important;
            box-shadow: 0 0 0 3px rgba(217, 22, 22, 0.15) !important;
        }

        /* Ocultar setas em inputs number */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="number"] {
            -moz-appearance: textfield;
        }

        /* Barra de Rolagem Minimalista */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #aaa; }
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
            {t.loading}
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
          <SidebarItem id="statistics" icon="📈" label={t.statistics} />
          <SidebarItem id="statement" icon="📊" label={t.statement} />
          <SidebarItem id="cards" icon="💳" label={t.cards} />
          <SidebarItem id="settings" icon="⚙️" label={t.settings} />
        </ul>

        {deferredPrompt && (
          <div style={{ padding: "1rem" }}>
            <button
              onClick={handleInstallClick}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: theme.highlightBg,
                color: theme.textMain,
                border: `1px solid ${theme.border}`,
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.border)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.highlightBg)
              }
            >
              📲 Instalar App
            </button>
          </div>
        )}
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
        className="fade-in"
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
                    {t.descriptionLabel}
                  </p>
                  <input
                    type="text"
                    required
                    value={novaDescricao}
                    onChange={handleDescricaoChange}
                    className="custom-input"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textMain,
                      outline: "none",
                      fontSize: "0.95rem",
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
                      {t.valueLabel}
                    </p>
                    <input
                      type="text"
                      required
                      value={novoValor}
                      onChange={handleValorChange}
                      className="custom-input"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textMain,
                        outline: "none",
                        textAlign: "left",
                        fontSize: "0.95rem",
                        boxSizing: "border-box",
                        fontWeight: "600",
                        transition: "border-color 0.2s",
                      }}
                    />
                  </div>

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
                      {t.dateLabel}
                    </p>
                    <div
                      className="custom-input"
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
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${
                          isDataPickerOpen ? theme.red : theme.border
                        }`,
                        backgroundColor: theme.inputBg,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.95rem",
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
                        className="fade-in"
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
                                      parseInt(dataTransacao.split("-")[0], 10);
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
                                ❮ {t.back}
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
                                const dataFormatadaStr = `${pickerInsertYear}-${String(
                                  pickerInsertMonth,
                                ).padStart(2, "0")}-${String(dia).padStart(
                                  2,
                                  "0",
                                )}`;
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
                      className="custom-input"
                      onClick={() =>
                        setMenuCategoriaAberto(!menuCategoriaAberto)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${
                          menuCategoriaAberto ? theme.red : theme.border
                        }`,
                        backgroundColor: theme.inputBg,
                        cursor: "pointer",
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
                            fontSize: "0.95rem",
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
                        className="fade-in"
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
                        ? t.paymentHistoryLabel
                        : t.receiptMethodLabel}
                    </p>
                    <div
                      className="custom-input"
                      onClick={() => {
                        setMenuCartaoAberto(!menuCartaoAberto);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${
                          menuCartaoAberto ? theme.red : theme.border
                        }`,
                        backgroundColor: theme.inputBg,
                        cursor: "pointer",
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
                                fontSize: "0.95rem",
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
                                fontSize: "0.95rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {t.transferLabel}
                            </span>
                          </>
                        ) : formaPagamento === "BALANCE" ? (
                          <>
                            <span style={{ fontSize: "1.1rem" }}>💰</span>
                            <span
                              style={{
                                fontSize: "0.95rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {t.balanceOption}
                            </span>
                          </>
                        ) : cartaoSelecionado ? (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "24px",
                                transform: "scale(0.65)",
                              }}
                            >
                              {renderBandeira(cartaoSelecionado)}
                            </div>
                            <span
                              style={{
                                fontSize: "0.95rem",
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
                        className="fade-in"
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

                {isFormaPagamentoCartao &&
                  tipoTransacaoSelecionado === "EXPENSE" && (
                    <div className="fade-in">
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
                        {t.installments}
                      </p>

                      {!isCustomParcela ? (
                        <select
                          className="custom-select"
                          value={parcelas}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setIsCustomParcela(true);
                              setParcelasInput("");
                            } else {
                              setParcelas(Number(e.target.value));
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${theme.border}`,
                            backgroundColor: theme.inputBg,
                            color: theme.textMain,
                            outline: "none",
                            fontSize: "0.95rem",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                          }}
                        >
                          <option value={1}>{t.inCash}</option>
                          {Array.from({ length: 11 }, (_, i) => i + 2).map(
                            (num) => (
                              <option key={num} value={num}>
                                {num}x
                              </option>
                            ),
                          )}
                          <option value="custom">{t.moreOptions}</option>
                        </select>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <input
                            type="number"
                            min="1"
                            max="120"
                            className="custom-input"
                            value={parcelasInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParcelasInput(val);
                              if (val && Number(val) > 0) {
                                setParcelas(Number(val));
                              } else {
                                setParcelas(1);
                              }
                            }}
                            autoFocus
                            style={{
                              width: "100%",
                              padding: "12px 14px",
                              borderRadius: "10px",
                              border: `1px solid ${theme.border}`,
                              backgroundColor: theme.inputBg,
                              color: theme.textMain,
                              outline: "none",
                              fontSize: "0.95rem",
                              boxSizing: "border-box",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomParcela(false);
                              if (!parcelasInput || Number(parcelasInput) < 2)
                                setParcelas(1);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: theme.textMuted,
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              padding: "0 5px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                <button
                  type="submit"
                  style={{
                    marginTop: "10px",
                    padding: "14px 20px",
                    backgroundColor: "#d91616",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "1rem",
                    alignSelf: isMobile ? "stretch" : "center",
                    minWidth: isMobile ? "auto" : "250px",
                    boxShadow: "0 4px 12px rgba(217, 22, 22, 0.2)",
                  }}
                >
                  {t.btnRegister}
                </button>
              </form>
            </div>

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
                            key={`${t_row.id}-${i}`}
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
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      •
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "20px",
                                          transform: "scale(0.55)",
                                        }}
                                      >
                                        {renderBandeira(t_row.card)}
                                      </div>
                                      {t_row.card.name || t_row.card.nome}
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
                                      • 💰 {t.balanceOption}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        color: "#0277bd",
                                        fontWeight: "600",
                                      }}
                                    >
                                      • 🏦 {t.transferLabel}
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
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setEditingTransaction(t_row);
                                    setEditDescricao(t_row.description || "");
                                    setEditValor(
                                      Math.abs(t_row.amount || 0).toString(),
                                    );
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.textMuted,
                                    cursor: "pointer",
                                    fontSize: "1.1rem",
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                      theme.textMain)
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                      theme.textMuted)
                                  }
                                  title="Editar"
                                >
                                  ✏️
                                </button>
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
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = theme.red)
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                      theme.textMuted)
                                  }
                                  title="Excluir"
                                >
                                  ×
                                </button>
                              </div>
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

        {/* ================= ABA 2: ESTATÍSTICAS ================= */}
        {abaAtiva === "statistics" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "2rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                transition: "background-color 0.3s ease",
              }}
            >
              <h2
                style={{
                  color: theme.textMain,
                  margin: "0 0 1.5rem 0",
                  fontSize: "1.3rem",
                }}
              >
                📈 {t.statistics}
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "1.5rem",
                }}
              >
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
                        className="fade-in"
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
                                        setPickerMode("day");
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
                                ❮ {t.back}
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
                              {t.entireMonth}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.inputBg,
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1.5rem 0",
                      color: theme.textMain,
                      fontSize: "1.1rem",
                    }}
                  >
                    🎯 {t.budgetControl}
                  </h3>
                  {totalRendasStats > 0 ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          color: theme.textSec,
                          fontSize: "0.9rem",
                        }}
                      >
                        <span>
                          {t.spentOf.replace(
                            "{0}",
                            `${percentualGasto.toFixed(1)}%`,
                          )}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "12px",
                          backgroundColor: theme.border,
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(percentualGasto, 100)}%`,
                            height: "100%",
                            backgroundColor:
                              percentualGasto > 90
                                ? theme.red
                                : percentualGasto > 70
                                  ? "#fbc02d"
                                  : theme.green,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "1rem",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: theme.textMuted,
                              textTransform: "uppercase",
                            }}
                          >
                            {t.income}
                          </span>
                          <strong style={{ color: theme.green }}>
                            {getValorExibicao(totalRendasStats).simbolo}{" "}
                            {getValorExibicao(totalRendasStats).valorFormatado}
                          </strong>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: theme.textMuted,
                              textTransform: "uppercase",
                            }}
                          >
                            {t.expense}
                          </span>
                          <strong style={{ color: theme.red }}>
                            {getValorExibicao(totalDespesasStats).simbolo}{" "}
                            {
                              getValorExibicao(totalDespesasStats)
                                .valorFormatado
                            }
                          </strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p
                      style={{
                        color: theme.textMuted,
                        fontSize: "0.9rem",
                        textAlign: "center",
                        margin: "2rem 0",
                      }}
                    >
                      {t.noIncome}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: theme.inputBg,
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: theme.textMain,
                      fontSize: "1.1rem",
                    }}
                  >
                    🔁 {t.fixedCostsTitle}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 1rem 0",
                      fontSize: "0.8rem",
                      color: theme.textMuted,
                      textTransform: "uppercase",
                    }}
                  >
                    {t.fixedCostsDesc}
                  </p>
                  <h2
                    style={{
                      margin: "10px 0",
                      fontSize: "1.8rem",
                      color: theme.textMain,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1rem",
                        color: theme.red,
                        marginRight: "4px",
                      }}
                    >
                      {getValorExibicao(totalCustosFixos).simbolo}
                    </span>
                    {getValorExibicao(totalCustosFixos).valorFormatado}
                  </h2>
                  <div
                    style={{
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: theme.textMuted,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{t.annualProjection}</span>
                      <strong style={{ color: theme.textMain }}>
                        {getValorExibicao(totalCustosFixos * 12).simbolo}{" "}
                        {getValorExibicao(totalCustosFixos * 12).valorFormatado}
                      </strong>
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    backgroundColor: theme.inputBg,
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: `1px solid ${theme.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1rem 0",
                      color: theme.textMain,
                      fontSize: "1.1rem",
                      alignSelf: "flex-start",
                    }}
                  >
                    📊 {t.expensesByCategory}
                  </h3>
                  {pieData.length > 0 ? (
                    <div style={{ width: "100%", height: "250px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{
                              fontSize: "0.8rem",
                              color: theme.textMain,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p
                      style={{
                        color: theme.textMuted,
                        fontSize: "0.9rem",
                        textAlign: "center",
                        margin: "auto",
                      }}
                    >
                      {t.emptyChart}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: EXTRATO DETALHADO ================= */}
        {abaAtiva === "statement" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                {/* Coluna da Esquerda (Título e Data) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    alignItems: "flex-start",
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
                          className="fade-in"
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
                                          setPickerMode("day");
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
                                  ❮ {t.back}
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
                                  fontWeight:
                                    diaFiltro === null ? "bold" : "500",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {t.entireMonth}
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

                {/* Coluna da Direita (Pesquisa e Exportar) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="custom-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textMain,
                      outline: "none",
                      fontSize: "0.85rem",
                      minWidth: "150px",
                    }}
                  />

                  <div ref={exportMenuRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: theme.inputBg,
                        color: theme.textMain,
                        border: `1px solid ${
                          isExportMenuOpen ? theme.red : theme.border
                        }`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        !isExportMenuOpen &&
                        (e.currentTarget.style.backgroundColor =
                          theme.highlightBg)
                      }
                      onMouseLeave={(e) =>
                        !isExportMenuOpen &&
                        (e.currentTarget.style.backgroundColor = theme.inputBg)
                      }
                    >
                      📥 {t.export}{" "}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          transform: isExportMenuOpen
                            ? "rotate(180deg)"
                            : "none",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </button>
                    {isExportMenuOpen && (
                      <div
                        className="fade-in"
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "8px",
                          backgroundColor: theme.bgCard,
                          borderRadius: "12px",
                          boxShadow: theme.shadow,
                          border: `1px solid ${theme.border}`,
                          zIndex: 100,
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          minWidth: "160px",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleExportPDF();
                            setIsExportMenuOpen(false);
                          }}
                          style={{
                            padding: "12px 16px",
                            border: "none",
                            background: "transparent",
                            color: theme.textMain,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            borderBottom: `1px solid ${theme.border}`,
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              theme.highlightBg)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          📄 {t.exportPDF}
                        </button>
                        <button
                          onClick={() => {
                            handleExportCSV();
                            setIsExportMenuOpen(false);
                          }}
                          style={{
                            padding: "12px 16px",
                            border: "none",
                            background: "transparent",
                            color: theme.textMain,
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              theme.highlightBg)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          📊 {t.exportCSV}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SE NÃO HOUVER TRANSAÇÕES MOSTRA APENAS "Nenhuma transação." */}
              {transacoesFiltradas.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: theme.textMuted,
                    fontSize: "0.9rem",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {t.noTransactions}
                </p>
              ) : (
                statementGroups.map((group) => {
                  const isExpanded = expandedStatementGroup === group.id;
                  const currentFilter = statementInnerFilter[group.id] || "ALL";

                  const filteredGroupTxs = group.transactions
                    .filter((tx) => {
                      if (currentFilter === "ALL") return true;
                      return tx.type === currentFilter;
                    })
                    .filter((tx) => {
                      if (!searchTerm) return true;
                      const lowerSearch = searchTerm.toLowerCase();
                      return (
                        tx.description?.toLowerCase().includes(lowerSearch) ||
                        tx.amount?.toString().includes(lowerSearch)
                      );
                    });
                  if (filteredGroupTxs.length === 0) return null;

                  const diasAgrupados =
                    agruparTransacoesPorDia(filteredGroupTxs);
                  const totalGastosGrupo = filteredGroupTxs
                    .filter((t_row) => t_row.type === "EXPENSE")
                    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
                  const totalGanhosGrupo = filteredGroupTxs
                    .filter((t_row) => t_row.type === "INCOME")
                    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

                  let saldoGrupo = 0;
                  if (group.isCard)
                    saldoGrupo = totalGastosGrupo - totalGanhosGrupo;
                  else saldoGrupo = totalGanhosGrupo - totalGastosGrupo;

                  const exibeTotal = getValorExibicao(Math.abs(saldoGrupo));
                  const prefixoTotal = saldoGrupo < 0 ? "- " : "";

                  return (
                    <div
                      key={group.id}
                      className="fade-in"
                      style={{ marginBottom: "1rem" }}
                    >
                      <div
                        onClick={() =>
                          setExpandedStatementGroup(
                            isExpanded ? null : group.id,
                          )
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
                          {group.isCard && group.cardObj ? (
                            <div
                              style={{
                                width: "40px",
                                height: "28px",
                                backgroundColor: "#fff",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              }}
                            >
                              <div style={{ transform: "scale(0.6)" }}>
                                {renderBandeira(group.cardObj)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: "1.8rem" }}>
                              {group.icon}
                            </span>
                          )}
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
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "bold",
                              opacity: 0.9,
                            }}
                          >
                            {group.transactions.length} {t.transactionsCount}
                          </span>
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: "bold",
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          >
                            {prefixoTotal}
                            {exibeTotal.simbolo} {exibeTotal.valorFormatado}
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

                      {isExpanded && (
                        <div
                          className="fade-in"
                          style={{
                            backgroundColor: theme.bgCard,
                            padding: "1.5rem",
                            borderRadius: "0 0 16px 16px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            border: `1px solid ${theme.border}`,
                            borderTop: "none",
                            marginTop: "-5px",
                            paddingTop: "20px",
                          }}
                        >
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
                                {t.all}
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
                                {t.received}
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
                                {t.sent}
                              </button>
                            </div>
                          )}

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
                                      const isExpense =
                                        t_row.type === "EXPENSE";
                                      const infoExibicao = getValorExibicao(
                                        Math.abs(t_row.amount || 0),
                                      );
                                      const categoriaVisual =
                                        categoryMap[
                                          t_row.category || "OTHER"
                                        ] || categoryMap["OTHER"];
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
                                          key={`${t_row.id}-${i}`}
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
                                                backgroundColor:
                                                  corDeFundoIcone,
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
                                                      display: "inline-flex",
                                                      alignItems: "center",
                                                      gap: "4px",
                                                    }}
                                                  >
                                                    •
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                        width: "20px",
                                                        transform:
                                                          "scale(0.55)",
                                                      }}
                                                    >
                                                      {renderBandeira(
                                                        t_row.card,
                                                      )}
                                                    </div>
                                                    {t_row.card.name ||
                                                      t_row.card.nome}
                                                  </span>
                                                ) : t_row.paymentMethod ===
                                                  "PIX" ? (
                                                  <span
                                                    style={{
                                                      color: "#32bcad",
                                                      fontWeight: "600",
                                                    }}
                                                  >
                                                    • ⚡ Pix
                                                  </span>
                                                ) : t_row.paymentMethod ===
                                                  "BALANCE" ? (
                                                  <span
                                                    style={{
                                                      color: "#827717",
                                                      fontWeight: "600",
                                                    }}
                                                  >
                                                    • 💰 {t.balanceOption}
                                                  </span>
                                                ) : (
                                                  <span
                                                    style={{
                                                      color: "#0277bd",
                                                      fontWeight: "600",
                                                    }}
                                                  >
                                                    • 🏦 {t.transferLabel}
                                                  </span>
                                                )}
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
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: "8px",
                                                justifyContent: "flex-end",
                                              }}
                                            >
                                              <button
                                                onClick={() => {
                                                  setEditingTransaction(t_row);
                                                  setEditDescricao(
                                                    t_row.description || "",
                                                  );
                                                  setEditValor(
                                                    Math.abs(
                                                      t_row.amount || 0,
                                                    ).toString(),
                                                  );
                                                }}
                                                style={{
                                                  background: "none",
                                                  border: "none",
                                                  color: theme.textMuted,
                                                  cursor: "pointer",
                                                  fontSize: "1.1rem",
                                                  transition: "color 0.2s",
                                                }}
                                                onMouseEnter={(e) =>
                                                  (e.currentTarget.style.color =
                                                    theme.textMain)
                                                }
                                                onMouseLeave={(e) =>
                                                  (e.currentTarget.style.color =
                                                    theme.textMuted)
                                                }
                                                title="Editar"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteTransaction(
                                                    t_row.id,
                                                  )
                                                }
                                                style={{
                                                  background: "none",
                                                  border: "none",
                                                  color: theme.textMuted,
                                                  cursor: "pointer",
                                                  fontSize: "1.2rem",
                                                  transition: "color 0.2s",
                                                }}
                                                onMouseEnter={(e) =>
                                                  (e.currentTarget.style.color =
                                                    theme.red)
                                                }
                                                onMouseLeave={(e) =>
                                                  (e.currentTarget.style.color =
                                                    theme.textMuted)
                                                }
                                                title="Excluir"
                                              >
                                                ×
                                              </button>
                                            </div>
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
                })
              )}
            </div>
          </div>
        )}

        {/* ================= ABA 4: MEUS CARTÕES ================= */}
        {abaAtiva === "cards" && (
          <div
            className="fade-in"
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
                padding: "1.2rem 1.5rem",
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
                style={{
                  color: theme.textMain,
                  margin: 0,
                  fontSize: "1.2rem",
                }}
              >
                💳 {t.cards}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                maxWidth: "750px",
              }}
            >
              {cartoes.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    color: theme.textMuted,
                    padding: "2rem",
                  }}
                >
                  {t.noCardsYet}
                </p>
              )}
              {cartoes.map((cartao) => {
                const limiteDisponivel =
                  cartao.totalLimit - (cartao.currentInvoice || 0);
                const tipoText = cartao.type
                  ? t.cardTypes[cartao.type as keyof typeof t.cardTypes]
                  : t.cardTypes.CREDIT;

                return (
                  <div
                    key={cartao.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "16px",
                      borderRadius: "12px",
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${theme.border}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "46px",
                        height: "32px",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "16px",
                        border: "1px solid #eaeaea",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ transform: "scale(0.65)" }}>
                        {renderBandeira(cartao)}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: theme.textMain,
                          fontSize: "0.95rem",
                        }}
                      >
                        {tipoText} • {cartao.nome || cartao.name}
                      </div>
                      <div
                        style={{
                          color: theme.textMuted,
                          fontSize: "0.85rem",
                          marginTop: "2px",
                        }}
                      >
                         {cartao.lastDigits}
                      </div>

                      {isMobile && cartao.type === "CREDIT" && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: theme.textMuted,
                            marginTop: "6px",
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <span>
                            {t.currentInvoice}:{" "}
                            {
                              getValorExibicao(cartao.currentInvoice || 0)
                                .simbolo
                            }{" "}
                            {
                              getValorExibicao(cartao.currentInvoice || 0)
                                .valorFormatado
                            }
                          </span>
                          <span>
                            {t.availableLimit}:{" "}
                            {getValorExibicao(limiteDisponivel).simbolo}{" "}
                            {getValorExibicao(limiteDisponivel).valorFormatado}
                          </span>
                        </div>
                      )}
                      {isMobile && cartao.type !== "CREDIT" && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: theme.textMuted,
                            marginTop: "6px",
                          }}
                        >
                          <span>
                            {t.initialBalance}:{" "}
                            {getValorExibicao(limiteDisponivel).simbolo}{" "}
                            {getValorExibicao(limiteDisponivel).valorFormatado}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isMobile && (
                      <div style={{ textAlign: "right", marginRight: "20px" }}>
                        {cartao.type === "CREDIT" ? (
                          <>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: theme.textMain,
                                fontWeight: "500",
                              }}
                            >
                              {t.currentInvoice}:{" "}
                              {
                                getValorExibicao(cartao.currentInvoice || 0)
                                  .simbolo
                              }{" "}
                              {
                                getValorExibicao(cartao.currentInvoice || 0)
                                  .valorFormatado
                              }
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: theme.textMuted,
                              }}
                            >
                              {t.availableLimit}:{" "}
                              {getValorExibicao(limiteDisponivel).simbolo}{" "}
                              {
                                getValorExibicao(limiteDisponivel)
                                  .valorFormatado
                              }
                            </div>
                          </>
                        ) : (
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: theme.textMain,
                              fontWeight: "500",
                            }}
                          >
                            {t.initialBalance}:{" "}
                            {getValorExibicao(limiteDisponivel).simbolo}{" "}
                            {getValorExibicao(limiteDisponivel).valorFormatado}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteCartao(cartao.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.textMuted,
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = theme.red)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = theme.textMuted)
                      }
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  setNovoCartaoTipo("CREDIT");
                  setIsCardModalOpen(true);
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginTop: "10px",
                  backgroundColor: "#d91616",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  boxShadow: "0 4px 10px rgba(217,22,22,0.2)",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b71212")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d91616")
                }
              >
                + {t.newCard}
              </button>
            </div>
          </div>
        )}

        {/* ================= ABA 5: CONFIGURAÇÕES ================= */}
        {abaAtiva === "settings" && (
          <div
            className="fade-in"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              style={{
                backgroundColor: theme.bgCard,
                padding: "1.2rem 1.5rem",
                borderRadius: "16px",
                boxShadow: theme.shadow,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "background-color 0.3s ease",
              }}
            >
              <h2
                style={{ color: theme.textMain, margin: 0, fontSize: "1.2rem" }}
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
                  👤 {t.profileTitle}
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
                      {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      className="custom-input"
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
                        opacity: 0.7,
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
                      {t.emailLabel}
                    </label>
                    <input
                      type="text"
                      className="custom-input"
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
                        opacity: 0.7,
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
                      {t.phoneLabel}
                    </label>
                    <input
                      type="text"
                      className="custom-input"
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
                        opacity: 0.7,
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
                  {t.profileDesc}
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
                  🌐 {t.languageTitle}
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
                  {t.languageDesc}
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
                  🌗 {t.appearanceTitle}
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
                      {t.darkModeLabel}
                    </strong>
                    <span
                      style={{ fontSize: "0.8rem", color: theme.textMuted }}
                    >
                      {t.darkModeDesc}
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
                  🔒 {t.securityTitle}
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
                      {t.currentPassword}
                    </label>
                    <input
                      type="password"
                      className="custom-input"
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
                        {t.newPassword}
                      </label>
                      <input
                        type="password"
                        className="custom-input"
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
                        {t.confirmNewPassword}
                      </label>
                      <input
                        type="password"
                        className="custom-input"
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
                    {t.updatePassword}
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
            className="fade-in"
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
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  {t.cardType}
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["CREDIT", "DEBIT", "VR", "VA"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setNovoCartaoTipo(type)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: `1px solid ${
                          novoCartaoTipo === type ? theme.red : theme.border
                        }`,
                        backgroundColor:
                          novoCartaoTipo === type
                            ? theme.highlightBg
                            : theme.inputBg,
                        color:
                          novoCartaoTipo === type ? theme.red : theme.textMain,
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {t.cardTypes[type]}
                    </button>
                  ))}
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
                    textTransform: "uppercase",
                  }}
                >
                  {t.bankName}
                </label>
                <input
                  className="custom-input"
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

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                    fontWeight: "600",
                    marginBottom: "5px",
                    textTransform: "uppercase",
                  }}
                >
                  {t.flagLabel}
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <select
                    className="custom-select"
                    value={novoCartaoBandeira}
                    onChange={(e) => setNovoCartaoBandeira(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textMain,
                      fontSize: "0.95rem",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    {novoCartaoTipo === "CREDIT" ||
                    novoCartaoTipo === "DEBIT" ? (
                      <>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="VISA">Visa</option>
                        <option value="ELO">Elo</option>
                      </>
                    ) : (
                      <>
                        <option value="SODEXO">Sodexo / Pluxee</option>
                        <option value="ALELO">Alelo</option>
                        <option value="TICKET">Ticket</option>
                        <option value="CAJU">Caju</option>
                        <option value="FLASH">Flash</option>
                        <option value="VR">VR Benefícios</option>
                      </>
                    )}
                  </select>
                  <div
                    style={{
                      width: "46px",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      border: `1px solid ${theme.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ transform: "scale(0.65)" }}>
                      {renderBandeira({
                        id: 0,
                        lastDigits: "",
                        totalLimit: 0,
                        currentInvoice: 0,
                        flag: novoCartaoBandeira,
                        type: novoCartaoTipo,
                      } as Cartao)}
                    </div>
                  </div>
                </div>
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
                      textTransform: "uppercase",
                    }}
                  >
                    {t.cardEndingModal}
                  </label>
                  <input
                    className="custom-input"
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
                      textTransform: "uppercase",
                    }}
                  >
                    {novoCartaoTipo === "CREDIT"
                      ? t.totalLimit
                      : t.initialBalance}
                  </label>
                  <input
                    className="custom-input"
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

              {novoCartaoTipo === "CREDIT" && (
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
                        textTransform: "uppercase",
                      }}
                    >
                      {t.closingDay}
                    </label>
                    <input
                      className="custom-input"
                      type="text"
                      maxLength={2}
                      value={novoCartaoFechamento}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 31) val = "31";
                        setNovoCartaoFechamento(val);
                      }}
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
                        textTransform: "uppercase",
                      }}
                    >
                      {t.dueDay}
                    </label>
                    <input
                      className="custom-input"
                      type="text"
                      maxLength={2}
                      value={novoCartaoVencimento}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 31) val = "31";
                        setNovoCartaoVencimento(val);
                      }}
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
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: theme.textMuted,
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
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
                    padding: "12px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {[
                    "#8A05BE",
                    "#EC7000",
                    "#FF7A00",
                    "#F9D308",
                    "#005CA9",
                    "#CC092F",
                    "#242424",
                    "#107c10",
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
                          novoCartaoCor === cor ? "scale(1.15)" : "none",
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

      {/* MODAL: EDITAR TRANSAÇÃO */}
      {editingTransaction && (
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
            className="fade-in"
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
              ✏️ Editar Transação
            </h3>
            <form
              onSubmit={handleEditTransactionSubmit}
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
                    textTransform: "uppercase",
                  }}
                >
                  {t.descriptionLabel}
                </label>
                <input
                  className="custom-input"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
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
                    textTransform: "uppercase",
                  }}
                >
                  {t.valueLabel}
                </label>
                <input
                  className="custom-input"
                  value={editValor}
                  onChange={(e) =>
                    setEditValor(e.target.value.replace(/[^0-9.,]/g, ""))
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
                  onClick={() => setEditingTransaction(null)}
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
