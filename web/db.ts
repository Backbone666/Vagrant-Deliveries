import { Sequelize } from "sequelize"
import { env } from "./env"
import * as models from "./models/eve"
import fs from "fs"

export let db: Sequelize

export async function init(): Promise<void> {
  if (env("DB_CONNECTION", "mysql") === "sqlite") {
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data")
    }
    db = new Sequelize({
      dialect: "sqlite",
      storage: "data/database.sqlite",
      logging: false
    })
  } else {
    db = new Sequelize(env("MYSQL_DATABASE"), env("MYSQL_USER"), env("MYSQL_PASSWORD"), {
      host: env("MYSQL_HOST", "localhost"),
      port: parseInt(env("MYSQL_PORT", "3306"), 10),
      pool: {
        max: parseInt(env("MYSQL_CONNECTION_LIMIT", "10"), 10)
      },
      dialect: "mysql",
      logging: false
    })
  }

  try {
    await db.authenticate()
    console.log("Database connection established.")
    await db.sync()
    models.init(db)
  } catch (e) {
    console.error("Unable to connect to the database:", e)
    throw e
  }
}