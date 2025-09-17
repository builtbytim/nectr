import { Route, Switch } from "wouter";
import { WagmiProvider } from "wagmi";
import { polygonAmoy } from "wagmi/chains";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import wagmiConfig from "./components/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Home from "./pages/Home";
import Staking from "./pages/Staking";
import Social from "./pages/Social";
import Navbar from "./components/Navbar";

// Create a client
const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<WagmiProvider config={wagmiConfig}>
				<RainbowKitProvider
					theme={darkTheme({
						accentColor: "#9333EA", // nectr-600
						accentColorForeground: "white",
						borderRadius: "large",
						fontStack: "system",
					})}
					chains={[polygonAmoy]}
					coolMode
				>
					<div className="min-h-screen bg-gradient-to-br from-white via-nectr-50 to-nectr-100">
						{/* Rich gradient background */}
						<div className="fixed inset-0 pointer-events-none">
							<div className="absolute top-0 right-0 w-[1200px] h-[1000px] bg-gradient-to-br from-nectr-400/20 via-purple-500/10 to-blue-500/20 rounded-full filter blur-3xl"></div>
							<div className="absolute bottom-0 left-0 w-[1000px] h-[800px] bg-gradient-to-tr from-nectr-500/20 via-pink-500/10 to-purple-500/20 rounded-full filter blur-3xl"></div>
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-nectr-400/10 via-yellow-500/10 to-orange-500/10 rounded-full filter blur-3xl"></div>
						</div>

						{/* Content */}
						<div className="relative z-10">
							<Navbar />
							<main className="container mx-auto px-4">
								<Switch>
									<Route path="/" component={Home} />
									<Route path="/staking" component={Staking} />
									<Route path="/social" component={Social} />
								</Switch>
							</main>
						</div>
					</div>
				</RainbowKitProvider>
			</WagmiProvider>
		</QueryClientProvider>
	);
}
