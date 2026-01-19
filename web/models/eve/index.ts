import { Sequelize } from "sequelize"
import * as alliance from "./alliance"
import * as character from "./character"
import * as contract from "./contract"
import * as corporation from "./corporation"
import * as destinations from "./destinations"
import * as invmarketgroups from "./invmarketgroups"
import * as invtypes from "./invtypes"
import * as invvolumes from "./invvolumes"
import * as settings from "./settings"
import * as audit from "./audit"

export { alliance, character, contract, corporation, destinations, invmarketgroups, invtypes, invvolumes, settings, audit }

import * as models from "./index"

export function init(db: Sequelize): void {
  for (const model of Object.values(models)) {
    if ("init" in model) {
      model.init(db)
    }
  }
}
