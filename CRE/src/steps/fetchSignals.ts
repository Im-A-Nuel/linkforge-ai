import {
  consensusMedianAggregation,
  cre,
  json,
  ok,
  type HTTPSendRequester,
  type Runtime,
} from "@chainlink/cre-sdk";
import type { WorkflowConfig } from "../utils/types";

type FearGreedApiResponse = {
  data?: Array<{ value?: string }>;
};

type CoingeckoApiResponse = {
  ethereum?: { usd_24h_change?: number };
  bitcoin?: { usd_24h_change?: number };
};

export type OffchainSignals = {
  sentimentScore: number;
  volatilityScore: number;
};

const parseFearGreedScore = (responseBody: FearGreedApiResponse): number => {
  const rawValue = responseBody.data?.[0]?.value;
  if (!rawValue) {
    throw new Error("Fear & Greed API returned empty value.");
  }

  const index = Number(rawValue);
  if (Number.isNaN(index)) {
    throw new Error("Fear & Greed API returned non-numeric value.");
  }

  // Convert 0..100 (Fear/Greed) to -100..100 sentiment scale.
  return Math.round((index - 50) * 2);
};

const fetchFearGreedFromNode = (sendRequester: HTTPSendRequester, url: string): number => {
  const response = sendRequester
    .sendRequest({
      url,
      method: "GET",
    })
    .result();

  if (!ok(response)) {
    throw new Error(`Fear & Greed request failed with status ${response.statusCode}`);
  }

  return parseFearGreedScore(json(response) as FearGreedApiResponse);
};

const calculateVolatility = (responseBody: CoingeckoApiResponse): number => {
  const ethChange = Math.abs(responseBody.ethereum?.usd_24h_change ?? 0);
  const btcChange = Math.abs(responseBody.bitcoin?.usd_24h_change ?? 0);
  const average = (ethChange + btcChange) / 2;

  // Simple normalization to 0..100 scale.
  return Math.min(Math.round(average * 20), 100);
};

const fetchVolatilityFromNode = (sendRequester: HTTPSendRequester, url: string): number => {
  const response = sendRequester
    .sendRequest({
      url,
      method: "GET",
    })
    .result();

  if (!ok(response)) {
    throw new Error(`CoinGecko request failed with status ${response.statusCode}`);
  }

  return calculateVolatility(json(response) as CoingeckoApiResponse);
};

export const fetchAggregatedSignals = (runtime: Runtime<WorkflowConfig>): OffchainSignals => {
  const httpClient = new cre.capabilities.HTTPClient();

  const sentimentScore = httpClient
    .sendRequest(runtime, fetchFearGreedFromNode, consensusMedianAggregation())(
      runtime.config.apis.fearGreedUrl
    )
    .result();

  const volatilityScore = httpClient
    .sendRequest(runtime, fetchVolatilityFromNode, consensusMedianAggregation())(
      runtime.config.apis.coingeckoUrl
    )
    .result();

  return {
    sentimentScore,
    volatilityScore,
  };
};
