import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
	NewspaperIcon,
	ChatBubbleLeftRightIcon,
	ClockIcon,
	GlobeAltIcon,
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

// RSS Feed URLs with categories
const RSS_FEEDS = [
	{
		url: "https://coinjournal.net/news/feed/",
		name: "Markets & Trading",
		category: "Markets",
	},
	{
		url: "https://web3wire.org/feed/gn",
		name: "Web3 & Technology",
		category: "Technology",
	},
	{
		url: "https://web3wire.org/category/crypto/feed/gn",
		name: "DeFi & Protocols",
		category: "DeFi",
	},
	{
		url: "https://www.ccn.com/news/crypto-news/feeds/",
		name: "Gaming & NFTs",
		category: "Gaming",
	},
	{
		url: "https://coinjournal.net/news/feed/",
		name: "DAOs & Governance",
		category: "DAO",
	},
];

// CORS Proxy URL
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export default function Social() {
	const [newsItems, setNewsItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFeed, setSelectedFeed] = useState(RSS_FEEDS[0]);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState("community"); // 'community' or 'news'

	const fetchRSSFeed = async (feedUrl) => {
		try {
			const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`, {
				headers: {
					"Content-Type": "application/xml",
					Accept: "application/xml",
				},
			});

			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(response.data, "text/xml");
			const items = xmlDoc.querySelectorAll("item");

			return Array.from(items).map((item) => ({
				id: item.querySelector("guid")?.textContent || item.querySelector("link")?.textContent,
				title: item.querySelector("title")?.textContent,
				date: new Date(item.querySelector("pubDate")?.textContent).toLocaleDateString(),
				summary:
					item
						.querySelector("description")
						?.textContent?.replace(/<[^>]*>/g, "")
						.slice(0, 150) + "...",
				link: item.querySelector("link")?.textContent,
				source: xmlDoc.querySelector("channel > title")?.textContent,
				category: selectedFeed.category,
			}));
		} catch (error) {
			console.error("Error fetching RSS feed:", error);
			setError("Failed to load news feed. Please try again later.");
			return [];
		}
	};

	const refreshFeed = async () => {
		setRefreshing(true);
		setError(null);
		const items = await fetchRSSFeed(selectedFeed.url);
		setNewsItems(items);
		setLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		refreshFeed();
	}, [selectedFeed]);

	const TabButton = ({ tab, icon: Icon, children }) => (
		<button
			onClick={() => setActiveTab(tab)}
			className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-all duration-200 ${
				activeTab === tab ? "text-nectr-600 border-b-2 border-nectr-600" : "text-gray-500 hover:text-nectr-500"
			}`}
		>
			<Icon className="w-5 h-5" />
			<span>{children}</span>
		</button>
	);

	return (
		<div className="pt-36">
			<div className="max-w-7xl mx-auto px-4">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-8 lg:mb-16"
				>
					<h1 className="text-4xl font-bold mb-4">
						<span className="bg-gradient-to-r from-nectr-600 to-purple-600 bg-clip-text text-transparent">
							Community Hub
						</span>
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">Stay updated with the latest news and community discussions</p>
				</motion.div>

				{/* Mobile Tab Switcher */}
				<div className="lg:hidden mb-6">
					<div className="flex border-b border-gray-200">
						<TabButton tab="community" icon={ChatBubbleLeftRightIcon}>
							Community
						</TabButton>
						<TabButton tab="news" icon={NewspaperIcon}>
							News
						</TabButton>
					</div>
				</div>

				<div className="grid lg:grid-cols-2 gap-8">
					{/* Telegram Feed */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className={`relative lg:h-[calc(100vh-16rem)] lg:sticky lg:top-36 ${
							activeTab !== "community" ? "hidden lg:block" : ""
						}`}
					>
						<div className="absolute inset-0 bg-gradient-to-br from-nectr-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30"></div>
						<div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl h-full">
							<div className="flex items-center justify-between mb-8">
								<div className="flex items-center space-x-3">
									<div className="p-2 rounded-xl bg-gradient-to-br from-nectr-400/20 to-purple-500/20 text-nectr-600">
										<ChatBubbleLeftRightIcon className="w-6 h-6" />
									</div>
									<h2 className="text-2xl font-bold text-gray-800">Community Feed</h2>
								</div>
							</div>
							<div className="h-[calc(100%-5rem)] overflow-y-auto rounded-xl bg-white/50 md:p-2 space-y-6">
								{/* Twitter Embeds */}
								<blockquote className="twitter-tweet">
									<p lang="en" dir="ltr">
										They said we were crazy for building for African languages. <br />
										Now they're buying developer credits.
									</p>
									&mdash; Temi (@iamtemibabs){" "}
									<a href="https://twitter.com/iamtemibabs/status/1968291619180089507?ref_src=twsrc%5Etfw">
										September 17, 2025
									</a>
								</blockquote>

								<blockquote className="twitter-tweet">
									<p lang="en" dir="ltr">
										bro I went somewhere and ppl never ever heard of crypto man and the others say it's one of those
										ponzis <br />
										<br />
										y'all keep pvp'ing and launching new L1s that no one is gonna use
										<br />
										<br />
										retail isn't coming
									</p>
									&mdash; Tim ⚛️ (@timokonkwo_){" "}
									<a href="https://twitter.com/timokonkwo_/status/1968202808240623997?ref_src=twsrc%5Etfw">
										September 17, 2025
									</a>
								</blockquote>

								<script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
							</div>
						</div>
					</motion.div>

					{/* News Feed */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className={`space-y-6 ${activeTab !== "news" ? "hidden lg:block" : ""}`}
					>
						<div className="bg-white/80 backdrop-blur-sm sticky top-24 z-10 p-4 rounded-2xl shadow-sm space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className="p-2 rounded-xl bg-gradient-to-br from-nectr-400/20 to-purple-500/20 text-nectr-600">
										<NewspaperIcon className="w-6 h-6" />
									</div>
									<h2 className="text-2xl font-bold text-gray-800">News Feed</h2>
								</div>
								<button
									onClick={refreshFeed}
									disabled={refreshing}
									className="p-2 rounded-lg text-gray-600 hover:text-nectr-600 hover:bg-nectr-50 transition-all duration-200"
								>
									<ArrowPathIcon className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
								</button>
							</div>

							{/* Feed Selector */}
							<select
								value={selectedFeed.url}
								onChange={(e) => setSelectedFeed(RSS_FEEDS.find((feed) => feed.url === e.target.value))}
								className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-nectr-400 focus:border-transparent bg-white/50"
							>
								{RSS_FEEDS.map((feed) => (
									<option key={feed.url} value={feed.url}>
										{feed.name}
									</option>
								))}
							</select>
						</div>

						{error ? (
							<div className="bg-red-50 text-red-600 p-4 rounded-xl">
								<p>{error}</p>
								<button onClick={refreshFeed} className="mt-2 text-sm font-medium hover:text-red-700 transition-colors">
									Try Again
								</button>
							</div>
						) : loading ? (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="animate-pulse">
										<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2"></div>
									</div>
								))}
							</div>
						) : (
							<div className="space-y-6">
								{newsItems.map((item) => (
									<motion.article
										key={item.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.3 }}
										className="group relative"
									>
										<div className="absolute inset-0 bg-gradient-to-br from-nectr-400 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											className="relative block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
										>
											<div className="flex justify-between items-start mb-4">
												<div className="space-y-1">
													<h3 className="text-lg font-semibold text-gray-800 group-hover:text-nectr-600 transition-colors duration-200">
														{item.title}
													</h3>
													<div className="flex items-center space-x-4 text-sm">
														<div className="flex items-center text-gray-500">
															<ClockIcon className="w-4 h-4 mr-1" />
															<span>{item.date}</span>
														</div>
														<div className="flex items-center text-nectr-500">
															<GlobeAltIcon className="w-4 h-4 mr-1" />
															<span>{item.category}</span>
														</div>
													</div>
												</div>
												<ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-nectr-500 transition-colors duration-200" />
											</div>
											<p className="text-gray-600 leading-relaxed">{item.summary}</p>
										</a>
									</motion.article>
								))}
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
