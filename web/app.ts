import { config } from "dotenv"
config()

import path from "path"

import express, { Response, Request, NextFunction } from "express"
const app = express()

import helmet from "helmet"
import morgan from "morgan"
import { router, init as controllersInit } from "./controllers"
import cookieParser from "cookie-parser"
import { env } from "./env"
import session from "express-session"
import sequelizeSession from "connect-session-sequelize"
import { db } from "../web/db"
import { HTTPStatusCodes } from "./index"
import rateLimit from "express-rate-limit"

app.use(cookieParser(env("EVE_DELIVERIES_SESSION_SECRET")))
app.use(helmet({
  contentSecurityPolicy: {
    reportOnly: true
  }
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.set("trust proxy", 1)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

const SequelizeStore = sequelizeSession(session.Store)
const Store = new SequelizeStore({
  db: db
})

app.use(session({
  name: "vagrant-deliveries",
  secret: env("EVE_DELIVERIES_SESSION_SECRET"),
  store: Store,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: process.env.NODE_ENV !== "dev", maxAge: 24 * 60 * 60 * 1000 }
}))

Store.sync()

controllersInit()
app.use(router)

if (process.env.NODE_ENV !== "dev") {
  // In production (Docker), serve the React frontend build
  const clientDistPath = path.join(__dirname, "../../client/dist")
  app.use(express.static(clientDistPath))

  // SPA Fallback: Any route not handled by API serves index.html
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, "index.html"))
  })
}

app.locals.character = {}

if (process.env.NODE_ENV !== "dev") {
  app.use("*", function(e: Error, req: Request, res: Response, next: NextFunction) {
    console.error(e)
    res.sendStatus(HTTPStatusCodes.InternalServerError).redirect(`/${HTTPStatusCodes.InternalServerError}`)
    next()
  })
}

export default app