import { Link } from "wouter";
import { motion } from "framer-motion";
import StakingImage from "../assets/staking.png";
import {
	CurrencyDollarIcon,
	UserGroupIcon,
	ChartBarIcon,
	ArrowRightIcon,
	ShieldCheckIcon,
	UsersIcon,
	CubeTransparentIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import nectrStakingABI from "../assets/abis/NectrStaking.json";
import { keepPreviousData } from "@tanstack/react-query";
import nectrTokenABI from "../assets/abis/NectrToken.json";

const NECTR_TOKEN_ADDRESS = import.meta.env.VITE_NECTR_TOKEN_ADDRESS;
const NECTR_STAKING_ADDRESS = import.meta.env.VITE_NECTR_STAKING_ADDRESS;

export default function Home() {
	// const { address } = useAccount(); // Temporarily commenting out as it's not used yet.

	const { data: totalMinted, isPending: isPendingTotalMinted } = useReadContract({
		address: NECTR_TOKEN_ADDRESS,
		abi: nectrTokenABI,
		functionName: "totalSupply",
		query: {
			enabled: !!NECTR_TOKEN_ADDRESS,
			refetchInterval: 60000,
			placeholderData: keepPreviousData,
		},
	});

	const { data: activeStakers, isPending: isPendingActiveStakers } = useReadContract({
		address: NECTR_STAKING_ADDRESS,
		abi: nectrStakingABI,
		functionName: "activeStakersCount",
		query: {
			enabled: !!NECTR_STAKING_ADDRESS,
			refetchInterval: 60000,
			placeholderData: keepPreviousData,
		},
	});

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="pt-24">
			{/* Hero Section */}
			<section className="relative py-20 overflow-hidden">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-7xl mx-auto px-4"
				>
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-8">
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.2, duration: 0.5 }}
								className="inline-block"
							>
								<span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-nectr-400/20 to-purple-500/20 text-nectr-600 border border-nectr-200">
									Built on Polygon Network
								</span>
							</motion.div>
							<h1 className="text-6xl font-bold">
								<span className="bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent">
									Stake & Earn
								</span>
								<br />
								<span className="text-gray-800">with Nectr</span>
							</h1>
							<p className="text-xl text-gray-600 max-w-lg">
								Experience the sweetest way to stake and earn rewards in the decentralized world. Powered by Polygon
								Network.
							</p>
							<div className="flex flex-wrap gap-4">
								<Link href="/staking">
									<a className="inline-flex items-center px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-nectr-400 to-nectr-600 text-white hover:from-nectr-500 hover:to-nectr-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
										Start Staking
										<ArrowRightIcon className="w-5 h-5 ml-2" />
									</a>
								</Link>
								<a
									href="#learn-more"
									className="inline-flex items-center px-8 py-4 rounded-2xl font-semibold bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
								>
									Learn More
								</a>
							</div>
						</div>
						<div className="relative">
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.4, duration: 0.8 }}
								className="relative z-10"
							>
								<div className="w-full h-[400px] rounded-2xl p-1">
									<img src={StakingImage} alt="Staking" className="w-full h-full object-cover rounded-2xl" />
								</div>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</section>

			{/* Stats Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid md:grid-cols-3 gap-8">
						<StatsCard
							icon={<CurrencyDollarIcon className="w-8 h-8" />}
							title="Total Supply"
							value={isPendingTotalMinted ? "0" : `${Number(formatEther(totalMinted || 0n)).toLocaleString()} NTR`}
						/>
						<StatsCard
							icon={<UserGroupIcon className="w-8 h-8" />}
							title="Active Stakers"
							value={isPendingActiveStakers ? "0" : Number(activeStakers || 0n).toLocaleString()}
						/>
						<StatsCard icon={<ChartBarIcon className="w-8 h-8" />} title="Annualized Return" value="7.3%" />
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20" id="learn-more">
				<div className="max-w-7xl mx-auto px-4">
					<motion.h2
						className="text-4xl font-bold text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<span className="bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent">
							Why Choose Nectr?
						</span>
					</motion.h2>
					<div className="grid md:grid-cols-3 gap-8">
						<FeatureCard
							title="Secure Staking"
							description="Stake your NECTR tokens securely and earn rewards through our battle-tested smart contracts."
							icon={<ShieldCheckIcon className="w-10 h-10" />}
							delay={0.2}
						/>
						<FeatureCard
							title="Community Driven"
							description="Join our vibrant community and participate in governance decisions that shape the future of Nectr."
							icon={<UsersIcon className="w-10 h-10" />}
							delay={0.4}
						/>
						<FeatureCard
							title="Polygon Powered"
							description="Built on Polygon for fast, secure, and cost-effective transactions with minimal environmental impact."
							icon={<CubeTransparentIcon className="w-10 h-10" />}
							delay={0.6}
						/>
					</div>
				</div>
			</section>
		</motion.div>
	);
}

function StatsCard({ icon, title, value, change }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
			className="group relative"
		>
			<div className="absolute inset-0 bg-gradient-to-br from-nectr-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
			<div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex items-center space-x-4 mb-4">
					<div className="p-3 rounded-xl bg-gradient-to-br from-nectr-400/20 to-purple-500/20 text-nectr-600">
						{icon}
					</div>
					<h3 className="text-lg font-semibold text-gray-800">{title}</h3>
				</div>
				<div className="flex items-baseline justify-between">
					<span className="text-3xl font-bold text-gray-900">{value}</span>
					<span className="text-sm font-medium text-green-500">{change}</span>
				</div>
			</div>
		</motion.div>
	);
}

function FeatureCard({ title, description, icon, delay }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay }}
			className="group relative"
		>
			<div className="absolute inset-0 bg-gradient-to-br from-nectr-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
			<div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="text-nectr-600 mb-6">{icon}</div>
				<h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent">
					{title}
				</h3>
				<p className="text-gray-600 leading-relaxed">{description}</p>
			</div>
		</motion.div>
	);
}
