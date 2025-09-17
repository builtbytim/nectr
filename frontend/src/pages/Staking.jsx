import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { writeContract, readContract } from "wagmi/actions";
import wagmiConfig from "../components/wagmi";
import {
	ArrowUpCircleIcon,
	ArrowDownCircleIcon,
	ClockIcon,
	CurrencyDollarIcon,
	XMarkIcon,
	ArrowPathIcon,
	CheckCircleIcon,
	PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { formatEther, parseEther } from "viem";
import nectrTokenABI from "../assets/abis/NectrToken.json";
import nectrStakingABI from "../assets/abis/NectrStaking.json";
import { keepPreviousData } from "@tanstack/react-query";

const NECTR_TOKEN_ADDRESS = import.meta.env.VITE_NECTR_TOKEN_ADDRESS;
const NECTR_STAKING_ADDRESS = import.meta.env.VITE_NECTR_STAKING_ADDRESS;

const DURATION_OPTIONS = [
	{ days: 30, label: "1 month" },
	{ days: 90, label: "3 months" },
	{ days: 180, label: "6 months" },
	{ days: 365, label: "1 year" },
	{ days: 730, label: "2 years" },
];

const MINT_AMOUNTS = [
	{ amount: "100", label: "100 NECTR" },
	{ amount: "1000", label: "1K NECTR" },
	{ amount: "1000000", label: "1M NECTR" },
];

export default function Staking() {
	const { address } = useAccount();
	const [activeTab, setActiveTab] = useState("stake"); // stake, unstake
	const [stakeAmount, setStakeAmount] = useState("");
	const [stakeDuration, setStakeDuration] = useState(30); // in days
	const [showMintModal, setShowMintModal] = useState(false);
	const [selectedMintAmount, setSelectedMintAmount] = useState(MINT_AMOUNTS[0].amount);
	const [mintError, setMintError] = useState("");
	const [mintSuccess, setMintSuccess] = useState(false);
	const [isApprovePending, setIsApprovePending] = useState(false);

	// Contract reads
	const { data: nectrBalance } = useReadContract({
		address: NECTR_TOKEN_ADDRESS,
		abi: nectrTokenABI,
		functionName: "balanceOf",
		args: [address],

		query: {
			enabled: !!address,
			refetchInterval: 10000,
		},
	});

	const { data: activeStakes } = useReadContract({
		address: NECTR_STAKING_ADDRESS,
		abi: nectrStakingABI,
		functionName: "getStakes",
		args: [address],
		query: {
			enabled: !!address,
			refetchInterval: 10000,
		},
	});

	const { data: currentAPR } = useReadContract({
		address: NECTR_STAKING_ADDRESS,
		abi: nectrStakingABI,
		functionName: "getCurrentAPR",
		args: [BigInt(stakeDuration) * 86400n], // Convert days to seconds
		query: {
			enabled: true,
			refetchInterval: 10000,
			placeholderData: keepPreviousData,
		},
	});

	// Contract writes
	const { writeContract: writeStake, isPending: isStakePending } = useWriteContract();
	const { writeContract: writeWithdraw, isPending: isWithdrawPending } = useWriteContract();
	const { writeContract: writeClaim, isPending: isClaimPending } = useWriteContract();
	const { writeContract: writeMint, isPending: isMintPending } = useWriteContract({
		mutation: {
			onSuccess() {
				setMintSuccess(false);
				setMintError("");
				setShowMintModal(false);
			},

			onError(error) {
				let errorMessage = "";

				if (error?.message?.includes("User rejected the request.")) {
					errorMessage = "Your transaction was cancelled. Please try again.";
				} else if (error?.message?.includes("MetaMask Tx Signature")) {
					errorMessage = "Your transaction was not signed by MetaMask. Please try again.";
				} else {
					errorMessage = "An error occurred while minting tokens, please try again.";
				}

				setMintSuccess(false);
				setMintError(errorMessage);

				console.error("Error minting:", error);
			},
		},
	});

	// Reset error when modal closes
	useEffect(() => {
		if (!showMintModal) {
			setMintError("");
			setMintSuccess(false);
		}
	}, [showMintModal]);

	// Handlers
	const handleStake = async () => {
		if (!stakeAmount || !stakeDuration) return;

		try {
			const amount = parseEther(stakeAmount);
			const durationInSeconds = BigInt(stakeDuration) * 86400n; // Convert days to seconds

			const currentAllowance = await readContract(wagmiConfig, {
				address: NECTR_TOKEN_ADDRESS,
				abi: nectrTokenABI,
				functionName: "allowance",
				args: [address, NECTR_STAKING_ADDRESS],
			});

			// First approve
			if (currentAllowance === 0n || currentAllowance < amount) {
				setIsApprovePending(true);
				await writeContract(wagmiConfig, {
					address: NECTR_TOKEN_ADDRESS,
					abi: nectrTokenABI,
					functionName: "approve",
					args: [NECTR_STAKING_ADDRESS, amount],
				});
				setIsApprovePending(false);
			}

			writeStake({
				address: NECTR_STAKING_ADDRESS,
				abi: nectrStakingABI,
				functionName: "stake",
				args: [amount, durationInSeconds],
			});
		} catch (error) {
			console.error("Error staking:", error);
			alert("An error occurred while staking, please try again.");
		}
	};

	const handleUnstake = async (stakeId) => {
		try {
			writeWithdraw({
				address: NECTR_STAKING_ADDRESS,
				abi: nectrStakingABI,
				functionName: "withdraw",
				args: [BigInt(stakeId)],
			});
		} catch (error) {
			console.error("Error unstaking:", error);
		}
	};

	const handleClaimInterest = async (stakeId) => {
		try {
			writeClaim({
				address: NECTR_STAKING_ADDRESS,
				abi: nectrStakingABI,
				functionName: "claimInterest",
				args: [BigInt(stakeId)],
			});
		} catch (error) {
			console.error("Error claiming interest:", error);
		}
	};

	const handleMint = async () => {
		try {
			setMintError("");

			// Check if balance is too high (1B tokens limit)
			if (nectrBalance && Number(formatEther(nectrBalance)) > 1000000000) {
				setMintError("Cannot mint: Balance exceeds 1B NECTR");
				return;
			}

			// Check if mint amount is too high (1M tokens limit)
			if (Number(selectedMintAmount) > 1000000) {
				setMintError("Cannot mint: Amount exceeds 1M NECTR");
				return;
			}

			writeMint({
				address: NECTR_TOKEN_ADDRESS,
				abi: nectrTokenABI,
				functionName: "mint",
				args: [parseEther(selectedMintAmount)],
			});
		} catch (error) {
			console.error("Error minting:", error);
			if (error.message?.includes("MintingRestrictedDueToBalance")) {
				setMintError("Cannot mint: Balance too high");
			} else if (error.message?.includes("MaxMintAmountExceeded")) {
				setMintError("Cannot mint: Amount too high");
			} else if (error.message?.includes("MaxSupplyExceeded")) {
				setMintError("Cannot mint: Max supply reached");
			} else {
				setMintError("Failed to mint tokens");
			}
		}
	};

	// Helper functions
	const formatDuration = (startTime, endTime) => {
		const end = new Date(Number(endTime) * 1000);
		const now = new Date();

		if (now > end) {
			return "Completed";
		}

		const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
		return `${daysLeft} days left`;
	};

	const formatAPR = (apr) => {
		if (!apr) return "0%";
		return `${(Number(apr) / 100).toFixed(2)}%`;
	};

	const getMintButtonText = () => {
		if (mintSuccess) return "Minted Successfully!";

		if (isMintPending) return "Confirm in Wallet..."; // This is the new pending state
		return "Mint NECTR";
	};

	const getMintButtonStyle = () => {
		if (mintSuccess) return "bg-green-500 hover:bg-green-600";
		return "bg-gradient-to-r from-nectr-400 to-purple-500 hover:from-nectr-500 hover:to-purple-600";
	};

	return (
		<div className="pt-36">
			<div className="max-w-4xl mx-auto px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-12"
				>
					<h1 className="text-4xl font-bold mb-4">
						<span className="bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent">
							Stake NECTR
						</span>
					</h1>
					<p className="text-gray-600">Earn rewards by staking your NECTR tokens</p>
				</motion.div>

				{/* Tab Switcher */}
				<div className="flex flex-row gap-2 sm:gap-0  mb-8">
					<button
						onClick={() => setActiveTab("stake")}
						className={`w-full sm:flex-1 py-3 text-sm font-medium transition-colors duration-200 rounded-lg sm:rounded-none ${
							activeTab === "stake"
								? "text-nectr-600 sm:border-b-2 sm:border-nectr-600 bg-nectr-50 sm:bg-transparent"
								: "text-gray-500 hover:text-nectr-500"
						}`}
					>
						Stake
					</button>
					<button
						onClick={() => setActiveTab("unstake")}
						className={`w-full sm:flex-1 py-3 text-sm font-medium transition-colors duration-200 rounded-lg sm:rounded-none ${
							activeTab === "unstake"
								? "text-nectr-600 sm:border-b-2 sm:border-nectr-600 bg-nectr-50 sm:bg-transparent"
								: "text-gray-500 hover:text-nectr-500"
						}`}
					>
						Active Stakes
					</button>
				</div>

				{/* Stake Tab */}
				{activeTab === "stake" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100"
					>
						<div className="space-y-6">
							{/* Balance with Mint Button */}
							<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
								<div className="text-sm break-words">
									<span className="text-gray-600">Balance:</span>
									<span className="font-medium ml-2">{nectrBalance ? formatEther(nectrBalance) : "0"} NECTR</span>
								</div>
								<button
									onClick={() => setShowMintModal(true)}
									className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-nectr-50 text-nectr-600 hover:bg-nectr-100 transition-colors text-sm font-medium w-full sm:w-auto"
								>
									<PlusCircleIcon className="w-4 h-4" />
									<span>Mint NECTR</span>
								</button>
							</div>

							{/* Amount Input */}
							<div className="space-y-2">
								<label className="text-sm text-gray-600">Amount to Stake</label>
								<div className="relative">
									<input
										type="number"
										value={stakeAmount}
										onChange={(e) => setStakeAmount(e.target.value)}
										placeholder="0.0"
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nectr-400 focus:border-transparent"
									/>
									<button
										onClick={() => nectrBalance && setStakeAmount(formatEther(nectrBalance))}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-nectr-600 font-medium hover:text-nectr-700 transition-colors"
									>
										MAX
									</button>
								</div>
							</div>

							{/* Duration Selection */}
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<label className="text-sm text-gray-600">Staking Duration</label>
									<span className="text-sm text-nectr-600 font-medium">{formatAPR(currentAPR)} APR</span>
								</div>
								<div className="grid  grid-cols-2 sm:flex gap-2">
									{DURATION_OPTIONS.map((option) => (
										<button
											key={option.days}
											onClick={() => setStakeDuration(option.days)}
											className={`w-full sm:flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
												stakeDuration === option.days
													? "bg-nectr-600 text-white shadow-md"
													: "bg-gray-50 text-gray-600 hover:bg-nectr-50 hover:text-nectr-600"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
							</div>

							{/* Stake Button */}
							<button
								onClick={handleStake}
								disabled={isApprovePending || isStakePending || !stakeAmount}
								className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-nectr-400 to-purple-500 text-white hover:from-nectr-500 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center space-x-2"
							>
								{(isApprovePending || isStakePending) && <ArrowPathIcon className="w-5 h-5 ml-2 animate-spin" />}

								<span>
									{isApprovePending ? "Approving..." : isStakePending ? "Confirm in Wallet..." : "Stake NECTR"}
								</span>
							</button>
						</div>
					</motion.div>
				)}

				{/* Active Stakes Tab */}
				{activeTab === "unstake" && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
						className="space-y-3 sm:space-y-4"
					>
						{activeStakes?.map(
							(stake, index) =>
								!stake.withdrawn && (
									<div
										key={index}
										className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
									>
										<div className="space-y-5">
											{/* Header */}
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
												<div>
													<div className="text-lg font-semibold text-gray-900 break-words">
														{formatEther(stake.amount)} NECTR
													</div>
													<div className="text-xs text-gray-500">Stake #{index + 1}</div>
												</div>
												<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-nectr-50 text-nectr-600 w-max">
													<ClockIcon className="w-4 h-4 mr-1" />
													{formatDuration(stake.startTime, stake.endTime)}
												</span>
											</div>

											{/* Meta grid */}
											<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
												<div className="rounded-xl bg-gray-50 px-3 py-2">
													<div className="text-xs text-gray-500">Start</div>
													<div className="text-sm font-medium text-gray-800">
														{new Date(Number(stake.startTime) * 1000).toLocaleDateString()}
													</div>
												</div>
												<div className="rounded-xl bg-gray-50 px-3 py-2">
													<div className="text-xs text-gray-500">End</div>
													<div className="text-sm font-medium text-gray-800">
														{new Date(Number(stake.endTime) * 1000).toLocaleDateString()}
													</div>
												</div>
												<div className="rounded-xl bg-gray-50 px-3 py-2">
													<div className="text-xs text-gray-500">Duration</div>
													<div className="text-sm font-medium text-gray-800">
														{formatDuration(stake.startTime, stake.endTime)}
													</div>
												</div>
												<div className="rounded-xl bg-gray-50 px-3 py-2">
													<div className="text-xs text-gray-500">Status</div>
													<div className="text-sm font-medium text-gray-800">Active</div>
												</div>
											</div>

											{/* Progress */}
											<div>
												<div className="flex items-center justify-between mb-2">
													<span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-nectr-600 bg-nectr-100">
														Progress
													</span>
													<span className="text-xs text-gray-500">
														{`${Math.min(
															((Date.now() / 1000 - Number(stake.startTime)) /
																(Number(stake.endTime) - Number(stake.startTime))) *
																100,
															100
														).toFixed(0)}%`}
													</span>
												</div>
												<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
													<div
														style={{
															width: `${Math.min(
																((Date.now() / 1000 - Number(stake.startTime)) /
																	(Number(stake.endTime) - Number(stake.startTime))) *
																	100,
																100
															).toFixed(0)}%`,
														}}
														className="h-2 bg-gradient-to-r from-nectr-400 to-purple-500 rounded-full"
													></div>
												</div>
											</div>

											{/* Actions */}
											<div className="flex flex-col sm:flex-row gap-2 pt-1">
												<button
													onClick={() => handleClaimInterest(index)}
													disabled={isClaimPending}
													className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-nectr-600 hover:bg-nectr-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
												>
													<CurrencyDollarIcon className="w-5 h-5 mr-2" />
													Claim Interest
												</button>
												<button
													onClick={() => handleUnstake(index)}
													disabled={isWithdrawPending}
													className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-nectr-700 bg-nectr-50 hover:bg-nectr-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
												>
													<ArrowDownCircleIcon className="w-5 h-5 mr-2" />
													Unstake
												</button>
											</div>
										</div>
									</div>
								)
						)}

						{(!activeStakes || activeStakes.filter((s) => !s.withdrawn).length === 0) && (
							<div className="text-center py-8 text-gray-500">No active stakes found</div>
						)}
					</motion.div>
				)}

				{/* Mint Modal */}
				{showMintModal && (
					<div className="fixed inset-0 flex items-center justify-center z-50">
						<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowMintModal(false)} />
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="relative bg-white rounded-2xl p-6 shadow-xl max-w-md w-full mx-4"
						>
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-lg font-semibold text-gray-800">Mint NECTR Tokens</h3>
								<button
									onClick={() => setShowMintModal(false)}
									className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
								>
									<XMarkIcon className="w-5 h-5" />
								</button>
							</div>

							<div className="space-y-4">
								{/* Current Balance */}
								<div className="text-sm text-gray-600">
									Current Balance: {nectrBalance ? formatEther(nectrBalance) : "0"} NECTR
								</div>

								{/* Mint Amount Selection */}
								<div className="grid grid-cols-3 gap-3">
									{MINT_AMOUNTS.map((option) => (
										<button
											key={option.amount}
											onClick={() => setSelectedMintAmount(option.amount)}
											className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
												selectedMintAmount === option.amount
													? "bg-nectr-600 text-white shadow-lg transform scale-[1.02]"
													: "bg-gray-50 text-gray-600 hover:bg-nectr-50 hover:text-nectr-600"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>

								{/* Error Message */}
								{mintError && <div className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{mintError}</div>}

								{/* Mint Button */}
								<button
									onClick={handleMint}
									disabled={isMintPending || mintSuccess}
									className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 
										disabled:opacity-50 disabled:cursor-not-allowed
										${getMintButtonStyle()}
										${mintSuccess ? "cursor-default" : ""}
									`}
								>
									<span className="flex items-center justify-center">
										{isMintPending && <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />}
										{mintSuccess && <CheckCircleIcon className="w-5 h-5 mr-2" />}
										{getMintButtonText()}
									</span>
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
