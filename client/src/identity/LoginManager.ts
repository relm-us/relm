import { Security } from "relm-common";
import { get } from "svelte/store";
import { _ } from "svelte-i18n";

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

  async register(credentials: LoginCredentials) {
    const result = await this.api.registerParticipant(credentials);
    return await this.continueLogin(result);
  }

  async loginWithCredentials(creds: LoginCredentials) {
    const result = await this.api.login(creds);
    return await this.continueLogin(result);
  }

  async loginWithThirdParty(type: SocialType) {
    const result = await this.api.oAuth.openThirdPartyWindow(type);
    return await this.continueLogin(result);
  }

  async continueLogin(result: AuthenticationResponse) {
    let notification = "unable to authenticate";
    let isSuccess = false;

    if (result?.status === "success") {
      try {
        await this.refreshPermits();

        await this.syncIdentityData();

        connectedAccount.set(true);

        notification = "successfully signed in!";
        isSuccess = true;
      } catch (error) {
        notification = error.message;
      }
    } else if (result?.status === "failure") {
      notification = get(_)(`LoginManager.${result.reason}`);
    }

    this.dispatch({ id: "notify", notification });

    return isSuccess;
  }

  async logout() {
    destroyParticipantId();
    this.security.secret = null;
    localIdentityData.set(getRandomInitializedIdentityData());

    // Don't need this if we reload the page
    // connectedAccount.set(false);

    window.location.reload();
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
