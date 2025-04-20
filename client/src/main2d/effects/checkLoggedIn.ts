import type { Dispatch } from "../ProgramTypes"
import type { RelmRestAPI } from "~/main/RelmRestAPI"

export const checkLoggedIn = (api: RelmRestAPI) => async (dispatch: Dispatch) => {
  const data = await api.getIdentityData()

  if (data.isConnected) {
    dispatch({
      id: "didSignIn",
    })
  } else {
    dispatch({
      id: "signIn",
    })
  }
}
