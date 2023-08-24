export type PropertyType = {
  name: string;
  initial: (value: any) => any;
  toJSON: (value: any) => any;
  fromJSON: (data: any, value?: any) => any;
};

export const BooleanType: PropertyType = {
  name: "Boolean",
  initial(value) {
    return value || false;
  },
  toJSON(value) {
    return value;
  },
  fromJSON(data, value) {
    return data || false;
  },
};

export const NumberType: PropertyType = {
  name: "Number",
  initial(value) {
    return value || 0;
  },
  toJSON(value) {
    return value;
  },
  fromJSON(data, value) {
    return data || 0;
  },
};

export const StringType: PropertyType = {
  name: "String",
  initial(value) {
    return value || "";
  },
  toJSON(value) {
    return value;
  },
  fromJSON(data, value) {
    return data || "";
  },
};

export const RefType = {
  name: "Ref",
  initial(value) {
    return value || null;
  },
  toJSON(value) {
    // not serializable
    return null;
  },
  fromJSON(data, value) {
    return data || null;
  },
};

const _JSON = typeof window === "undefined" ? globalThis.JSON : window.JSON;

export const JSONType: PropertyType = {
  name: "JSON",
  initial(value) {
    if (value) return _JSON.parse(_JSON.stringify(value));
    return null;
  },
  toJSON(value) {
    return value && _JSON.stringify(value);
  },
  fromJSON(data, value) {
    return data && _JSON.parse(data);
  },
};
