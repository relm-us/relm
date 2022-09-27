import { Observable } from "lib0/observable";

export class Attendance extends Observable<string> {
  /**
   * Each relmName tracks the number of participants in attendance
   *
   * string - relmName
   * number - count of participants in the relm
   */
  attendance = new Map<string, number>();

  _add(relmName: string, count: number) {
    const newCount = (this.attendance.get(relmName) ?? 0) + count;
    this.attendance.set(relmName, newCount);
    return newCount;
  }

  get(relmName: string) {
    return this.attendance.get(relmName) ?? 0;
  }

  join(relmName: string, participantId?: string) {
    const tally = this._add(relmName, 1);
    this.emit("join", [relmName, tally, participantId]);
    this.emit("change", [relmName, tally]);
  }

  leave(relmName: string, participantId?: string) {
    const tally = this._add(relmName, -1);
    this.emit("leave", [relmName, tally, participantId]);
    this.emit("change", [relmName, tally]);
  }
}
