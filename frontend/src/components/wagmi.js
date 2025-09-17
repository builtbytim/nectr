
import { polygonAmoy } from "wagmi/chains";
import { getDefaultWallets, } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { createConfig } from "wagmi";


const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const { connectors } = getDefaultWallets({
    appName: "Nectr Staking",
    projectId,
    chains: [polygonAmoy],
});

const wagmiConfig = createConfig({
    chains: [polygonAmoy],
    transports: {
        [polygonAmoy.id]: http(),
    },
    connectors,
});

export default wagmiConfig