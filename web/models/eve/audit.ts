import { DataTypes, Model, Sequelize, Optional } from "sequelize"

export interface EveContractAuditAttributes {
  id: number
  contractId: number
  actorId: number
  actorName: string
  action: "create" | "accept" | "complete" | "reject" | "fail" | "cancel"
  details?: string
  timestamp: Date
}

export interface EveContractAuditCreationAttributes extends Optional<EveContractAuditAttributes, "id" | "timestamp"> {}

class EveContractAudit extends Model<EveContractAuditAttributes, EveContractAuditCreationAttributes> implements EveContractAuditAttributes {
  id!: number
  contractId!: number
  actorId!: number
  actorName!: string
  action!: "create" | "accept" | "complete" | "reject" | "fail" | "cancel"
  details?: string
  timestamp!: Date
}

export function init(db: Sequelize): void {
  EveContractAudit.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    contractId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    actorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    actorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM("create", "accept", "complete", "reject", "fail", "cancel"),
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    sequelize: db,
    tableName: "eve_contract_audits",
    updatedAt: false
  })
}

export async function log(
  contractId: number,
  actor: { id: number, name: string },
  action: EveContractAuditAttributes["action"],
  details?: string
): Promise<void> {
  await EveContractAudit.create({
    contractId,
    actorId: actor.id,
    actorName: actor.name,
    action,
    details
  })
}

export function getHistory(contractId: number): Promise<EveContractAudit[]> {
  return EveContractAudit.findAll({
    where: { contractId },
    order: [["timestamp", "ASC"]]
  })
}