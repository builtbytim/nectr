import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useState } from "react";
import {
	HomeIcon,
	BoltIcon,
	UsersIcon,
	Bars3Icon,
	XMarkIcon,
	CubeIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Amoy Chain Icon
const AmoyIcon = () => (
	<svg viewBox="0 0 38 33" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M29.2 8.3c-.9-.5-2-.5-2.9 0l-5.7 3.3-3.9 2.2-5.7 3.3c-.9.5-2 .5-2.9 0l-4.4-2.6c-.9-.5-1.4-1.4-1.4-2.4V6.8c0-1 .5-1.9 1.4-2.4l4.4-2.6c.9-.5 2-.5 2.9 0l4.4 2.6c.9.5 1.4 1.4 1.4 2.4v3.3l3.9-2.2V4.6c0-1-.5-1.9-1.4-2.4l-8.3-4.8c-.9-.5-2-.5-2.9 0L4.4 2.2C3.5 2.7 3 3.6 3 4.6v9.6c0 1 .5 1.9 1.4 2.4l8.3 4.8c.9.5 2 .5 2.9 0l5.7-3.3 3.9-2.2 5.7-3.3c.9-.5 2-.5 2.9 0l4.4 2.6c.9.5 1.4 1.4 1.4 2.4v5.3c0 1-.5 1.9-1.4 2.4l-4.4 2.6c-.9.5-2 .5-2.9 0l-4.4-2.6c-.9-.5-1.4-1.4-1.4-2.4v-3.3l-3.9 2.2v3.3c0 1 .5 1.9 1.4 2.4l8.3 4.8c.9.5 2 .5 2.9 0l8.3-4.8c.9-.5 1.4-1.4 1.4-2.4v-9.6c0-1-.5-1.9-1.4-2.4l-8.3-4.8z"
			fill="#5A3BBE"
		/>
	</svg>
);

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [location] = useLocation();

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ type: "spring", stiffness: 100 }}
			className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
		>
			<div className="max-w-7xl mx-auto">
				<div className="backdrop-blur-xl bg-white/70 rounded-2xl px-4 sm:px-6 py-4 shadow-lg border border-gray-100">
					<div className="flex justify-between items-center">
						{/* Logo */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="flex items-center"
						>
							<Link href="/">
								<a className="flex items-center space-x-3 group">
									<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-nectr-400 to-purple-500 p-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
										<CubeIcon className="w-full h-full text-white" />
									</div>
									<span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent group-hover:from-nectr-500 group-hover:to-purple-500 transition-all duration-300">
										Nectr
									</span>
								</a>
							</Link>
						</motion.div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-8">
							<NavLink href="/" icon={<HomeIcon className="w-5 h-5" />} isActive={location === "/"}>
								Home
							</NavLink>
							<NavLink href="/staking" icon={<BoltIcon className="w-5 h-5" />} isActive={location === "/staking"}>
								Staking
							</NavLink>
							<NavLink href="/social" icon={<UsersIcon className="w-5 h-5" />} isActive={location === "/social"}>
								Social
							</NavLink>
						</div>

						{/* Connect Wallet & Mobile Menu Button */}
						<div className="flex items-center space-x-3">
							{/* Mobile Menu Button */}
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="p-2 rounded-xl text-gray-600 hover:text-nectr-600 transition-colors md:hidden"
							>
								{isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
							</button>

							{/* Connect Button - Simplified on Mobile */}
							<div className="hidden sm:block">
								<ConnectButton.Custom>
									{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
										const ready = mounted;
										const connected = ready && account && chain;

										return (
											<div
												{...(!ready && {
													"aria-hidden": true,
													style: {
														opacity: 0,
														pointerEvents: "none",
														userSelect: "none",
													},
												})}
											>
												{(() => {
													if (!connected) {
														return (
															<button
																onClick={openConnectModal}
																className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl font-semibold bg-gradient-to-r from-nectr-400 to-purple-500 text-white hover:from-nectr-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
															>
																Connect
															</button>
														);
													}

													return (
														<div className="flex items-center space-x-3">
															<button
																onClick={openChainModal}
																className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-nectr-400 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
															>
																<div className="w-5 h-5">
																	<AmoyIcon />
																</div>
																<span className="text-gray-800">{chain.name}</span>
															</button>

															<button
																onClick={openAccountModal}
																className="px-3 py-2 text-sm rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-nectr-400 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
															>
																{account.displayName}
															</button>
														</div>
													);
												})()}
											</div>
										);
									}}
								</ConnectButton.Custom>
							</div>
						</div>
					</div>

					{/* Mobile Navigation Menu */}
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="md:hidden mt-4 pt-4 border-t border-gray-100"
						>
							<div className="flex flex-col space-y-2">
								<MobileNavLink
									href="/"
									icon={<HomeIcon className="w-5 h-5" />}
									onClick={() => setIsMenuOpen(false)}
									isActive={location === "/"}
								>
									Home
								</MobileNavLink>
								<MobileNavLink
									href="/staking"
									icon={<BoltIcon className="w-5 h-5" />}
									onClick={() => setIsMenuOpen(false)}
									isActive={location === "/staking"}
								>
									Staking
								</MobileNavLink>
								<MobileNavLink
									href="/social"
									icon={<UsersIcon className="w-5 h-5" />}
									onClick={() => setIsMenuOpen(false)}
									isActive={location === "/social"}
								>
									Social
								</MobileNavLink>
							</div>

							{/* Mobile Wallet Section */}
							<div className="mt-4 space-y-3">
								<ConnectButton.Custom>
									{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
										const ready = mounted;
										const connected = ready && account && chain;

										if (!connected) {
											return (
												<button
													onClick={openConnectModal}
													className="w-full px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-nectr-400 to-purple-500 text-white text-sm"
												>
													Connect Wallet
												</button>
											);
										}

										return (
											<div className="space-y-3">
												{/* Chain Button */}
												<button
													onClick={openChainModal}
													className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-nectr-400 transition-all duration-300"
												>
													<div className="flex items-center space-x-3">
														<div className="w-5 h-5">
															<AmoyIcon />
														</div>
														<span className="text-gray-800 text-sm">{chain.name}</span>
													</div>
													<ChevronDownIcon className="w-4 h-4 text-gray-500" />
												</button>

												{/* Account Button */}
												<button
													onClick={openAccountModal}
													className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-nectr-400 transition-all duration-300"
												>
													<div className="flex items-center space-x-3">
														<div className="w-2 h-2 rounded-full bg-green-400"></div>
														<span className="text-gray-800 text-sm">{account.displayName}</span>
													</div>
													<ChevronDownIcon className="w-4 h-4 text-gray-500" />
												</button>
											</div>
										);
									}}
								</ConnectButton.Custom>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</motion.nav>
	);
}

function NavLink({ href, children, icon, isActive }) {
	return (
		<Link href={href}>
			<a className="relative group flex items-center space-x-2">
				<div
					className={`${
						isActive ? "text-nectr-600" : "text-gray-600 group-hover:text-nectr-600"
					} transition-colors duration-200`}
				>
					{icon}
				</div>
				<span
					className={`${
						isActive ? "text-nectr-600" : "text-gray-600 group-hover:text-nectr-600"
					} transition-colors duration-200 font-medium`}
				>
					{children}
				</span>
				<span
					className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-nectr-400 to-purple-500 transition-all duration-300 ${
						isActive ? "w-full" : "w-0 group-hover:w-full"
					}`}
				></span>
			</a>
		</Link>
	);
}

function MobileNavLink({ href, children, icon, onClick, isActive }) {
	return (
		<Link href={href}>
			<a
				className={`flex items-center space-x-2 px-2 py-2 rounded-lg ${
					isActive ? "bg-nectr-50 text-nectr-600" : "hover:bg-gray-50 text-gray-600 hover:text-nectr-600"
				} transition-colors duration-200`}
				onClick={onClick}
			>
				<div className="text-current">{icon}</div>
				<span className="font-medium">{children}</span>
			</a>
		</Link>
	);
}
