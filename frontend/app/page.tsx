'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
      cardLabel: 'AI Confidence',
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
      cardLabel: 'AI 置信度',
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
      cardLabel: 'KI-Konfidenz',
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
      cardLabel: 'Kepercayaan AI',
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

const heroStars = [
  { l: '5%', t: '12%', s: 1.2, o: 0.3, d: '0s', dur: '3.2s' },
  { l: '15%', t: '5%', s: 1.8, o: 0.2, d: '0.8s', dur: '4.1s' },
  { l: '28%', t: '18%', s: 1, o: 0.4, d: '1.5s', dur: '2.8s' },
  { l: '42%', t: '8%', s: 1.5, o: 0.15, d: '2.3s', dur: '3.6s' },
  { l: '55%', t: '22%', s: 1.3, o: 0.35, d: '0.3s', dur: '4.5s' },
  { l: '68%', t: '6%', s: 1.7, o: 0.25, d: '1.8s', dur: '3s' },
  { l: '80%', t: '15%', s: 1, o: 0.45, d: '3.2s', dur: '2.5s' },
  { l: '92%', t: '10%', s: 1.4, o: 0.2, d: '0.6s', dur: '3.8s' },
  { l: '10%', t: '35%', s: 1.6, o: 0.3, d: '2.1s', dur: '4.2s' },
  { l: '35%', t: '42%', s: 1.1, o: 0.15, d: '1s', dur: '3.4s' },
  { l: '60%', t: '38%', s: 1.8, o: 0.4, d: '3.5s', dur: '2.9s' },
  { l: '85%', t: '45%', s: 1.2, o: 0.25, d: '0.4s', dur: '3.7s' },
  { l: '20%', t: '55%', s: 1.5, o: 0.35, d: '2.8s', dur: '4s' },
  { l: '48%', t: '60%', s: 1, o: 0.2, d: '1.3s', dur: '3.3s' },
  { l: '72%', t: '52%', s: 1.3, o: 0.3, d: '3s', dur: '2.7s' },
  { l: '90%', t: '65%', s: 1.6, o: 0.15, d: '0.9s', dur: '4.3s' },
  { l: '8%', t: '75%', s: 1.4, o: 0.4, d: '2.5s', dur: '3.1s' },
  { l: '30%', t: '80%', s: 1, o: 0.25, d: '1.7s', dur: '3.9s' },
  { l: '55%', t: '72%', s: 1.7, o: 0.3, d: '3.3s', dur: '2.6s' },
  { l: '78%', t: '85%', s: 1.2, o: 0.2, d: '0.2s', dur: '4.4s' },
];

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
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const target = 87.4;
    const duration = 2000;
    let startTime: number | null = null;
    let raf: number;
    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(parseFloat((target * eased).toFixed(1)));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

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
  const riskPercent = riskQuery.data?.riskLevel === 'high' ? 90 : riskQuery.data?.riskLevel === 'low' ? 25 : 55;

  return (
    <div className="bg-[#ececec] text-[#121212]">
      <section className="relative overflow-x-clip">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#1f6fff]/10 blur-3xl" />
          <div className="absolute right-10 top-40 h-64 w-64 rounded-full bg-[#ffcd4d]/20 blur-3xl" />
        </div>

        <header className="relative z-20">
          <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-6 py-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/icon/LinkForge%20AI%20logo.png"
                alt="LinkForge AI"
                width={320}
                height={96}
                priority
                className="h-14 w-auto md:h-16"
              />
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
                <Image
                  src="/icon/LinkForge%20AI%20logo.png"
                  alt="LinkForge AI"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-full object-cover shadow-[0_14px_30px_rgba(43,104,255,0.32)] md:h-16 md:w-16"
                />
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
            {/* Dark Analytics Dashboard Card */}
            <div
              className="hero-card-entrance relative overflow-hidden rounded-[28px] border border-[rgba(43,104,255,0.15)] p-6 shadow-[0_0_80px_rgba(43,104,255,0.1),0_20px_60px_rgba(0,0,0,0.4)] md:p-8"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #0c1a3a 0%, #060b18 50%, #030710 100%)' }}
            >
              {/* Top glow */}
              <div
                className="hero-glow pointer-events-none absolute -top-24 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-[50%] blur-3xl"
                style={{ background: 'radial-gradient(ellipse at center, rgba(43,104,255,0.3) 0%, transparent 70%)' }}
              />

              {/* Border glow effect at top */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2b68ff]/40 to-transparent" />

              {/* Star particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                {heroStars.map((star, i) => (
                  <div
                    key={i}
                    className="hero-star absolute rounded-full bg-white"
                    style={{
                      width: `${star.s}px`,
                      height: `${star.s}px`,
                      left: star.l,
                      top: star.t,
                      opacity: star.o,
                      animationDelay: star.d,
                      animationDuration: star.dur,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Label */}
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6b8ccc]">
                  {t.hero.cardLabel}
                </p>

                {/* Score */}
                <p className="mt-2 text-[56px] font-black leading-none tracking-tight text-white md:text-[68px]">
                  {displayScore.toFixed(1)}
                </p>

                {/* Change indicator */}
                <p className="mt-1.5 text-[15px] font-semibold text-emerald-400">
                  +12.3 <span className="text-emerald-400/60">(+16.4%)</span>
                </p>

                {/* Chart */}
                <div className="mt-5">
                  <svg viewBox="0 0 420 220" className="h-auto w-full overflow-visible">
                    <defs>
                      <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1a4fd0" />
                        <stop offset="50%" stopColor="#2b68ff" />
                        <stop offset="100%" stopColor="#60a0ff" />
                      </linearGradient>
                      <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b68ff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2b68ff" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="heroBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#162d5e" />
                        <stop offset="100%" stopColor="#0a1630" />
                      </linearGradient>
                      <filter id="heroGlow">
                        <feGaussianBlur stdDeviation="4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                      <filter id="heroPointGlow">
                        <feGaussianBlur stdDeviation="8" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    {/* Bars */}
                    {[
                      { x: 20, h: 58 }, { x: 54.5, h: 52 }, { x: 89, h: 76 }, { x: 123.5, h: 66 },
                      { x: 158, h: 85 }, { x: 192.5, h: 100 }, { x: 227, h: 93 }, { x: 261.5, h: 80 },
                      { x: 296, h: 89 }, { x: 330.5, h: 103 }, { x: 365, h: 113 }, { x: 399.5, h: 120 },
                    ].map((bar, i) => (
                      <rect
                        key={i}
                        x={bar.x - 13}
                        y={180 - bar.h}
                        width={26}
                        height={bar.h}
                        rx={4}
                        fill="url(#heroBarGrad)"
                        className="hero-bar"
                        style={{ animationDelay: `${0.8 + i * 0.06}s` }}
                      />
                    ))}

                    {/* Area fill under line */}
                    <path
                      d="M20 150.5 L54.5 160.3 L89 118.5 L123.5 135.7 L158 101.2 L192.5 74.6 L227 86.5 L261.5 111.1 L296 93.8 L330.5 69.2 L365 52 L399.5 38.7 L399.5 180 L20 180 Z"
                      fill="url(#heroAreaGrad)"
                      className="hero-area"
                    />

                    {/* Glow line (wide, blurred) */}
                    <polyline
                      points="20,150.5 54.5,160.3 89,118.5 123.5,135.7 158,101.2 192.5,74.6 227,86.5 261.5,111.1 296,93.8 330.5,69.2 365,52 399.5,38.7"
                      fill="none"
                      stroke="#2b68ff"
                      strokeWidth="6"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter="url(#heroGlow)"
                      opacity="0.35"
                      className="hero-line"
                    />

                    {/* Main line */}
                    <polyline
                      points="20,150.5 54.5,160.3 89,118.5 123.5,135.7 158,101.2 192.5,74.6 227,86.5 261.5,111.1 296,93.8 330.5,69.2 365,52 399.5,38.7"
                      fill="none"
                      stroke="url(#heroLineGrad)"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="hero-line"
                    />

                    {/* Tooltip at JUN data point (72.8) */}
                    <g className="hero-tooltip">
                      <line x1="192.5" y1="76" x2="192.5" y2="180" stroke="#2b68ff" strokeWidth="1" strokeDasharray="4,4" opacity="0.25" />
                      <circle cx="192.5" cy="74.6" r="16" fill="#2b68ff" opacity="0.15" filter="url(#heroPointGlow)" />
                      <circle cx="192.5" cy="74.6" r="5" fill="#2b68ff" />
                      <circle cx="192.5" cy="74.6" r="3" fill="white" />
                      <rect x="164" y="44" width="57" height="24" rx="12" fill="#0f1f42" stroke="rgba(43,104,255,0.4)" strokeWidth="1" />
                      <text x="192.5" y="60" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="system-ui">72.8</text>
                    </g>

                    {/* Month labels */}
                    {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((m, i) => (
                      <text key={m} x={20 + i * 34.5} y={205} textAnchor="middle" fill="#3a4a6a" fontSize="10" fontWeight="600" fontFamily="system-ui">
                        {m}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center">
              {address ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#2b68ff] to-[#1f57de] px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-[1.05] hover:shadow-2xl"
                >
                  <span>{t.join.cta}</span>
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <ConnectWallet
                  label={connectLabel}
                  className="rounded-full bg-gradient-to-r from-[#2b68ff] to-[#1f57de] px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-[1.05] hover:shadow-2xl"
                />
              )}
            </div>
          </section>
        </main>

        <section className="relative z-10 mx-auto mb-12 flex w-full max-w-[1220px] flex-wrap gap-4 px-6 text-[#2e2e2e]">
          {t.chips.map((chip) => (
            <div key={chip} className="rounded-2xl bg-white/75 px-5 py-4 text-sm font-semibold">{chip}</div>
          ))}
        </section>

        {/* Animated Wave Ribbon */}
        <div className="pointer-events-none relative z-10 overflow-hidden" style={{ height: '180px' }}>
          {/* Wave Layer 1 — back (lightest, slowest) */}
          <div className="wave-ribbon-1 absolute inset-y-0 left-0 w-[200%]">
            <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0,60 C240,30 480,90 720,60 C960,30 1200,90 1440,60 C1680,30 1920,90 2160,60 C2400,30 2640,90 2880,60 L2880,200 L0,200 Z"
                fill="#5a94ff"
                opacity="0.35"
              />
            </svg>
          </div>

          {/* Wave Layer 2 — middle (opposite phase) */}
          <div className="wave-ribbon-2 absolute inset-y-0 left-0 w-[200%]">
            <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0,78 C240,100 480,56 720,78 C960,100 1200,56 1440,78 C1680,100 1920,56 2160,78 C2400,100 2640,56 2880,78 L2880,200 L0,200 Z"
                fill="#3a78ff"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Wave Layer 3 — front (solid, fastest) */}
          <div className="wave-ribbon-3 absolute inset-y-0 left-0 w-[200%]">
            <svg viewBox="0 0 2880 200" preserveAspectRatio="none" className="h-full w-full">
              <path
                d="M0,92 C240,74 480,110 720,92 C960,74 1200,110 1440,92 C1680,74 1920,110 2160,92 C2400,74 2640,110 2880,92 L2880,200 L0,200 Z"
                fill="#2b68ff"
              />
            </svg>
          </div>

          {/* Decorative bokeh circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="wave-bokeh absolute rounded-full bg-white/[0.08]" style={{ width: '120px', height: '120px', left: '8%', bottom: '0%', animationDuration: '6s' }} />
            <div className="wave-bokeh absolute rounded-full bg-white/[0.06]" style={{ width: '80px', height: '80px', left: '50%', bottom: '10%', animationDelay: '2s', animationDuration: '8s' }} />
            <div className="wave-bokeh absolute rounded-full bg-white/[0.07]" style={{ width: '100px', height: '100px', right: '10%', bottom: '-5%', animationDelay: '1s', animationDuration: '7s' }} />
          </div>

          {/* Text ribbon */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center px-6" style={{ height: '48%' }}>
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-white/90 sm:text-[13px] md:text-[17px] lg:text-[20px]">
              {t.ribbon.split('*').map(s => s.trim()).filter(Boolean).join('  \u2022  ')}
            </p>
          </div>
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
        <div className="mx-auto grid w-full max-w-[1220px] gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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

          <div
            className="relative overflow-hidden rounded-[24px] shadow-[0_24px_52px_rgba(43,104,255,0.16)]"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.86) 0%, rgba(231,240,255,0.72) 38%, rgba(242,247,255,0.74) 70%, rgba(255,255,255,0.8) 100%)' }}
          >
            {/* Color blobs */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[#2b68ff]/[0.14] blur-[72px]" />
            <div className="pointer-events-none absolute -bottom-14 -right-10 h-52 w-52 rounded-full bg-[#93c5fd]/[0.2] blur-[72px]" />
            <div className="pointer-events-none absolute left-[40%] top-[20%] h-28 w-28 rounded-full bg-[#2b68ff]/[0.06] blur-[50px]" />

            {/* Glass border */}
            <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/75" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 md:px-7">
                <span className="text-[16px] font-semibold text-[#1e293b]">{t.demo.panel.title}</span>
                <span className={`flex items-center gap-1.5 text-[13px] font-medium ${
                  isDemoError ? 'text-[#dc2626]' : isDemoLoading ? 'text-[#d97706]' : 'text-[#16a34a]'
                }`}>
                  <span className={`inline-block h-[8px] w-[8px] rounded-full ${
                    isDemoError ? 'bg-[#dc2626]' : isDemoLoading ? 'bg-[#d97706]' : 'bg-[#16a34a]'
                  }`} />
                  {isDemoLoading ? t.demo.panel.syncing : isDemoError ? t.demo.panel.offline : t.demo.panel.synced}
                </span>
              </div>

              {/* Sentiment Score — featured with chart background */}
              <div className="relative overflow-hidden px-6 py-8 md:px-7 md:py-9">
                {/* Decorative chart */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="demoChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2b68ff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#2b68ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 L12,76 L24,79 L36,72 L48,75 L60,68 L72,72 L84,64 L96,67 L108,60 L120,63 L132,56 L144,60 L156,52 L168,55 L180,48 L192,52 L204,44 L216,48 L228,40 L240,44 L252,36 L264,40 L276,32 L288,36 L300,28 L312,32 L324,24 L336,28 L348,20 L360,25 L372,18 L384,22 L396,16 L408,20 L420,14 L432,18 L444,12 L456,16 L468,10 L480,14 L492,8 L500,12"
                    fill="none" stroke="#2b68ff" strokeWidth="1.5" opacity="0.3"
                  />
                  <path
                    d="M0,80 L12,76 L24,79 L36,72 L48,75 L60,68 L72,72 L84,64 L96,67 L108,60 L120,63 L132,56 L144,60 L156,52 L168,55 L180,48 L192,52 L204,44 L216,48 L228,40 L240,44 L252,36 L264,40 L276,32 L288,36 L300,28 L312,32 L324,24 L336,28 L348,20 L360,25 L372,18 L384,22 L396,16 L408,20 L420,14 L432,18 L444,12 L456,16 L468,10 L480,14 L492,8 L500,12 L500,100 L0,100 Z"
                    fill="url(#demoChartFill)"
                  />
                </svg>

                <div className="relative z-10 text-center">
                  <p className="text-[14px] font-medium text-[#64748b]">{t.demo.panel.sentiment}</p>
                  <p className="mt-1">
                    <span
                      className="text-[58px] font-bold leading-none tracking-tight text-[#0f172a] md:text-[66px]"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {isDemoError ? '--' : normalizedSentiment}
                    </span>
                    <span className="text-[22px] font-medium text-[#94a3b8] md:text-[26px]">/100</span>
                  </p>
                  <span className="mt-4 inline-block rounded-full bg-[#2b68ff] px-5 py-1.5 text-[13px] font-semibold text-white">
                    {isDemoError ? t.demo.panel.na : sentimentDirection}
                  </span>
                </div>
              </div>

              {/* Bottom cards */}
              <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-3 px-5 pb-5 md:px-6 md:pb-6">
                {/* Risk Level */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#13203d] to-[#0b1328] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b68ff]/20">
                      <svg className="h-3.5 w-3.5 text-[#2b68ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#8ea2c6]">{t.demo.panel.risk}</span>
                  </div>
                  <p className="mt-2.5 text-[16px] font-semibold text-white">
                    {isDemoError ? t.demo.panel.na : getRiskTone(riskQuery.data?.riskLevel, t)}
                  </p>
                </div>

                {/* ESG Score */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#13203d] to-[#0b1328] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2b68ff]/20">
                      <svg className="h-3.5 w-3.5 text-[#2b68ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 21c3-8 9-13 15-14-1 6-6 12-14 15" />
                        <path d="M6 21l9-9" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-[#8ea2c6]">{t.demo.panel.esg}</span>
                  </div>
                  <p className="mt-2.5 text-[16px] font-semibold text-white">
                    {isDemoError ? t.demo.panel.na : `${esgQuery.data?.score ?? 0}/100`}
                  </p>
                </div>

                {/* Rebalance Action */}
                <div className="rounded-2xl bg-white/65 px-4 py-4 ring-1 ring-black/[0.05] backdrop-blur-[1px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#64748b]">{t.demo.panel.action}</span>
                    <svg className="h-4 w-4 flex-none text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                  </div>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#1e293b]">
                    {isDemoError ? t.demo.panel.connectBackend : recommendation}
                  </p>
                </div>
              </div>
            </div>
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

        @keyframes heroCardReveal {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heroStarTwinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.7; }
        }

        @keyframes heroBarGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        @keyframes heroLineDraw {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes heroAreaFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes heroTooltipReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroGlowPulse {
          0%, 100% {
            opacity: 0.15;
            transform: translateX(-50%) scaleX(1);
          }
          50% {
            opacity: 0.3;
            transform: translateX(-50%) scaleX(1.05);
          }
        }

        .hero-card-entrance {
          animation: heroCardReveal 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .hero-star {
          animation: heroStarTwinkle ease-in-out infinite;
        }

        .hero-bar {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: heroBarGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .hero-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: heroLineDraw 2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .hero-area {
          animation: heroAreaFade 1s ease-out 1.8s both;
        }

        .hero-tooltip {
          animation: heroTooltipReveal 0.5s ease-out 2.2s both;
        }

        .hero-glow {
          animation: heroGlowPulse 4s ease-in-out infinite;
        }

        /* Wave ribbon animations */
        @keyframes waveRibbonFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .wave-ribbon-1 {
          animation: waveRibbonFlow 14s linear infinite;
          will-change: transform;
        }

        .wave-ribbon-2 {
          animation: waveRibbonFlow 10s linear infinite reverse;
          will-change: transform;
        }

        .wave-ribbon-3 {
          animation: waveRibbonFlow 7s linear infinite;
          will-change: transform;
        }

        @keyframes waveBokehFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.08); opacity: 1; }
        }

        .wave-bokeh {
          animation: waveBokehFloat ease-in-out infinite;
        }

        /* Demo panel progress bars */
        @keyframes demoProgressGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .demo-progress-bar {
          transform-origin: left;
          animation: demoProgressGrow 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
      `}</style>
    </div>
  );
}
