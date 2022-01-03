import * as Y from "yjs";
import { withMapEdits } from "relm-common/yrelm";

type Data = {
  name: string;
  value: string;
};

console.log("start");

const doc = new Y.Doc();

const observer = (event: Y.YMapEvent<Data>, transaction: Y.Transaction) => {
  // if (transaction.local) return;
  withMapEdits(event, {
    onAdd: (key, content) => console.log("onAdd", key, content),
    onUpdate: (key, content, _) => console.log("onUpdate", key, content),
    onDelete: (key, content) => console.log("onDelete", key, content),
  });
};

const data = doc.getMap<Data>("data");
data.observe(observer);

data.set("1", { name: "d", value: "v1" });
data.set("2", { name: "k", value: "v2" });
data.set("2", { name: "duane", value: "v1" });

setTimeout(() => {
  console.log("done");
}, 1000);
