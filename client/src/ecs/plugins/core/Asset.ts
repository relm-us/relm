export type AssetLike = {
  name: string;
  filename: string;
  url: string;
};

export class Asset {
  name: string;
  filename: string;
  url: string;

  constructor(url?: string) {
    this.name = "";
    this.filename = "";
    this.url = url || "";
  }

  copy(asset: AssetLike) {
    this.name = asset.name;
    this.filename = asset.filename;
    this.url = asset.url;
    return this;
  }

  toJSON() {
    return {
      name: this.name,
      filename: this.filename,
      url: this.url,
    };
  }

  fromJSON(data) {
    this.name = data.name;
    this.filename = data.filename;
    this.url = data.url;
    return this;
  }
}
