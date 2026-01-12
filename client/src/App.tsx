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
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <nav className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-yellow-500">Vagrant Logistics</h1>
          <div className="space-x-4">
            <a href="#" className="hover:text-yellow-400">Home</a>
            <a href="#" className="hover:text-yellow-400">Quote</a>
            <a href="/login" className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500 text-black font-semibold">Login</a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <div className="text-center py-10">
          <h2 className="text-4xl font-bold mb-4">Neutral Space Trucking</h2>
          <p className="text-gray-400">since YC117.06.19</p>

          <div className="mt-10 p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto border border-gray-700 shadow-lg">
            <h3 className="text-2xl mb-6 font-bold text-yellow-500">Instant Quote</h3>

            <div className="text-left space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Origin</label>
                  <input
                    type="text"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 rounded-md bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Jita"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Destination</label>
                  <input
                    type="text"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 rounded-md bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Amarr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">Route Type</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md bg-gray-700 text-white"
                  value={routeType}
                  onChange={(e) => setRouteType(e.target.value)}
                >
                  <option value="highsec">HighSec</option>
                  <option value="lowsec">LowSec</option>
                  <option value="providence">Providence</option>
                  <option value="zarzakh">Zarzakh</option>
                  <option value="thera">Thera</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Volume (m3)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 rounded-md bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Collateral (ISK)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border-gray-600 rounded-md bg-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="0"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={calculate}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded transition duration-200 disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Calculate Reward"}
              </button>

              {result && (
                <div className={`mt-4 p-4 rounded ${result.valid ? "bg-green-900 border border-green-700" : "bg-red-900 border border-red-700"}`}>
                  {result.valid ? (
                    <div>
                      <p className="text-xl font-bold text-green-300">
                        Reward: {result.price.toLocaleString()} ISK
                      </p>
                      <p className="text-sm text-gray-300">{result.breakdown}</p>
                    </div>
                  ) : (
                    <p className="text-red-300">Error: {result.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;