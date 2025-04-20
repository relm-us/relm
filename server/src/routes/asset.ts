import { jsonToYEntity, type YEntity, yEntityToJSON } from "relm-common";

import path from "node:path";
import express from "express";
import fileupload from "express-fileupload";
import cors from "cors";
import sharp from "sharp";
import type * as Y from "yjs";

import * as middleware from "../middleware.js";
import * as conversion from "../conversion.js";
import {
	respondWithSuccess,
	respondWithError,
	wrapAsync,
} from "../utils/index.js";

import { getSyncedYDoc } from "../getSyncedYDoc.js";

import { Asset } from "../db/index.js";

import { config } from "../config.js";

export const asset = express.Router();

// Allow files to be uploaded.
// NOTE: This must be before app.post('/asset')
asset.use(
	fileupload({
		useTempFiles: true,
		tempFileDir: config.TMP_DIR,
	})
);

// Add asset metadata to the library
asset.post(
	"/library/create",
	cors(),
	middleware.authenticated(),
	middleware.authorized("admin"),
	wrapAsync(async (req, res) => {
		const asset = await Asset.createAsset({
			name: req.body.name,
			description: req.body.description,
			thumbnail: req.body.thumbnail,
			tags: req.body.tags,
			ecsProperties: req.body.ecsProperties,
			createdBy: req.authenticatedParticipantId,
		});

		return respondWithSuccess(res, {
			action: "created",
			asset,
		});
	}),
);

// Update asset metadata in the library
asset.post(
	"/library/update",
	cors(),
	middleware.authenticated(),
	middleware.authorized("admin"),
	wrapAsync(async (req, res) => {
		const asset = await Asset.updateAsset({
			assetId: req.body.assetId,
			name: req.body.name,
			description: req.body.description,
			thumbnail: req.body.thumbnail,
			tags: req.body.tags,
			ecsProperties: req.body.ecsProperties,
		});

		return respondWithSuccess(res, {
			action: "updated",
			asset,
		});
	}),
);

// Delete asset from the library
asset.delete(
	"/library/delete",
	cors(),
	middleware.authenticated(),
	middleware.authorized("admin"),
	wrapAsync(async (req, res) => {
		const assetId: string = req.body.assetId;

		const asset = await Asset.deleteAsset({ assetId });

		return respondWithSuccess(res, {
			action: "deleted",
			asset,
		});
	}),
);

asset.post(
	"/library/query",
	cors(),
	// middleware.authenticated(),
	wrapAsync(async (req, res) => {
		const keywords: string[] = req.body.keywords;
		const tags: string[] = req.body.tags;
		let page: number = req.body.page ?? 0;
		let per_page: number = req.body.perPage ?? 10;

		if (page < 0) page = 0;
		if (per_page < 0) per_page = 0;
		if (per_page > 100) per_page = 100;

		const assets = await Asset.queryAssets({ keywords, tags, page, per_page });

		return respondWithSuccess(res, {
			action: "query",
			assets,
		});
	}),
);

asset.post(
	"/inventory/take",
	cors(),
	middleware.relmName(),
	middleware.relmExists(),
	middleware.authenticated(),
	middleware.authorized("access"),
	wrapAsync(async (req, res) => {
		if (!req.body.entityId)
			return respondWithError(res, "entityId is required");

		const entityId: string = req.body.entityId;
		const yCenter: number = req.body.yCenter || 0.0;

		const relmDoc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);
		const yentities: Y.Array<YEntity> = relmDoc.getArray("entities");

		// Find the entity
		let entity: ReturnType<typeof yEntityToJSON>;
		for (const yentity of yentities) {
			const id = yentity.get("id") as string;
			if (entityId === id) {
				entity = yEntityToJSON(yentity);
				break;
			}
		}

		// TODO: validate entity has Item component and is permitted to be picked up

		if (entity) {
			let asset: Awaited<ReturnType<typeof Asset.createAsset>>;
			try {
				// Add the entity to inventory
				asset = await Asset.createAsset({
					userId: req.authenticatedParticipantId, // TODO: use a real userId rather than ephemeral participantId
					name: entity.name,
					ecsProperties: {
						center: [0, yCenter, 0],
						entities: [entity],
						groupTree: { groups: {}, entities: {} },
					},
					createdBy: req.authenticatedParticipantId,
				});

				// We loop through and re-visit entities again, because time has passed since finding the entity.
				// We want the 'delete' operation to be as close to accurate as possible, despite possible async edits.
				let i = 0;
				for (const yentity of yentities) {
					const id = yentity.get("id") as string;
					if (entityId === id) {
						yentities.delete(i, 1);
						break;
					}
					i++;
				}
			} catch (err) {
				return respondWithError(res, "could not take item", {
					msg: err.toString(),
				});
			}

			return respondWithSuccess(res, {
				action: "take",
				entity,
				asset,
			});
		}

		return respondWithError(res, "relm has no such entity", { entityId });
	}),
);

asset.post(
	"/inventory/drop",
	cors(),
	middleware.relmName(),
	middleware.relmExists(),
	middleware.authenticated(),
	middleware.authorized("access"),
	wrapAsync(async (req, res) => {
		if (!req.body.assetId) return respondWithError(res, "assetId is required");
		if (!req.body.position || req.body.position.length !== 3)
			return respondWithError(res, "position is required ([x, y, z])");

		const assetId: string = req.body.assetId;
		const position: number[] = req.body.position;

		const relmDoc: Y.Doc = await getSyncedYDoc(req.relm.permanentDocId);
		const yentities: Y.Array<YEntity> = relmDoc.getArray("entities");

		const asset = await Asset.getAsset({ assetId });
		if (asset) {
			const entity = asset.ecsProperties.entities[0];
			position[1] += asset.ecsProperties.center[1];
			entity.Transform.position = position;

			try {
				const yentity: YEntity = jsonToYEntity(entity);

				// Try to make this as transactional as possible--
				// delete & push as close together as we can
				await Asset.deleteAsset({ assetId });
				yentities.push([yentity]);

				return respondWithSuccess(res, {
					action: "drop",
					asset,
				});
			} catch (err) {
				return respondWithError(res, "unable to drop", { msg: err.toString() });
			}
		} else {
			return respondWithError(res, "asset does not exist", { assetId });
		}
	}),
);

asset.post(
	"/inventory/query",
	cors(),
	middleware.relmName(),
	middleware.relmExists(),
	middleware.authenticated(),
	middleware.authorized("access"),
	wrapAsync(async (req, res) => {
		const keywords: string[] = req.body.keywords;
		const tags: string[] = req.body.tags;
		let page: number = req.body.page ?? 0;
		let per_page: number = req.body.perPage ?? 10;

		if (page < 0) page = 0;
		if (per_page < 0) per_page = 0;
		if (per_page > 100) per_page = 100;

		const assets = await Asset.queryAssets({
			keywords,
			tags,
			page,
			per_page,
			userId: req.authenticatedParticipantId,
		});

		return respondWithSuccess(res, {
			action: "query",
			assets,
		});
	}),
);

// Serve uploaded files
asset.use(
	express.static(config.ASSETS_DIR, {
		setHeaders: (res, path, stat) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", "GET");
			res.header("Access-Control-Allow-Headers", "Content-Type");
		},
	}),
);

// Upload images and 3D assets
asset.post(
	"/upload",
	cors(),
	// middleware.authenticated(),
	// middleware.authorized("edit"),
	wrapAsync(async (req, res) => {
		if (!req.files) {
			return respondWithError(res, "expecting files");
		}

		if (!("file" in req.files)) {
			return respondWithError(res, "expecting 'file' in form-data");
		}

		// TODO: turn on `batch: true` and change this to one-or-many
		//   - attribute would change from "file" to "files[]"
		//   - asset becomes single asset in case of 1 file uploaded
		//   - assets become array of assets in case of 2+ files
		//   - ?? how do we respond to Uppy for errors in just 1 of several?
		const asset = req.files.file;
		if (asset.size > config.MAX_FILE_SIZE) {
			return respondWithError(res, "file too large");
		}

		const extension = path.extname(asset.name).toLowerCase();
		if (extension.length > config.MAX_FILE_EXTENSION_LENGTH) {
			return respondWithError(res, "file extension too long");
		}

		try {
			switch (extension) {
				case ".ogg":
				case ".mp3":
				case ".wav":
				case ".webm": {
					const sound = await conversion.moveOrUploadContentAddressable(
						asset.tempFilePath,
						extension,
					);
					return conversion.fileUploadSuccess(res, { sound });
				}

				case ".jpg":
				case ".jpeg":
				case ".gif":
				case ".png":
				case ".webp": {
					const pngTempFile = `${asset.tempFilePath}.png`;
					await sharp(asset.tempFilePath).toFile(`${asset.tempFilePath}.png`);
					const png =
						await conversion.moveOrUploadContentAddressable(pngTempFile);

					const webpTempFile = `${asset.tempFilePath}.webp`;
					await sharp(asset.tempFilePath).toFile(`${asset.tempFilePath}.webp`);
					const webp =
						await conversion.moveOrUploadContentAddressable(webpTempFile);

					return conversion.fileUploadSuccess(res, { png, webp });
				}

				case ".glb":
				case ".packed-glb":
				case ".gltf":
				case ".packed-gltf": {
					const gltf = await conversion.moveOrUploadContentAddressable(
						asset.tempFilePath,
						extension,
					);
					return conversion.fileUploadSuccess(res, { gltf });
				}
				default:
					return respondWithError(res, "unsupported filetype");
			}
		} catch (err) {
			return respondWithError(res, err.toString());
		}
	}),
);
