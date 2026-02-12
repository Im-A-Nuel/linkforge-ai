'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@/components/connect-wallet';
import { config } from '@/lib/config';

const topLinks = [
  { href: '#hero', key: 'home' },
  { href: '#how-it-works', key: 'howItWorks' },
  { href: '#demo', key: 'demo' },
  { href: '#about', key: 'about' },
  { href: '#join', key: 'join' },
] as const;

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Mandarin (中文)' },
  { value: 'de', label: 'Deutsch' },
  { value: 'id', label: 'Bahasa Indonesia' },
] as const;

const translations = {
  en: {
    languageLabel: 'Language',
    nav: { home: 'Home', howItWorks: 'How It Works', demo: 'Demo', about: 'About', join: 'Join' },
    auth: { login: 'Log in', viewDemo: 'View Demo' },
    hero: {
      line1: 'The clean desk for',
      line2: 'active treasury,',
      line3: 'fast and',
      highlight: 'auditable',
      desc: 'An AI platform for crypto portfolio management: sentiment analytics, risk control, and rebalance flows verifiable on-chain with Chainlink oracle data.',
      primaryCta: 'Start Building',
      secondaryCta: 'Open Demo',
      trusted: 'Built for crypto treasury teams and active investors',
      sideBadge: 'Monitor fast, hedge clean',
      bubble1: 'How soon can we execute this rebalance?',
      bubble2a: 'Confirmed.',
      bubble2b: 'Gas is low, execute in 4 min.',
      bubble3: 'Perfect. Push it now.',
    },
    chips: [
      'Instant oracle-backed market snapshots',
      'Auto alerting for risk, slippage, and volatility',
      'Daily execution digest for finance and ops',
    ],
    ribbon: 'Live analytics * Instant rebalance * Cleaner execution * On-chain audit * ',
    how: {
      eyebrow: 'How It Works',
      title: 'From on-chain data to portfolio action',
      cta: 'Explore Full Dashboard',
      steps: [
        { title: 'Connect Your Wallet', desc: 'Connect your wallet, sync on-chain balances, and map portfolio allocations in one workspace.' },
        { title: 'Set AI Rules', desc: 'Define risk profile, rebalance limits, and ESG priority so automation follows your mandate.' },
        { title: 'Execute with Proof', desc: 'Execute with Chainlink-backed signals and store each decision in an auditable on-chain trail.' },
      ],
    },
    demo: {
      eyebrow: 'Demo',
      title: 'See the full analysis-to-execution flow',
      desc: 'This demo shows the LinkForge AI pipeline: market ingestion, risk scoring, rebalance recommendation, and fully traceable transaction logs.',
      items: [
        'Real-time sentiment and volatility signals',
        'AI recommendation for rebalance direction',
        'Execution log with on-chain transaction trace',
        'Risk and ESG profile history per strategy',
      ],
      primaryCta: 'Open Interactive Demo',
      secondaryCta: 'Configure Strategy',
      panel: {
        title: 'Live Signals', syncing: 'Syncing...', offline: 'Offline', synced: 'Synced',
        sentiment: 'Sentiment Score', risk: 'Risk Level', action: 'Rebalance Action',
        esg: 'ESG Score', counterparties: 'Counterparties', source: 'Demo source',
        na: 'N/A', connectBackend: 'Connect backend to view action',
        bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral',
        riskLow: 'Low', riskMedium: 'Medium', riskHigh: 'High',
        recReduce: 'Reduce exposure and move part to stable assets',
        recIncrease: 'Increase growth allocation gradually',
        recPause: 'Pause buy-side and rebalance defensively',
        recHold: 'Hold allocation and monitor next signal window',
      },
    },
    join: {
      eyebrow: 'Join LinkForge AI',
      title: 'Ready to run portfolio automation with full accountability?',
      desc: 'Start by connecting your wallet, review your risk profile, and launch the demo. Every decision stays traceable for your team and audit process.',
      cta: 'Go to Dashboard',
    },
  },
  zh: {
    languageLabel: '语言',
    nav: { home: '首页', howItWorks: '工作方式', demo: '演示', about: '关于', join: '加入' },
    auth: { login: '登录', viewDemo: '查看演示' },
    hero: {
      line1: '为活跃金库打造',
      line2: '清晰控制台，',
      line3: '快速且',
      highlight: '可审计',
      desc: '用于加密投资组合管理的 AI 平台：情绪分析、风险控制与再平衡，并通过 Chainlink 预言机数据实现链上可验证。',
      primaryCta: '立即开始', secondaryCta: '打开演示',
      trusted: '面向加密金库团队与主动型投资者', sideBadge: '快速监控，稳健对冲',
      bubble1: '这次再平衡多久可以执行？', bubble2a: '已确认。', bubble2b: 'Gas 较低，4 分钟可执行。', bubble3: '很好，马上执行。',
    },
    chips: ['即时预言机市场快照', '自动风险、滑点与波动预警', '面向财务与运营的每日执行摘要'],
    ribbon: '实时分析 * 即时再平衡 * 更清晰执行 * 链上审计 * ',
    how: {
      eyebrow: '工作方式', title: '从链上数据到投资动作', cta: '查看完整仪表盘',
      steps: [
        { title: '连接钱包', desc: '连接钱包，同步链上余额，并在一个工作区内映射投资组合分配。' },
        { title: '设置 AI 规则', desc: '定义风险偏好、再平衡阈值与 ESG 优先级，让自动化遵循你的策略。' },
        { title: '可证明执行', desc: '基于 Chainlink 信号执行，并把每次决策保存为可审计的链上记录。' },
      ],
    },
    demo: {
      eyebrow: '演示', title: '查看从分析到执行的完整流程',
      desc: '演示包含 LinkForge AI 全流程：市场数据接入、风险评分、再平衡建议与可追踪交易日志。',
      items: ['实时情绪与波动信号', 'AI 再平衡方向建议', '带链上交易追踪的执行日志', '按策略记录风险与 ESG 历史'],
      primaryCta: '打开交互演示', secondaryCta: '配置策略',
      panel: {
        title: '实时信号', syncing: '同步中...', offline: '离线', synced: '已同步',
        sentiment: '情绪评分', risk: '风险等级', action: '再平衡动作',
        esg: 'ESG 评分', counterparties: '交易对手数量', source: '演示数据源',
        na: '不可用', connectBackend: '连接后端以查看建议',
        bullish: '看涨', bearish: '看跌', neutral: '中性',
        riskLow: '低', riskMedium: '中', riskHigh: '高',
        recReduce: '降低敞口并将部分仓位转为稳定资产',
        recIncrease: '逐步提高增长型资产配置',
        recPause: '暂停买入并采取防御性再平衡',
        recHold: '保持当前配置并观察下一信号窗口',
      },
    },
    join: {
      eyebrow: '加入 LinkForge AI',
      title: '准备好用可追踪的方式自动化投资组合了吗？',
      desc: '先连接钱包，检查风险档位并启动演示。每次决策都可被团队与审计流程追踪。',
      cta: '进入仪表盘',
    },
  },
  de: {
    languageLabel: 'Sprache',
    nav: { home: 'Start', howItWorks: 'Ablauf', demo: 'Demo', about: 'Über uns', join: 'Mitmachen' },
    auth: { login: 'Anmelden', viewDemo: 'Demo ansehen' },
    hero: {
      line1: 'Das klare Cockpit für',
      line2: 'aktive Treasury-Teams,',
      line3: 'schnell und',
      highlight: 'auditierbar',
      desc: 'Eine KI-Plattform für Krypto-Portfolio-Management: Sentiment-Analyse, Risikokontrolle und Rebalancing mit on-chain verifizierbaren Chainlink-Orakeldaten.',
      primaryCta: 'Jetzt starten', secondaryCta: 'Demo öffnen',
      trusted: 'Für Krypto-Treasury-Teams und aktive Investoren gebaut', sideBadge: 'Schnell überwachen, sauber absichern',
      bubble1: 'Wie schnell können wir dieses Rebalancing ausführen?', bubble2a: 'Bestätigt.', bubble2b: 'Gas ist niedrig, Ausführung in 4 Minuten.', bubble3: 'Perfekt. Jetzt ausführen.',
    },
    chips: ['Sofortige, oracle-gestützte Markt-Snapshots', 'Automatische Alerts für Risiko, Slippage und Volatilität', 'Täglicher Ausführungsbericht für Finance und Ops'],
    ribbon: 'Live-Analytik * Sofortiges Rebalancing * Saubere Ausführung * On-chain Audit * ',
    how: {
      eyebrow: 'Ablauf', title: 'Von On-chain-Daten zur Portfolio-Aktion', cta: 'Vollständiges Dashboard ansehen',
      steps: [
        { title: 'Wallet verbinden', desc: 'Wallet verbinden, On-chain-Salden synchronisieren und Portfolio-Allokationen zentral abbilden.' },
        { title: 'KI-Regeln festlegen', desc: 'Risikoprofil, Rebalancing-Grenzen und ESG-Priorität definieren, damit die Automatisierung deinem Mandat folgt.' },
        { title: 'Mit Nachweis ausführen', desc: 'Mit Chainlink-Signalen ausführen und jede Entscheidung als auditierbare On-chain-Spur speichern.' },
      ],
    },
    demo: {
      eyebrow: 'Demo', title: 'Den kompletten Analyse-bis-Ausführung-Flow sehen',
      desc: 'Die Demo zeigt die LinkForge-AI-Pipeline: Marktdaten, Risk Scoring, Rebalancing-Empfehlung und vollständig nachvollziehbare Transaktionslogs.',
      items: ['Sentiment- und Volatilitätssignale in Echtzeit', 'KI-Empfehlung für die Rebalancing-Richtung', 'Execution-Log mit On-chain-Transaktionsnachweis', 'Risiko- und ESG-Historie je Strategie'],
      primaryCta: 'Interaktive Demo öffnen', secondaryCta: 'Strategie konfigurieren',
      panel: {
        title: 'Live-Signale', syncing: 'Synchronisiert...', offline: 'Offline', synced: 'Synchron',
        sentiment: 'Sentiment-Score', risk: 'Risikostufe', action: 'Rebalancing-Aktion',
        esg: 'ESG-Score', counterparties: 'Gegenparteien', source: 'Demo-Quelle',
        na: 'k. A.', connectBackend: 'Backend verbinden, um Aktion zu sehen',
        bullish: 'Bullisch', bearish: 'Bärisch', neutral: 'Neutral',
        riskLow: 'Niedrig', riskMedium: 'Mittel', riskHigh: 'Hoch',
        recReduce: 'Exposition reduzieren und teilweise in Stable Assets wechseln',
        recIncrease: 'Wachstumsallokation schrittweise erhöhen',
        recPause: 'Käufe pausieren und defensiv rebalancieren',
        recHold: 'Allokation halten und nächstes Signalfenster beobachten',
      },
    },
    join: {
      eyebrow: 'LinkForge AI beitreten',
      title: 'Bereit für Portfolio-Automation mit voller Nachvollziehbarkeit?',
      desc: 'Wallet verbinden, Risikoprofil prüfen und Demo starten. Jede Entscheidung bleibt für Team und Audit nachvollziehbar.',
      cta: 'Zum Dashboard',
    },
  },
  id: {
    languageLabel: 'Bahasa',
    nav: { home: 'Beranda', howItWorks: 'Cara Kerja', demo: 'Demo', about: 'Tentang', join: 'Gabung' },
    auth: { login: 'Masuk', viewDemo: 'Lihat Demo' },
    hero: {
      line1: 'Control desk yang rapi untuk',
      line2: 'treasury aktif,',
      line3: 'cepat dan',
      highlight: 'auditable',
      desc: 'Platform AI untuk manajemen portfolio kripto: analisis sentimen, kontrol risiko, dan rebalance yang bisa diverifikasi on-chain dengan data oracle Chainlink.',
      primaryCta: 'Mulai Bangun', secondaryCta: 'Buka Demo',
      trusted: 'Dibangun untuk tim treasury kripto dan investor aktif', sideBadge: 'Monitor cepat, hedge lebih bersih',
      bubble1: 'Seberapa cepat rebalance ini bisa dieksekusi?', bubble2a: 'Terkonfirmasi.', bubble2b: 'Gas sedang rendah, eksekusi dalam 4 menit.', bubble3: 'Sip. Langsung jalankan.',
    },
    chips: ['Snapshot pasar instan berbasis oracle', 'Peringatan otomatis untuk risiko, slippage, dan volatilitas', 'Ringkasan eksekusi harian untuk finance dan ops'],
    ribbon: 'Analitik live * Rebalance instan * Eksekusi lebih bersih * Audit on-chain * ',
    how: {
      eyebrow: 'Cara Kerja', title: 'Dari data on-chain ke aksi portfolio', cta: 'Lihat Dashboard Lengkap',
      steps: [
        { title: 'Hubungkan Wallet', desc: 'Hubungkan wallet, sinkronkan saldo on-chain, dan petakan alokasi portfolio dalam satu workspace.' },
        { title: 'Set Aturan AI', desc: 'Atur profil risiko, batas rebalance, dan prioritas ESG agar automasi mengikuti mandat strategi kamu.' },
        { title: 'Eksekusi dengan Bukti', desc: 'Eksekusi dengan sinyal berbasis Chainlink lalu simpan tiap keputusan sebagai jejak audit on-chain.' },
      ],
    },
    demo: {
      eyebrow: 'Demo', title: 'Lihat alur lengkap dari analisis ke eksekusi',
      desc: 'Demo menampilkan pipeline LinkForge AI: ingest data pasar, kalkulasi risk score, rekomendasi rebalance, dan log transaksi yang bisa ditelusuri penuh.',
      items: ['Sinyal sentimen dan volatilitas real-time', 'Rekomendasi AI untuk arah rebalance', 'Log eksekusi dengan jejak transaksi on-chain', 'Riwayat profil risiko dan ESG per strategi'],
      primaryCta: 'Buka Demo Interaktif', secondaryCta: 'Atur Strategi',
      panel: {
        title: 'Sinyal Live', syncing: 'Menyinkronkan...', offline: 'Offline', synced: 'Tersinkron',
        sentiment: 'Skor Sentimen', risk: 'Level Risiko', action: 'Aksi Rebalance',
        esg: 'Skor ESG', counterparties: 'Jumlah Counterparty', source: 'Sumber demo',
        na: 'N/A', connectBackend: 'Hubungkan backend untuk melihat aksi',
        bullish: 'Bullish', bearish: 'Bearish', neutral: 'Netral',
        riskLow: 'Rendah', riskMedium: 'Sedang', riskHigh: 'Tinggi',
        recReduce: 'Kurangi eksposur dan pindahkan sebagian ke aset stabil',
        recIncrease: 'Naikkan alokasi growth secara bertahap',
        recPause: 'Tunda aksi beli dan rebalance defensif',
        recHold: 'Tahan alokasi dan pantau window sinyal berikutnya',
      },
    },
    join: {
      eyebrow: 'Gabung LinkForge AI',
      title: 'Siap jalankan automasi portfolio yang terukur dan transparan?',
      desc: 'Mulai dari koneksi wallet, cek profil risiko, lalu jalankan demo. Semua keputusan tetap bisa ditelusuri untuk tim dan audit.',
      cta: 'Masuk ke Dashboard',
    },
  },
} as const;

type Language = keyof typeof translations;

const DEMO_ASSET = 'ETH';
const DEMO_FALLBACK_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

type SentimentData = { asset: string; sentiment: number; confidence: number; timestamp: string };
type RiskData = {
  address: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: { transactionVolume: number; uniqueCounterparties: number; suspiciousActivity: boolean };
  timestamp: string;
};
type ESGData = {
  asset: string;
  score: number;
  category: 'green' | 'neutral' | 'brown';
  metrics: { environmental: number; social: number; governance: number };
  timestamp: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

function getSentimentDirection(sentiment: number | undefined, t: (typeof translations)[Language]) {
  if ((sentiment ?? 0) > 0.2) return t.demo.panel.bullish;
  if ((sentiment ?? 0) < -0.2) return t.demo.panel.bearish;
  return t.demo.panel.neutral;
}

function getRiskTone(riskLevel: RiskData['riskLevel'] | undefined, t: (typeof translations)[Language]) {
  if (riskLevel === 'low') return t.demo.panel.riskLow;
  if (riskLevel === 'high') return t.demo.panel.riskHigh;
  return t.demo.panel.riskMedium;
}

function getRecommendation(sentiment: number | undefined, riskLevel: RiskData['riskLevel'] | undefined, esgScore: number | undefined, t: (typeof translations)[Language]) {
  if (riskLevel === 'high') return t.demo.panel.recReduce;
  if ((sentiment ?? 0) > 0.4 && (esgScore ?? 0) >= 60) return t.demo.panel.recIncrease;
  if ((sentiment ?? 0) < -0.2) return t.demo.panel.recPause;
  return t.demo.panel.recHold;
}

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const t = translations[language];
  const connectLabel =
    language === 'zh'
      ? '连接'
      : language === 'de'
        ? 'Verbinden'
        : language === 'id'
          ? 'Hubungkan'
          : 'Connect';

  const { address } = useAccount();
  const walletAddress = address ?? DEMO_FALLBACK_ADDRESS;

  const sentimentQuery = useQuery({
    queryKey: ['landing-demo-sentiment', DEMO_ASSET],
    queryFn: () => fetchJson<SentimentData>(`${config.backendUrl}/api/sentiment?asset=${DEMO_ASSET}`),
    refetchInterval: 30000,
  });

  const riskQuery = useQuery({
    queryKey: ['landing-demo-risk', walletAddress],
    queryFn: () => fetchJson<RiskData>(`${config.backendUrl}/api/wallet-risk?address=${walletAddress}`),
    refetchInterval: 30000,
  });

  const esgQuery = useQuery({
    queryKey: ['landing-demo-esg', DEMO_ASSET],
    queryFn: () => fetchJson<ESGData>(`${config.backendUrl}/api/esg-score?asset=${DEMO_ASSET}`),
    refetchInterval: 30000,
  });

  const isDemoLoading = sentimentQuery.isLoading || riskQuery.isLoading || esgQuery.isLoading;
  const isDemoError = sentimentQuery.isError || riskQuery.isError || esgQuery.isError;

  const normalizedSentiment = sentimentQuery.data
    ? Math.round(((sentimentQuery.data.sentiment + 1) / 2) * 100)
    : 0;

  const sentimentDirection = getSentimentDirection(sentimentQuery.data?.sentiment, t);
  const recommendation = getRecommendation(sentimentQuery.data?.sentiment, riskQuery.data?.riskLevel, esgQuery.data?.score, t);

  return (
    <div className="bg-[#ececec] text-[#121212]">
      <section className="relative overflow-x-clip">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#1f6fff]/10 blur-3xl" />
          <div className="absolute right-10 top-40 h-64 w-64 rounded-full bg-[#ffcd4d]/20 blur-3xl" />
        </div>

        <header className="relative z-20">
          <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-6 py-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1f6fff] text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 3L4 14h7v7l9-11h-7V3z" />
                </svg>
              </span>
              <span className="text-3xl font-extrabold tracking-tight">linkforge</span>
            </Link>

            <nav className="hidden items-center gap-10 text-[17px] font-medium text-[#444] lg:flex">
              {topLinks.map((item) => (
                <Link key={item.key} href={item.href} className="transition-colors hover:text-[#1f6fff]">
                  {t.nav[item.key as keyof typeof t.nav]}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-lg transition-all hover:border-blue-500 hover:shadow-md"
                >
                  {language === 'en' && '🇬🇧'}
                  {language === 'zh' && '🇨🇳'}
                  {language === 'de' && '🇩🇪'}
                  {language === 'id' && '🇮🇩'}
                </button>

                {showLanguageMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowLanguageMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                      {languageOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setLanguage(option.value as Language);
                            setShowLanguageMenu(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                            language === option.value
                              ? 'bg-blue-50 text-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-xl">
                            {option.value === 'en' && '🇬🇧'}
                            {option.value === 'zh' && '🇨🇳'}
                            {option.value === 'de' && '🇩🇪'}
                            {option.value === 'id' && '🇮🇩'}
                          </span>
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <ConnectWallet label={connectLabel} />
            </div>
          </div>
        </header>

        <main id="hero" className="relative z-10 mx-auto grid w-full max-w-[1220px] gap-16 px-6 pb-28 pt-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <section className="animate-rise-up">
            <h1 className="max-w-[650px] text-[clamp(2.7rem,6vw,5.8rem)] font-black leading-[0.98] tracking-[-0.03em]">
              <span className="block">{t.hero.line1}</span>
              <span className="block">{t.hero.line2}</span>
              <span className="mt-3 inline-flex items-center gap-3">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#2b68ff] text-white md:h-16 md:w-16">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 3L4 14h7v7l9-11h-7V3z" />
                  </svg>
                </span>
                <span>{t.hero.line3}</span>
              </span>
              <span className="mt-4 inline-block rounded-xl bg-[#1f6fff] px-5 py-2.5 text-white">{t.hero.highlight}</span>
            </h1>

            <p className="mt-8 max-w-[640px] text-lg font-medium leading-relaxed text-[#565656] md:text-2xl">{t.hero.desc}</p>

            <div className="mt-10">
              <p className="text-lg font-semibold text-[#2b68ff] md:text-xl">
                {language === 'en' && '→ Ready to automate your portfolio with AI-powered insights?'}
                {language === 'zh' && '→ 准备好用 AI 驱动的洞察自动化您的投资组合了吗？'}
                {language === 'de' && '→ Bereit, Ihr Portfolio mit KI-gestützten Insights zu automatisieren?'}
                {language === 'id' && '→ Siap otomasi portfolio Anda dengan insight berbasis AI?'}
              </p>
              <Link href="#demo" className="mt-4 inline-block rounded-full bg-[#e5e5e5] px-7 py-3.5 text-xl font-semibold text-[#222] transition-colors hover:bg-[#dadada]">
                {t.hero.secondaryCta}
              </Link>
            </div>

            <div id="about" className="mt-9 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ececec] bg-[#f5a05f] text-xs font-bold text-white">AR</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ececec] bg-[#1f6fff] text-xs font-bold text-white">LN</span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ececec] bg-[#111827] text-xs font-bold text-white">TX</span>
              </div>
              <p className="text-lg leading-tight text-[#2f2f2f] md:text-2xl">{t.hero.trusted}</p>
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-[560px] lg:pl-4">
            <div className="pointer-events-none absolute -right-7 top-12 z-20 hidden rotate-[7deg] rounded-lg bg-[#1f6fff] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(31,111,255,0.32)] lg:block">
              {t.hero.sideBadge}
            </div>

            <div className="relative overflow-hidden rounded-[42px] border border-white/90 bg-[#f7f7f7] p-5 shadow-[0_24px_46px_rgba(0,0,0,0.13)] md:p-6">
              <div className="relative h-[510px] overflow-hidden rounded-[36px] bg-[#f9f2cb] ring-1 ring-white/70">
                <div
                  className="absolute inset-x-8 bottom-0 top-24 rounded-t-[280px] opacity-90"
                  style={{ background: 'repeating-radial-gradient(circle at 50% 100%, #e8bf3f 0 13px, #f8ebbc 13px 26px)' }}
                />

                <Image
                  src="/hero-analyst.jpg"
                  alt="Analyst reviewing LinkForge signals"
                  width={420}
                  height={560}
                  className="absolute bottom-0 left-1/2 h-[470px] w-[335px] -translate-x-1/2 rounded-b-[26px] object-cover object-center"
                  priority
                />

                <div className="animate-float-soft absolute left-1/2 top-14 z-10 w-[85%] max-w-[420px] -translate-x-1/2 rounded-2xl bg-white px-4 py-3 text-[15px] font-semibold leading-snug text-[#252525] shadow-[0_12px_25px_rgba(0,0,0,0.14)] md:text-[18px]">
                  {t.hero.bubble1}
                </div>

                <div className="animate-float-chat absolute bottom-36 left-5 z-10 max-w-[78%] rounded-2xl bg-[#1f6fff] px-4 py-3 text-[15px] font-semibold leading-snug text-white shadow-[0_10px_24px_rgba(31,111,255,0.42)] md:text-[18px]">
                  {t.hero.bubble2a}
                  <br />
                  {t.hero.bubble2b}
                </div>

                <div className="absolute bottom-12 right-5 z-10 max-w-[65%] rounded-2xl bg-white px-4 py-3 text-[15px] font-semibold leading-snug text-[#252525] shadow-[0_12px_25px_rgba(0,0,0,0.14)] md:text-[18px]">
                  {t.hero.bubble3}
                </div>
              </div>
            </div>
          </section>
        </main>

        <section className="relative z-10 mx-auto mb-12 flex w-full max-w-[1220px] flex-wrap gap-4 px-6 text-[#2e2e2e]">
          {t.chips.map((chip) => (
            <div key={chip} className="rounded-2xl bg-white/75 px-5 py-4 text-sm font-semibold">{chip}</div>
          ))}
        </section>

        <div className="pointer-events-none relative z-10 overflow-hidden">
          <svg viewBox="0 0 1440 200" className="h-auto w-full" preserveAspectRatio="none">
            {/* Clean wave shape */}
            <path
              d="M0,100 C240,50 480,150 720,100 C960,50 1200,150 1440,100 L1440,200 L0,200 Z"
              fill="#2b68ff"
            />

            {/* Subtle decorative elements */}
            <g opacity="0.15">
              <circle cx="200" cy="120" r="80" fill="white" />
              <circle cx="700" cy="80" r="60" fill="white" />
              <circle cx="1200" cy="110" r="70" fill="white" />
            </g>

            {/* Text on wave - cleaner approach */}
            <text
              x="50%"
              y="140"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="700"
              letterSpacing="4"
              className="uppercase"
            >
              {t.ribbon.split('*')[0].trim()} • {t.ribbon.split('*')[1]?.trim()} • {t.ribbon.split('*')[2]?.trim()}
            </text>
          </svg>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden bg-white py-20">
        {/* Dot Pattern - Right Side Only */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
            <defs>
              {/* Dot pattern */}
              <pattern id="dotPatternBlue" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#4A90E2" />
              </pattern>

              {/* Organic shape masks */}
              <mask id="organicShape1">
                <ellipse cx="400" cy="100" rx="180" ry="240" fill="white" transform="rotate(-20 400 100)" />
              </mask>
              <mask id="organicShape2">
                <ellipse cx="500" cy="320" rx="220" ry="280" fill="white" transform="rotate(15 500 320)" />
              </mask>
              <mask id="organicShape3">
                <ellipse cx="350" cy="480" rx="160" ry="200" fill="white" transform="rotate(-30 350 480)" />
              </mask>
            </defs>

            {/* Apply dot pattern with organic masks */}
            <rect width="100%" height="100%" fill="url(#dotPatternBlue)" mask="url(#organicShape1)" opacity="0.3" />
            <rect width="100%" height="100%" fill="url(#dotPatternBlue)" mask="url(#organicShape2)" opacity="0.25" />
            <rect width="100%" height="100%" fill="url(#dotPatternBlue)" mask="url(#organicShape3)" opacity="0.2" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1220px] px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2b68ff]">{t.how.eyebrow}</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{t.how.title}</h2>
            </div>
            <Link href="/dashboard" className="hidden rounded-full border border-[#b9c9ff] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f57de] md:inline-flex">
              {t.how.cta}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {t.how.steps.map((step, index) => (
              <article key={step.title} className="rounded-3xl border border-[#dfdfdf] bg-white p-7 shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1">
                <p className="text-sm font-bold tracking-[0.08em] text-[#2b68ff]">STEP {String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 text-2xl font-extrabold leading-tight">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[#4b5563]">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="demo" className="bg-[#e7ebfb] py-20">
        <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2b68ff]">{t.demo.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{t.demo.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[#4b5563]">{t.demo.desc}</p>
            <ul className="mt-6 space-y-3">
              {t.demo.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base font-medium text-[#1f2937]">
                  <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#2b68ff] text-xs font-bold text-white">&gt;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-[#2b68ff] px-6 py-3 text-sm font-semibold text-white">{t.demo.primaryCta}</Link>
              <Link href="/profile" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f57de]">{t.demo.secondaryCta}</Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#d6defe] bg-white p-6 shadow-[0_14px_34px_rgba(18,24,40,0.12)]">
            <div className="rounded-2xl bg-[#0f172a] p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">{t.demo.panel.title}</p>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {isDemoLoading ? t.demo.panel.syncing : isDemoError ? t.demo.panel.offline : t.demo.panel.synced}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span>{t.demo.panel.sentiment}</span>
                  <span className="font-bold text-emerald-300">
                    {isDemoError ? t.demo.panel.na : `${normalizedSentiment}/100 (${sentimentDirection})`}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span>{t.demo.panel.risk}</span>
                  <span className="font-bold text-amber-300">
                    {isDemoError ? t.demo.panel.na : getRiskTone(riskQuery.data?.riskLevel, t)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span>{t.demo.panel.action}</span>
                  <span className="font-bold text-sky-300">
                    {isDemoError ? t.demo.panel.connectBackend : recommendation}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#eff3ff] p-4">
                <p className="text-xs font-semibold uppercase text-[#5b6aa8]">{t.demo.panel.esg}</p>
                <p className="mt-2 text-xl font-black text-[#18213f]">
                  {isDemoError ? t.demo.panel.na : `${esgQuery.data?.score ?? 0}/100`}
                </p>
              </div>
              <div className="rounded-2xl bg-[#eff3ff] p-4">
                <p className="text-xs font-semibold uppercase text-[#5b6aa8]">{t.demo.panel.counterparties}</p>
                <p className="mt-2 text-xl font-black text-[#18213f]">
                  {isDemoError ? t.demo.panel.na : riskQuery.data?.factors.uniqueCounterparties ?? 0}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-[#6b7280]">
              {t.demo.panel.source}: {config.backendUrl}/api/sentiment, /api/wallet-risk, /api/esg-score
            </p>
          </div>
        </div>
      </section>

      <section id="join" className="mx-auto w-full max-w-[1220px] px-6 py-24">
        <div className="relative overflow-hidden rounded-[38px] bg-[#0a0a0a] p-8 text-white shadow-[0_20px_38px_rgba(0,0,0,0.24)] md:p-12">
          {/* Animated Pixel Background */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="grid h-full w-full grid-cols-12 gap-0">
              {Array.from({ length: 96 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pixel-shift aspect-square"
                  style={{
                    animationDelay: `${(i % 12) * 0.15 + Math.floor(i / 12) * 0.1}s`,
                    animationDuration: `${3 + (i % 3)}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#93c5fd]">{t.join.eyebrow}</p>
            <h2 className="mt-3 max-w-[760px] text-4xl font-black tracking-tight md:text-5xl">{t.join.title}</h2>
            <p className="mt-6 max-w-[760px] text-lg leading-relaxed text-[#d1d5db]">{t.join.desc}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ConnectWallet />
              <Link href="/dashboard" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111827]">{t.join.cta}</Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes rise-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-soft {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes float-chat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-rise-up {
          animation: rise-up 0.8s ease-out both;
        }

        .animate-float-soft {
          animation: float-soft 6s ease-in-out infinite;
        }

        .animate-float-chat {
          animation: float-chat 5s ease-in-out infinite;
        }

        @keyframes pixel-shift {
          0%, 100% {
            background-color: #0a0a0a;
          }
          20% {
            background-color: #1a1a1a;
          }
          40% {
            background-color: #2a2a2a;
          }
          60% {
            background-color: #3a3a3a;
          }
          80% {
            background-color: #2a2a2a;
          }
        }

        .animate-pixel-shift {
          animation: pixel-shift infinite ease-in-out;
          will-change: background-color;
        }
      `}</style>
    </div>
  );
}

