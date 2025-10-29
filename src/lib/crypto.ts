// Cryptocurrency data utilities

export interface Crypto {
  ticker: string;
  name: string;
  price: number;
  perf5Min: number;
  perfHour: number;
  perfDay: number;
  perfWeek: number;
  perfMonth: number;
  perfQuart: number;
  perfHalf: number;
  perfYTD: number;
  perfYear: number;
}

// Major trading crypto assets
export const MAJOR_CRYPTOS = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'BNB', name: 'Binance Coin' },
  { ticker: 'XRP', name: 'Ripple' },
  { ticker: 'ADA', name: 'Cardano' },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'DOT', name: 'Polkadot' },
  { ticker: 'LINK', name: 'Chainlink' },
  { ticker: 'LTC', name: 'Litecoin' },
  { ticker: 'NEAR', name: 'NEAR Protocol' },
  { ticker: 'DOGE', name: 'Dogecoin' },
  { ticker: 'TRX', name: 'TRON' },
  { ticker: 'APT', name: 'Aptos' },
  { ticker: 'OP', name: 'Optimism' },
  { ticker: 'EGLD', name: 'MultiversX' },
  { ticker: 'SUI', name: 'Sui' },
  { ticker: 'AAVE', name: 'Aave' },
  { ticker: 'XLM', name: 'Stellar' },
  { ticker: 'BCH', name: 'Bitcoin Cash' },
];

// Generate realistic crypto data
export function generateCryptoData(ticker: string, name: string): Crypto {
  // Different base prices for different cryptos
  let basePrice: number;
  if (ticker === 'BTC') basePrice = 65000 + Math.random() * 10000;
  else if (ticker === 'ETH') basePrice = 3000 + Math.random() * 1000;
  else if (ticker === 'BNB') basePrice = 500 + Math.random() * 100;
  else if (ticker === 'SOL') basePrice = 150 + Math.random() * 50;
  else if (ticker === 'ADA' || ticker === 'DOGE' || ticker === 'TRX' || ticker === 'XLM') {
    basePrice = 0.3 + Math.random() * 0.5;
  } else if (ticker === 'XRP') basePrice = 0.5 + Math.random() * 0.3;
  else if (ticker === 'LTC') basePrice = 80 + Math.random() * 20;
  else basePrice = 10 + Math.random() * 90;

  // Generate performance data with realistic ranges
  const perfDay = (Math.random() - 0.5) * 10; // -5% to +5%
  const perf5Min = perfDay * (Math.random() - 0.5) * 0.1; // Small variation
  const perfHour = perfDay * (Math.random() - 0.5) * 0.5; // Medium variation
  const perfWeek = perfDay * (1 + (Math.random() - 0.5) * 2); // Larger variation
  const perfMonth = (Math.random() - 0.5) * 40; // -20% to +20%
  const perfQuart = (Math.random() - 0.5) * 60; // -30% to +30%
  const perfHalf = (Math.random() - 0.5) * 80; // -40% to +40%
  const perfYTD = (Math.random() - 0.5) * 120; // -60% to +60%
  const perfYear = (Math.random() - 0.5) * 140; // -70% to +70%

  return {
    ticker,
    name,
    price: parseFloat(basePrice.toFixed(ticker === 'BTC' || ticker === 'ETH' ? 2 : 4)),
    perf5Min: parseFloat(perf5Min.toFixed(2)),
    perfHour: parseFloat(perfHour.toFixed(2)),
    perfDay: parseFloat(perfDay.toFixed(2)),
    perfWeek: parseFloat(perfWeek.toFixed(2)),
    perfMonth: parseFloat(perfMonth.toFixed(2)),
    perfQuart: parseFloat(perfQuart.toFixed(2)),
    perfHalf: parseFloat(perfHalf.toFixed(2)),
    perfYTD: parseFloat(perfYTD.toFixed(2)),
    perfYear: parseFloat(perfYear.toFixed(2)),
  };
}
