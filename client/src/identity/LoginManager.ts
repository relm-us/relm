import { Security } from "relm-common";

import { destroyParticipantId } from "~/identity/participantId";
import { LoginCredentials, RelmRestAPI } from "~/main/RelmRestAPI";
import {
  getRandomInitializedIdentityData,
  localIdentityData,
} from "~/stores/identityData";
import { AuthenticationResponse, SocialType } from "~/main/RelmOAuthAPI";
import { connectedAccount } from "~/stores/connectedAccount";
import { permits } from "~/stores/permits";
import { Dispatch } from "~/main/ProgramTypes";
import { ParticipantManager } from "./ParticipantManager";

type Result = { type: "success" } | { type: "error"; msg: string };

export class LoginManager {
  api: RelmRestAPI;
  dispatch: Dispatch;
  security: Security;
  participants: ParticipantManager;

  constructor(
    api: RelmRestAPI,
    dispatch: Dispatch,
    security: Security,
    participants: ParticipantManager
  ) {
    this.api = api;
    this.dispatch = dispatch;
    this.security = security;
    this.participants = participants;
  }

  async loginWithCredentials(creds: LoginCredentials) {
    const result = await this.api.login(creds);
    this.continueSuccessfulLogin(result);
  }

  async loginWithThirdParty(type: SocialType) {
    const result = await this.api.oAuth.openThirdPartyWindow(type);
  }

  async continueSuccessfulLogin(result: AuthenticationResponse) {
    if (result.status === "success") {
      try {
        await this.refreshPermits();

        await this.syncIdentityData();

        connectedAccount.set(true);

        this.dispatch({
          id: "notify",
          notification: "Successfully signed in!",
        });

        return true;
      } catch (error) {
        this.dispatch({ id: "error", message: error.message });

        return false;
      }
    }
  }

  async logout() {
    destroyParticipantId();
    this.security.secret = null;
    localIdentityData.set(getRandomInitializedIdentityData());
    connectedAccount.set(false);

    // this.dispatch({
    //   id: "enterPortal",
    //   relmName: this.relmName,
    //   entryway: this.entryway,
    // });
  }

  async saveLocalIdentityData() {
    await this.api.setIdentityData({
      identity: this.participants.local.identityData,
    });
  }

  async syncIdentityData() {
    const data = await this.api.getIdentityData();
    if (data.identity === null) {
      await this.saveLocalIdentityData();
    } else {
      this.dispatch({
        id: "updateLocalIdentityData",
        identityData: data.identity,
      });
    }
  }

  async refreshPermits() {
    const { permits: relmPermits } = await this.api.getPermitsAndMeta();
    permits.set(relmPermits);
  }

  // async function onAccountConnection() {
  //   const savedData = await worldManager.api.getIdentityData();

  //   let successText;
  //   if (savedData.identity === null) {
  //     // No identity data saved? Create some!
  //     await worldManager.api.setIdentityData({
  //       identity: worldManager.participants.local.identityData,
  //     });
  //     successText = $_("account_creation", {
  //       default: "Your account has been created!",
  //     });
  //   } else {
  //     // Load existing identity data!
  //     // dispatch({
  //     //   id: "updateLocalIdentityData",
  //     //   identityData: savedData.identity,
  //     // });
  //     successText = $_("account_connected", {
  //       default: "Your account has been connected!",
  //     });
  //   }

  //   // Close the sign in window.
  //   // exitScreen();
  //   notifyContext.addNotification({
  //     text: successText,
  //     position: "bottom-center",
  //     removeAfter: 5000,
  //   });
  // }
}
