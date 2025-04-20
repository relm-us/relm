import * as bcrypt from "bcrypt";
import { config } from "../config.js";

export async function encrypt(password) {
	return new Promise((resolve, reject) => {
		if (typeof password === "string") {
			if (password.length >= config.PASSWORD_LENGTH_MINIMUM) {
				bcrypt.hash(password, 10, (err, hash) => {
					if (err) {
						reject(err);
					} else {
						resolve(hash);
					}
				});
			} else {
				reject(
					Error(
						`password length must be greater than ${config.PASSWORD_LENGTH_MINIMUM}`,
					),
				);
			}
		} else {
			resolve(null);
		}
	});
}

export async function compareEncryptedPassword(password, encryptedPassword) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, encryptedPassword, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}
