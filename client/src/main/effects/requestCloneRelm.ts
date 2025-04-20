import type { AuthenticationHeaders } from "relm-common"
import type { PageParams } from "~/types"

import { config } from "~/config"
import type { Dispatch } from "../ProgramTypes"
import { RelmRestAPI } from "../RelmRestAPI"

export const requestCloneRelm =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) => async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(config.serverUrl, authHeaders, pageParams.relmName)

    let result
    try {
      result = await api.cloneRelm()

      const newUrl = window.location.origin + "/" + result.relmName
      window.location.replace(newUrl)
    } catch (err) {
      return dispatch({ id: "error", message: err.message })
    }
  }
