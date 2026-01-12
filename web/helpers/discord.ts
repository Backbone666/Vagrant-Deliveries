import axios from "axios";
import { env } from "../env/index.js";

interface DiscordField {
    name: string;
    value: string;
    inline?: boolean;
}

interface DiscordEmbed {
    title: string;
    description?: string;
    color?: number;
    fields?: DiscordField[];
    footer?: { text: string };
    timestamp?: string;
}

export const discord = {
    async send(embed: DiscordEmbed): Promise<void> {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        
        if (!webhookUrl) {
            console.warn("DISCORD_WEBHOOK_URL is not set. Skipping notification.");
            return;
        }

        try {
            await axios.post(webhookUrl, {
                username: "VGLGI Dispatch",
                avatar_url: "https://images.evetech.net/Corporations/98746847/logo?size=128",
                embeds: [embed]
            });
        } catch (error) {
            console.error("Failed to send Discord notification:", error);
        }
    },

    async notifyNewContract(contract: any, creator: string): Promise<void> {
        await this.send({
            title: "📦 New Contract Submitted",
            color: 0xF1C40F, // Gold
            fields: [
                { name: "Creator", value: creator, inline: true },
                { name: "Route", value: `${contract.origin || 'Jita'} -> ${contract.destination}`, inline: true },
                { name: "Volume", value: `${Number(contract.volume).toLocaleString()} m³`, inline: true },
                { name: "Reward", value: `${Number(contract.reward).toLocaleString()} ISK`, inline: true },
                { name: "Collateral", value: `${Number(contract.collateral).toLocaleString()} ISK`, inline: true },
                { name: "Link", value: `[Open Contract](${contract.link})`, inline: false }
            ],
            timestamp: new Date().toISOString()
        });
    },

    async notifyStatusChange(contractId: number, status: string, actor: string): Promise<void> {
        const colors: Record<string, number> = {
            "ongoing": 0x3498DB, // Blue
            "completed": 0x2ECC71, // Green
            "failed": 0xE74C3C, // Red
        };

        await this.send({
            title: `📝 Contract #${contractId} Update`,
            description: `Status changed to **${status.toUpperCase()}** by ${actor}`,
            color: colors[status] || 0x95A5A6,
            timestamp: new Date().toISOString()
        });
    }
};
