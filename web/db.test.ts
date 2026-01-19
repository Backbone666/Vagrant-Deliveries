import { db, init } from "./db"
import fs from "fs"
import { env } from "./env"

jest.mock("./env", () => ({
  env: jest.fn(),
}))

describe("Database Initialization", () => {
  afterEach(async () => {
    if (db && db.close) {
      try {
        await db.close()
      } catch {
        // This can happen if the connection was never established or already closed.
        // It's safe to ignore in this test context.
      }
    }
    // Clean up the test database file
    if (fs.existsSync("data/database.sqlite")) {
      fs.unlinkSync("data/database.sqlite")
    }
    // Clean up the data directory
    if (fs.existsSync("data")) {
      fs.rmdirSync("data")
    }
    jest.clearAllMocks()
  })

  it("should connect to sqlite when DB_CONNECTION is set to sqlite", async () => {
    (env as jest.Mock).mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === "DB_CONNECTION") return "sqlite"
      return defaultValue
    })
    await init()
    await db.authenticate()
    expect(db.getDialect()).toBe("sqlite")
  })

  it("should attempt to connect to mysql and fail with wrong credentials", async () => {
    (env as jest.Mock).mockImplementation((key: string, defaultValue?: unknown) => {
      const mockEnv: { [key: string]: string } = {
        DB_CONNECTION: "mysql",
        MYSQL_DATABASE: "test",
        MYSQL_USER: "test",
        MYSQL_PASSWORD: "wrongpassword",
        MYSQL_HOST: "localhost",
      }
      return mockEnv[key] || defaultValue
    })

    await expect(init()).rejects.toThrow()
  })
})