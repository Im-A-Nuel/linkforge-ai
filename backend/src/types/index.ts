export interface SentimentData {
  asset: string;
  sentiment: number; // -1 to 1
  confidence: number; // 0 to 1
  sources: string[];
  timestamp: string;
}

export interface RiskData {
  address: string;
  riskScore: number; // 0 to 100
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    transactionVolume: number;
    uniqueCounterparties: number;
    suspiciousActivity: boolean;
  };
  timestamp: string;
}

export interface ESGScore {
  asset: string;
  score: number; // 0 to 100
  category: 'green' | 'neutral' | 'brown';
  metrics: {
    environmental: number;
    social: number;
    governance: number;
  };
  timestamp: string;
}
