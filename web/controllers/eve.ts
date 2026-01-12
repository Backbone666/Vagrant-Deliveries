import * as alliance from "../models/eve/alliance.js"
import * as character from "../models/eve/character.js"
import * as contract from "../models/eve/contract.js"
import * as corporation from "../models/eve/corporation.js"
import * as destination from "../models/eve/destinations.js"
import { eveAuth } from "../middlewares/eve.js"
import * as eveHelpers from "../helpers/eve.js"
import { pricing } from "../helpers/pricing.js"
import * as audit from "../models/eve/audit.js"
import { discord } from "../helpers/discord.js"
import { Request, Response, Router } from "express"
import * as invmarketgroups from "../models/eve/invmarketgroups.js"
import * as invtypes from "../models/eve/invtypes.js"
import moment from "moment-timezone"
import axios from "axios"
import * as settings from "../models/eve/settings.js"
import crypto from "crypto"
import { env } from "../env/index.js"
import { HTTPStatusCodes } from "web/index.js"

declare module "express-session" {
  interface SessionData {
    state: string,
    eveToken: string,
    character?: character.EveCharacters | null
    views: number
  }
}

export interface Alert {
  error?: boolean
  alert: string
}

export interface ContractsResponse {
  character: character.EveCharacters
  pending: contract.EveContractsAttributes[],
  ongoing: contract.EveContractsAttributes[],
  finalized: contract.EveContractsAttributes[],
  director: boolean,
  freighter: boolean,
  title: string,
  active: string
}

export interface DirectorSettingsBody {
  maxVolume: number
}

export interface DirectorDestinationsBody {
  name: string,
  image: string
}

export let router: Router

export function init(): void {
  router = Router()

  router.get("/login", function(req: Request, res: Response): void {
    const state = crypto.randomBytes(64).toString("hex")
    req.session.state = state
    res.redirect(`https://login.eveonline.com/oauth/authorize/?response_type=code&redirect_uri=${env("EVE_CALLBACK")}&client_id=${env("EVE_ID")}&state=${state}`)
  })

  router.post("/callback", async function(req: Request, res: Response): Promise<void> {
    const sessionState = req.session.state
    delete req.session.state

    if (req.query.state !== sessionState) {
      res.sendStatus(403)
      return
    }

    try {
      const auth = Buffer.from(`${env("EVE_ID")}:${env("EVE_SECRET")}`).toString("base64")
      const tokenResponse = await axios.post("https://login.eveonline.com/oauth/token",
        new URLSearchParams({
          "grant_type": "authorization_code",
          "code": req.query.code as string
        }), {
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })

      const token = tokenResponse.data.access_token

      const verifyResponse = await axios.get("https://login.eveonline.com/oauth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      const id = verifyResponse.data.CharacterID

      const [charResponse, portraitResponse] = await Promise.all([
        axios.get(`https://esi.evetech.net/latest/characters/${id}/`),
        axios.get(`https://esi.evetech.net/latest/characters/${id}/portrait/`)
      ])

      const charInfo = charResponse.data
      const name = charInfo.name
      const portrait = portraitResponse.data.px64x64.replace(/^http:\/\//i, "https://")
      const birthday = moment(charInfo.birthday).format("YYYY-MM-DD HH:mm:ss")
      const allianceId = charInfo.alliance_id
      const corporationId = charInfo.corporation_id

      let corpResponse, corpIconResponse, allianceResponse, allianceIconResponse

      if (allianceId === undefined) {
        [corpResponse, corpIconResponse] = await Promise.all([
          axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/`),
          axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/icons/`)
        ])
      } else {
        [corpResponse, corpIconResponse, allianceResponse, allianceIconResponse] = await Promise.all([
          axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/`),
          axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/icons/`),
          axios.get(`https://esi.evetech.net/latest/alliances/${allianceId}/`),
          axios.get(`https://esi.evetech.net/latest/alliances/${allianceId}/icons/`)
        ])
      }

      const corporationName = corpResponse.data.name
      const corporationPortrait = corpIconResponse.data.px64x64.replace(/^http:\/\//i, "https://")
      let allianceName: string | undefined = undefined
      let alliancePortrait: string | undefined = undefined

      if (allianceResponse && allianceIconResponse) {
        allianceName = allianceResponse.data.name
        alliancePortrait = allianceIconResponse.data.px64x64.replace(/^http:\/\//i, "https://")
      }

      const attributes: character.EveCharacterAttributes = {
        id: id,
        token: token,
        characterName: name,
        characterPortrait: portrait,
        characterBirthday: birthday,
        corporationId: corporationId,
        corporationName: corporationName,
        corporationPortrait: corporationPortrait,
        allianceId: allianceId,
        allianceName: allianceName,
        alliancePortrait: alliancePortrait,
        freighter: false,
        director: false
      }

      const eveCharacter = (await character.set(attributes))[0]

      const userBanned = await character.isBanned(eveCharacter.characterName)
      const allianceAllowed = eveCharacter.allianceName
        ? await alliance.isAllowed(eveCharacter.allianceName)
        : true
      const corporationAllowed = await corporation.isAllowed(eveCharacter.corporationName)
      const isDirector = eveCharacter.director
      const isFreighter = eveCharacter.freighter
      const isAllowed = !userBanned && (allianceAllowed || corporationAllowed || isDirector || isFreighter)

      if (!isAllowed) {
        res.redirect("/unauthorized")
        return
      }

      req.session.character = eveCharacter
      res.redirect("/")
    } catch (error) {
      console.error("Login callback error:", error)
      res.sendStatus(500)
    }
  })

  router.get("/index", async function(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      character: req.session.character || {},
      destinations: await destination.getAll(),
      title: "Home - Mango Deliveries",
      active: "Home"
    })
  })

  router.get("/character", async function(req: Request, res: Response): Promise<void> {
    if (!req.session.character) {
      res.redirect("/login")
    }

    res.status(200).json(req.session.character)
  })

  router.get("/query", async function(req: Request, res: Response): Promise<void> {
    if (req.session.eveToken) {
      const eveCharacter = await character.getByToken(req.session.eveToken)
      req.session.character = eveCharacter
    }

    if (!req.session.character) {
      res.status(403).json({
        alert: "You need to login before submitting contracts."
      })

      return
    }

    const eveCharacter = req.session.character

    const userBanned = await character.isBanned(eveCharacter.characterName)
    const allianceAllowed = eveCharacter.allianceName ? await alliance.isAllowed(eveCharacter.allianceName) : true
    const corporationAllowed = await corporation.isAllowed(eveCharacter.corporationName)
    const isDirector = eveCharacter.director
    const isFreighter = eveCharacter.freighter
    const isAllowed = !userBanned && (allianceAllowed || corporationAllowed || isDirector || isFreighter)

    if (!isAllowed) {
      res.status(403).json({
        alert: "You aren't allowed to submit contracts. Either you have been banned, or your corporation isn't whitelisted."
      })

      return
    }

    const validate = await eveHelpers.validateAppraisal(req.query)
    if ("invalid" in validate) {
      res.status(400).json(validate)
      return
    }

    const appraisal = validate
    const price = appraisal.totals.sell
    const multiplier = typeof req.query.multiplier === "string"
      ? parseInt(req.query.multiplier, 10)
      : 1

    res.status(200).json({
      jita: (price * multiplier).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      jitaShort: eveHelpers.nShortener(price * multiplier, 2),
      quote: (price * 1.13 * multiplier).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      quoteShort: eveHelpers.nShortener(price * 1.13 * multiplier, 2)
    })
  })

  router.post("/quote", async function(req: Request, res: Response): Promise<void> {
    const result = await pricing.calculate(req.body);
    res.json(result);
  })

  router.post("/submit", async function(req: Request, res: Response) : Promise<void> {
    if (req.session.eveToken) {
      const eveCharacter = await character.getByToken(req.session.eveToken)
      req.session.character = eveCharacter
    }

    if (!req.session.character) {
      res.status(403).json({
        alert: "You need to login before submitting contracts."
      })

      return
    }

    const eveCharacter = req.session.character

    const userBanned = await character.isBanned(eveCharacter.characterName)
    const allianceAllowed = eveCharacter.allianceName ? await alliance.isAllowed(eveCharacter.allianceName) : true
    const corporationAllowed = await corporation.isAllowed(eveCharacter.corporationName)
    const isDirector = eveCharacter.director
    const isFreighter = eveCharacter.freighter
    const isAllowed = !userBanned && (allianceAllowed || corporationAllowed || isDirector || isFreighter)

    if (!isAllowed) {
      res.status(403).json({
        alert: "You aren't allowed to submit contracts. Either you have been banned, or your corporation isn't whitelisted."
      })

      return
    }

    const validate = await eveHelpers.validateAppraisal(req.body)
    if ("invalid" in validate) {
      res.status(400).json(validate)
      return
    }

    const appraisal = validate
    const link = req.body.link
    const destination = req.body.destination
    const price = appraisal.totals.sell
    const multiplier = req.body.multiplier || 1
    const volume = appraisal.totals.volume

    const createdContract = await contract.set({
      link: link,
      destination: destination,
      value: price * multiplier,
      valueFormatted: (price * multiplier).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      valueShort: eveHelpers.nShortener(price * multiplier),
      quote: price * 1.13 * multiplier,
      quoteFormatted: Math.round(price * 1.13 * multiplier).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      quoteShort: eveHelpers.nShortener(price * 1.13 * multiplier),
      volume: volume * multiplier,
      volumeFormatted: (volume * multiplier).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      valueVolumeRatio: Math.round(price / volume),
      valueVolumeRatioFormatted: Math.round(price / volume).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      multiplier: multiplier,
      submitterId: req.session.character.id,
      submitterName: req.session.character.characterName,
      submitted: moment().unix(),
      submittedFormatted: moment().format("MMMM Do YYYY, HH:mm:ss"),
      status: "pending"
    })

    const newContract = createdContract[0]

    // Audit Log
    await audit.log(
      newContract.id,
      { id: req.session.character.id, name: req.session.character.characterName },
      "create",
      `Volume: ${volume}, Reward: ${newContract.quote}`
    )

    // Discord Notification
    await discord.notifyNewContract({
      origin: "Jita", // Default for now
      destination: destination,
      volume: volume * multiplier,
      reward: newContract.quote,
      collateral: price * multiplier,
      link: link
    }, req.session.character.characterName)

    res.status(200).json({
      alert: "Contract submitted. Click here to see it."
    })
  })

  router.get("/history", eveAuth, async function(req: Request, res: Response): Promise<void> {
    if (!req.session.character) {
        res.sendStatus(403)
        return
    }

    const contracts = await contract.getAllFinalized(req.session.character.id)
    res.json(contracts)
  })

  router.get("/contracts", eveAuth, async function(req: Request, res: Response): Promise<void> {
    if (!req.session.character) {
      res.sendStatus(403)
      return
    }

    const freighter = req.session.character.freighter || req.session.character.director
    const characterID = freighter ? undefined : req.session.character.id

    const contracts = await Promise.all([
      contract.getAllPending(characterID),
      contract.getAllOngoing(characterID),
      contract.getAllFinalized(characterID)
    ])

    const pending = contracts[0]
    const ongoing = contracts[1]
    const finalized = contracts[2]

    res.status(HTTPStatusCodes.OK).json({
      character: req.session.character || {},
      pendingContracts: pending,
      ongoingContracts: ongoing,
      finalizedContracts: finalized,
      director: req.session.character.director,
      freighter: freighter,
      title: "Contracts - Mango Deliveries",
      active: "Contracts"
    })
  })

  router.post("/contracts/submit", eveAuth, async function(req: Request, res: Response): Promise<void> {
    const director = req.session.character?.director
    const freighter = req.session.character?.freighter

    if (!director && !freighter) {
      res.sendStatus(403)
      return
    }

    if (req.body.tax && !director) {
      res.sendStatus(403)
      return
    }

    try {
      await Promise.all([
        eveHelpers.contracts.accept(req),
        eveHelpers.contracts.flag(req),
        eveHelpers.contracts.complete(req),
        eveHelpers.contracts.tax(req)
      ])
    } catch (errorID) {
      res.status(403).json({
        alert: `Contract #${errorID} was modified by someone else. Please reload the page.`
      })

      return
    }

    res.sendStatus(200)
  })

  router.get("/director", eveAuth, async function(req: Request, res: Response): Promise<void> {
    if (!req.session.character?.director) {
      res.status(HTTPStatusCodes.Forbidden).redirect(`/${HTTPStatusCodes.Forbidden}`)
      return
    }

    const bannedUsers = await character.getBanned()
    const freighters = await character.getFreighters()
    const allowedAlliances = await alliance.getAllowed()
    const allowedCorporations = await corporation.getAllowed()
    const bannedItemTypes = await invtypes.getBanned()
    const bannedMarketGroups = await invmarketgroups.getBanned()
    const eveSettings = await settings.get()

    res.status(200).json({
      character: req.session.character || {},
      title: "Director Panel - Mango Deliveries",
      active: "Director Panel",
      bannedUsers: bannedUsers,
      freighters: freighters,
      allowedAlliances: allowedAlliances,
      allowedCorporations: allowedCorporations,
      bannedItemTypes: bannedItemTypes,
      bannedMarketGroups: bannedMarketGroups,
      settings: eveSettings,
    })
  })

  router.post("/director/submit", eveAuth, async function(req: Request, res: Response): Promise<void> {
    if (!req.session.character?.director) {
      res.sendStatus(403)
      return
    }

    const action = req.body.action
    let response

    if (req.body.user) response = await eveHelpers.director.freighter(req.body.user, action)
    if (req.body.freighter) response = await eveHelpers.director.freighter(req.body.freighter, action)
    if (req.body.alliance) response = await eveHelpers.director.alliance(req.body.alliance, action)
    if (req.body.corporation) response = await eveHelpers.director.corporation(req.body.corporation, action)
    if (req.body.item) response = await eveHelpers.director.itemType(req.body.item, action)
    if (req.body.group) response = await eveHelpers.director.marketGroup(req.body.group, action)
    if (req.body.object === "settings") response = await eveHelpers.director.settings(req.body)
    if (req.body.object === "destination") response = await eveHelpers.director.destination(req.body, action)

    if (!response) {
      res.sendStatus(400)
      return
    }

    if (response.error) {
      res.status(404).json({ alert: response.alert })
      return
    }

    res.status(200).json(response)
  })
}
