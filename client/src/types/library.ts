export type LibraryAsset = {
  assetId: string;
  userId: string;
  relmId: string;
  name: string;
  description: string;
  tags: string[];
  ecsProperties: any;
  thumbnail: string;
  createdBy: string;
  createdAt: string;
};

export type LibraryAssetResults = {
  search: string;
  page: number;
  results: LibraryAsset[];
};
