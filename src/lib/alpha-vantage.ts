import { GlobalQuoteResponse, CompanyOverviewResponse, StockData, ApiError } from './types/alpha-vantage';

const BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageError {
  'Error Message'?: string;
  'Note'?: string;
  'Information'?: string;
}

export class AlphaVantageClient {
  private apiKey: string;

  constructor(apiKey: string = process.env.ALPHA_VANTAGE_API_KEY || '') {
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(BASE_URL);
    url.searchParams.append('apikey', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        next: { revalidate: 300 } // Cache for 5 minutes
      });

      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw {
          message: 'Rate limit exceeded',
          code: '429',
          retryAfter: retryAfter ? parseInt(retryAfter) : 60,
        } as ApiError;
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check for API-level errors
      if ((data as AlphaVantageError)['Error Message']) {
        throw {
          message: (data as AlphaVantageError)['Error Message'],
          code: 'API_ERROR',
        } as ApiError;
      }

      if ((data as AlphaVantageError)['Note']) {
        throw {
          message: 'API rate limit reached. Free tier allows 5 calls/min, 25 calls/day.',
          code: 'RATE_LIMITED',
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if ((error as ApiError).code) throw error;
      if (error instanceof Error) {
        throw {
          message: error.message,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
      throw error;
    }
  }

  async getGlobalQuote(symbol: string): Promise<GlobalQuoteResponse> {
    return this.request<GlobalQuoteResponse>({
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
    });
  }

  async getCompanyOverview(symbol: string): Promise<CompanyOverviewResponse> {
    return this.request<CompanyOverviewResponse>({
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase(),
    });
  }

  async parseQuoteData(response: GlobalQuoteResponse, overview?: CompanyOverviewResponse): Promise<StockData> {
    const quote = response['Global Quote'];
    
    return {
      symbol: quote['01. symbol'],
      name: overview?.Name || quote['01. symbol'],
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
      open: parseFloat(quote['02. open']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      latestTradingDay: quote['07. latest trading day'],
      previousClose: parseFloat(quote['08. previous close']) || 0,
      peRatio: overview?.PERatio && overview.PERatio !== 'None' ? parseFloat(overview.PERatio) : undefined,
      marketCap: overview?.MarketCapitalization ? this.formatMarketCap(parseInt(overview.MarketCapitalization)) : undefined,
      eps: overview?.EPS && overview.EPS !== 'None' ? parseFloat(overview.EPS) : undefined,
      beta: overview?.Beta && overview.Beta !== 'None' ? parseFloat(overview.Beta) : undefined,
      dividendYield: overview?.DividendYield && overview.DividendYield !== 'None' ? parseFloat(overview.DividendYield) * 100 : undefined,
      fiftyTwoWeekHigh: overview?.['52WeekHigh'] && overview['52WeekHigh'] !== 'None' ? parseFloat(overview['52WeekHigh']) : undefined,
      fiftyTwoWeekLow: overview?.['52WeekLow'] && overview['52WeekLow'] !== 'None' ? parseFloat(overview['52WeekLow']) : undefined,
      sector: overview?.Sector || undefined,
      industry: overview?.Industry || undefined,
    };
  }

  private formatMarketCap(value: number): string {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toString();
  }
}
