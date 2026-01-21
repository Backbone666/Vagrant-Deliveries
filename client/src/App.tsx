import { useState } from "react";

interface PricingResult {
  price: number;
  jumps: number;
  breakdown: string;
  valid: boolean;
  error?: string;
}

function App() {
  const [routeType, setRouteType] = useState("highsec");
  const [origin, setOrigin] = useState("Jita");
  const [destination, setDestination] = useState("");
  const [volume, setVolume] = useState<string>("");
  const [collateral, setCollateral] = useState<string>("");
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeType,
          origin,
          destination,
          volume: Number(volume),
          collateral: Number(collateral)
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ valid: false, error: "Network Error", price: 0, jumps: 0, breakdown: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black/60 backdrop-blur-sm flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full bg-slate-900/90 border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center font-bold text-black">
              V
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-300">
              Vagrant Deliveries
            </span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-yellow-400 transition-colors">Services</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Rates</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Tracking</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Support</a>
          </div>
          <div>
            <a 
              href="/login" 
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded-sm transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] text-sm uppercase tracking-wide"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-8">
          
          {/* Hero Text */}
          <div className="text-center space-y-2 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Professional <span className="text-yellow-500">Space Logistics</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Secure, reliable, and efficient freight services across New Eden. 
              We handle the risks so you can focus on the rewards.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                </svg>
                Instant Quote Calculator
              </h2>
              <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">System Online</span>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Locations */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Pickup Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="block w-full pl-4 pr-3 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-slate-500 transition-all outline-none"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="System Name (e.g. Jita)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Destination</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="block w-full pl-4 pr-3 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-slate-500 transition-all outline-none"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="System Name (e.g. Amarr)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Service Type</label>
                    <select
                      className="block w-full pl-4 pr-10 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white transition-all outline-none appearance-none"
                      value={routeType}
                      onChange={(e) => setRouteType(e.target.value)}
                    >
                      <option value="highsec">High Security (Standard)</option>
                      <option value="lowsec">Low Security</option>
                      <option value="providence">Providence Region</option>
                      <option value="zarzakh">Zarzakh Express</option>
                      <option value="thera">Thera Wormhole</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Cargo Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Volume (m³)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="block w-full pl-4 pr-3 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-slate-500 transition-all outline-none"
                        placeholder="0"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">m³</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Collateral (ISK)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="block w-full pl-4 pr-3 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-slate-500 transition-all outline-none"
                        placeholder="0"
                        value={collateral}
                        onChange={(e) => setCollateral(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">ISK</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={calculate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 px-4 rounded-lg shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Calculating Route...
                        </>
                      ) : "Calculate Reward"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Area */}
              {result && (
                <div className={`mt-6 p-4 rounded-lg border animate-fade-in ${result.valid ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  {result.valid ? (
                    <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                      <div>
                        <p className="text-sm text-green-400 font-medium tracking-wide uppercase">Route Established</p>
                        <p className="text-3xl font-bold text-white mt-1">
                          {result.price.toLocaleString()} <span className="text-base font-normal text-slate-400">ISK</span>
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <p className="text-slate-300 text-sm">{result.breakdown}</p>
                        <p className="text-slate-400 text-xs mt-1">Total Jumps: {result.jumps}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-medium">{result.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-slate-900/50 px-6 py-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
              <span>Prices subject to change based on market conditions.</span>
              <span>© {new Date().getFullYear()} Vagrant Deliveries</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;