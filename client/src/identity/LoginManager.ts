import type {
  LoginCredentials,
  UpdateData,
} from "~/types";
import type { AuthenticationResponse, SocialType } from "~/main/RelmOAuthAPI";
import type { RelmRestAPI } from "~/main/RelmRestAPI";

import { get } from "svelte/store";
import { _ } from "svelte-i18n";

import { destroyParticipantId } from "~/identity/participantId";

import { connectedAccount } from "~/stores/connectedAccount";
import { security } from "~/stores/security";
import { permits } from "~/stores/permits";
import {
  getRandomInitializedIdentityData,
  localIdentityData,
} from "~/stores/identityData";

type NotifyCallback = (msg: string) => void;
type IdentityUpdater = (identity: UpdateData) => void;

export class LoginManager {
  api: RelmRestAPI;
  notify: NotifyCallback;
  setLocalIdentity: IdentityUpdater;

  constructor(
    api: RelmRestAPI,
    {
      notify,
      setLocalIdentity,
    }: { notify?: NotifyCallback; setLocalIdentity?: IdentityUpdater } = {}
  ) {
    this.api = api;
    this.notify = notify;
    this.setLocalIdentity = setLocalIdentity ?? localIdentityData.set;
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
        if (this.api.hasRelm) await this.refreshPermits();

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

    this.notify?.(notification);

    return isSuccess;
  }

  async logout() {
    destroyParticipantId();
    security.secret = null;
    localIdentityData.set(getRandomInitializedIdentityData());

    // Don't need this if we reload the page
    // connectedAccount.set(false);

    window.location.reload();
  }

  async saveLocalIdentityData() {
    await this.api.setIdentityData({
      identity: get(localIdentityData),
    });
  }

  async syncIdentityData() {
    const data = await this.api.getIdentityData();
    if (data.identity === null) {
      await this.saveLocalIdentityData();
    } else {
      this.setLocalIdentity(data.identity);
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
