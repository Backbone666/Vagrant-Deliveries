import axios from "axios"

interface ContractInfo {
  origin?: string;
  destination: string;
  volume: number;
  reward: number | string;
  collateral: number | string;
  link: string;
}

export const ntfy = {
  async send(message: string, title: string, tags: string[] = []): Promise<void> {
    const ntfyUrl = process.env.NTFY_URL
    const ntfyTopic = process.env.NTFY_TOPIC

    if (!ntfyUrl || !ntfyTopic) {
      console.warn("NTFY_URL or NTFY_TOPIC is not set. Skipping notification.")
      return
    }

    try {
      await axios.post(`${ntfyUrl}/${ntfyTopic}`, message, {
        headers: {
          "Title": title,
          "Tags": tags.join(",")
        }
      })
    } catch (error) {
      console.error("Failed to send ntfy notification:", error)
    }
  },

  async notifyNewContract(contract: ContractInfo, creator: string): Promise<void> {
    const message = `Creator: ${creator}\nRoute: ${contract.origin || "Jita"} -> ${contract.destination}\nVolume: ${Number(contract.volume).toLocaleString()} m³\nReward: ${Number(contract.reward).toLocaleString()} ISK\nCollateral: ${Number(contract.collateral).toLocaleString()} ISK\nLink: ${contract.link}`
    await this.send(message, "📦 New Contract Submitted", ["package", "new_contract"])
  },

  async notifyStatusChange(contractId: number, status: string, actor: string): Promise<void> {
    const message = `Status changed to ${status.toUpperCase()} by ${actor}`
    const tags = {
      "ongoing": ["arrow_right", "ongoing"],
      "completed": ["white_check_mark", "completed"],
      "failed": ["x", "failed"],
    }
    await this.send(message, `📝 Contract #${contractId} Update`, tags[status] || [])
  }
}
