import * as Localization from 'expo-localization';

// Translations dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone',
    createAccount: 'Create Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    allRightsReserved: '© 2025 HAMMR. All rights reserved.',
    
    // Roles
    customer: 'Customer',
    contractor: 'Contractor',
    admin: 'Admin',
    iLookForServices: 'I look for services',
    iOfferServices: 'I offer services',
    howUseHammr: 'How do you want to use HAMMR?',
    
    // Common
    home: 'Home',
    profile: 'Profile',
    myJobs: 'My Jobs',
    jobs: 'Jobs',
    earnings: 'Earnings',
    dashboard: 'Dashboard',
    users: 'Users',
    finance: 'Finance',
    aiTools: 'AI Tools',
    
    // Profile
    editProfile: 'Edit Profile',
    paymentMethods: 'Payment Methods',
    addresses: 'Addresses',
    notifications: 'Notifications',
    helpSupport: 'Help & Support',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    yes: 'Yes',
    
    // Customer
    hello: 'Hello',
    whatServiceNeed: 'What service do you need today?',
    searchServices: 'Search services...',
    featuredServices: 'Featured Services',
    from: 'From',
    requestService: 'Request Service',
    describeJob: 'Describe the job',
    location: 'Location',
    sendRequest: 'Send Request',
    requestSent: 'Request sent! A contractor will contact you soon.',
    
    // Jobs
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    pending: 'Pending',
    noJobs: 'No jobs',
    yourRequestsAppearHere: 'Your requests will appear here',
    budget: 'Budget',
    date: 'Date',
    rateContractor: 'Rate contractor:',
    yourRating: 'Your rating:',
    
    // Contractor
    findAvailableJobs: 'Find available jobs',
    verified: 'Verified',
    noJobsAvailable: 'No jobs available',
    newJobsAppearHere: 'New jobs will appear here',
    commission: 'commission',
    acceptJob: 'Accept Job',
    startJob: 'Start Job',
    markComplete: 'Mark as Complete',
    youWillEarn: "You'll earn",
    hammrCommission: 'HAMMR Commission',
    
    // Earnings
    myEarnings: 'My Earnings',
    totalEarnings: 'Total Earnings',
    completedJobs: 'completed jobs',
    inEscrow: 'In Escrow',
    thisMonth: 'This Month',
    withdrawFunds: 'Withdraw Funds',
    availableForWithdrawal: 'Available for withdrawal:',
    bankTransfer: 'Bank Transfer',
    cash: 'Cash (HAMMR Points)',
    commissionInfo: 'HAMMR charges a 10% commission per completed job. This covers insurance, customer support, and platform maintenance.',
    
    // Admin
    adminPanel: 'Admin Panel',
    controlCenter: 'HAMMR Control Center',
    totalCommissions: 'Total Commissions',
    totalRevenue: 'Total Revenue',
    pendingPayouts: 'Pending Payouts',
    totalUsers: 'Total Users',
    providers: 'Providers',
    clients: 'Clients',
    totalJobs: 'Total Jobs',
    monetizationModel: 'Monetization Model',
    commissions: 'Commissions',
    perJobCompleted: '10% per job completed',
    subscriptions: 'Subscriptions',
    premiumProviders: 'Premium Providers',
    advertising: 'Advertising',
    featuredServicesAd: 'Featured services',
    jobsSummary: 'Jobs Summary',
    inProgress: 'In Progress',
    successRate: 'Success Rate',
    
    // User Management
    userManagement: 'User Management',
    totalUsersCount: 'total users',
    verify: 'Verify',
    block: 'Block',
    blocked: 'Blocked',
    
    // Jobs Monitoring
    jobsMonitoring: 'Jobs Monitoring',
    payment: 'Payment',
    
    // Finance
    financeControl: 'HAMMR Financial Control',
    commissionRevenue: 'Commission Revenue',
    perTransaction: '10% of each completed transaction',
    volumeTotal: 'Total Volume',
    jobStats: 'Job Statistics',
    total: 'Total',
    revenueSources: 'Revenue Sources',
    perJob: 'per job',
    
    // AI Tools
    poweredByGemini: 'Powered by Gemini AI',
    aiPricingEngine: 'AI Pricing Engine',
    calculateFairPrices: 'Calculate fair market prices',
    jobType: 'Job Type',
    complexity: 'Complexity',
    demand: 'Demand',
    calculatePrice: 'Calculate Price',
    basePrice: 'Base Price',
    finalPrice: 'Final Price',
    aiMarketingAssistant: 'AI Marketing Assistant',
    generateAdCopy: 'Generate ad copy with AI',
    targetSegment: 'Target Segment',
    serviceCategory: 'Service Category',
    platform: 'Platform',
    generateCopy: 'Generate Ad Copy',
    generatingWithAI: 'Generating with Gemini AI...',
    generatedAdCopy: 'Generated Ad Copy:',
  },
  es: {
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Email',
    password: 'Contraseña',
    fullName: 'Nombre Completo',
    phone: 'Teléfono',
    createAccount: 'Crear Cuenta',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    signUp: 'Regístrate',
    signIn: 'Inicia Sesión',
    allRightsReserved: '© 2025 HAMMR. Todos los derechos reservados.',
    
    // Roles
    customer: 'Cliente',
    contractor: 'Proveedor',
    admin: 'Admin',
    iLookForServices: 'Busco servicios',
    iOfferServices: 'Ofrezco servicios',
    howUseHammr: '¿Cómo quieres usar HAMMR?',
    
    // Common
    home: 'Inicio',
    profile: 'Perfil',
    myJobs: 'Mis Trabajos',
    jobs: 'Trabajos',
    earnings: 'Ganancias',
    dashboard: 'Panel',
    users: 'Usuarios',
    finance: 'Finanzas',
    aiTools: 'IA Tools',
    
    // Profile
    editProfile: 'Editar Perfil',
    paymentMethods: 'Métodos de Pago',
    addresses: 'Direcciones',
    notifications: 'Notificaciones',
    helpSupport: 'Ayuda y Soporte',
    termsConditions: 'Términos y Condiciones',
    privacyPolicy: 'Política de Privacidad',
    logout: 'Cerrar Sesión',
    logoutConfirm: '¿Estás seguro de que quieres salir?',
    cancel: 'Cancelar',
    yes: 'Sí',
    
    // Customer
    hello: 'Hola',
    whatServiceNeed: '¿Qué servicio necesitas hoy?',
    searchServices: 'Buscar servicios...',
    featuredServices: 'Servicios Destacados',
    from: 'Desde',
    requestService: 'Solicitar Servicio',
    describeJob: 'Describe el trabajo',
    location: 'Ubicación',
    sendRequest: 'Enviar Solicitud',
    requestSent: '¡Solicitud enviada! Un proveedor te contactará pronto.',
    
    // Jobs
    all: 'Todos',
    active: 'Activos',
    completed: 'Completados',
    pending: 'Pendientes',
    noJobs: 'No hay trabajos',
    yourRequestsAppearHere: 'Tus solicitudes aparecerán aquí',
    budget: 'Presupuesto',
    date: 'Fecha',
    rateContractor: 'Califica al proveedor:',
    yourRating: 'Tu calificación:',
    
    // Contractor
    findAvailableJobs: 'Encuentra trabajos disponibles',
    verified: 'Verificado',
    noJobsAvailable: 'No hay trabajos disponibles',
    newJobsAppearHere: 'Nuevos trabajos aparecerán aquí',
    commission: 'comisión',
    acceptJob: 'Aceptar Trabajo',
    startJob: 'Iniciar Trabajo',
    markComplete: 'Marcar como Completado',
    youWillEarn: 'Ganarás',
    hammrCommission: 'Comisión HAMMR',
    
    // Earnings
    myEarnings: 'Mis Ganancias',
    totalEarnings: 'Ganancias Totales',
    completedJobs: 'trabajos completados',
    inEscrow: 'En Escrow',
    thisMonth: 'Este Mes',
    withdrawFunds: 'Retiro de Fondos',
    availableForWithdrawal: 'Disponible para retiro:',
    bankTransfer: 'Transferencia Bancaria',
    cash: 'Efectivo (Puntos HAMMR)',
    commissionInfo: 'HAMMR cobra una comisión del 10% por cada trabajo completado. Esta comisión cubre el seguro, soporte al cliente y mantenimiento de la plataforma.',
    
    // Admin
    adminPanel: 'Panel Admin',
    controlCenter: 'Centro de Control HAMMR',
    totalCommissions: 'Comisiones Totales',
    totalRevenue: 'Ingresos Totales',
    pendingPayouts: 'Pagos Pendientes',
    totalUsers: 'Total Usuarios',
    providers: 'Proveedores',
    clients: 'Clientes',
    totalJobs: 'Total Trabajos',
    monetizationModel: 'Modelo de Monetización',
    commissions: 'Comisiones',
    perJobCompleted: '10% por trabajo completado',
    subscriptions: 'Suscripciones',
    premiumProviders: 'Proveedores Premium',
    advertising: 'Publicidad',
    featuredServicesAd: 'Servicios destacados',
    jobsSummary: 'Resumen de Trabajos',
    inProgress: 'En Progreso',
    successRate: 'Tasa Éxito',
    
    // User Management
    userManagement: 'Gestión de Usuarios',
    totalUsersCount: 'usuarios totales',
    verify: 'Verificar',
    block: 'Bloquear',
    blocked: 'Bloqueado',
    
    // Jobs Monitoring
    jobsMonitoring: 'Monitoreo de Trabajos',
    payment: 'Pago',
    
    // Finance
    financeControl: 'Control financiero de HAMMR',
    commissionRevenue: 'Ingresos por Comisiones',
    perTransaction: '10% de cada transacción completada',
    volumeTotal: 'Volumen Total',
    jobStats: 'Estadísticas de Trabajos',
    total: 'Total',
    revenueSources: 'Fuentes de Ingresos',
    perJob: 'por trabajo',
    
    // AI Tools
    poweredByGemini: 'Powered by Gemini AI',
    aiPricingEngine: 'Motor de Precios IA',
    calculateFairPrices: 'Calcula precios justos de mercado',
    jobType: 'Tipo de Trabajo',
    complexity: 'Complejidad',
    demand: 'Demanda',
    calculatePrice: 'Calcular Precio',
    basePrice: 'Precio Base',
    finalPrice: 'Precio Final',
    aiMarketingAssistant: 'Asistente de Marketing IA',
    generateAdCopy: 'Genera textos publicitarios con IA',
    targetSegment: 'Segmento Objetivo',
    serviceCategory: 'Categoría de Servicio',
    platform: 'Plataforma',
    generateCopy: 'Generar Texto',
    generatingWithAI: 'Generando con Gemini AI...',
    generatedAdCopy: 'Texto Generado:',
  },
};

// Get device locale
const getDeviceLocale = (): string => {
  try {
    const locale = Localization.locale || 'en';
    const lang = locale.split('-')[0];
    return translations[lang] ? lang : 'en';
  } catch {
    return 'en';
  }
};

// Current language
let currentLanguage = getDeviceLocale();

export const setLanguage = (lang: string) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

export const getLanguage = () => currentLanguage;

export const t = (key: string): string => {
  return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
};

export default { t, setLanguage, getLanguage };
