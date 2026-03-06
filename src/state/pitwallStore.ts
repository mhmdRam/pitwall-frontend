const KEYS = {
  profileName: "pitwall.profileName",
  sessionMode: "pitwall.sessionMode", // "practice" | "quali" | "race"
  selectedTeam: "pitwall.selectedTeam",
  selectedDriver: "pitwall.selectedDriver", // string/number (driver_number)
  raceRunning: "pitwall.raceRunning", // "1" | "0"
  replayLap: "pitwall.replayLap", // string number
  replaySession: "pitwall.replaySession", // string
};

export type SessionMode = "practice" | "quali" | "race";

export function getProfileName(): string {
  return localStorage.getItem(KEYS.profileName) || "";
}
export function setProfileName(name: string) {
  localStorage.setItem(KEYS.profileName, name.trim());
}

export function getSessionMode(): SessionMode {
  const v = (localStorage.getItem(KEYS.sessionMode) || "race") as SessionMode;
  return v === "practice" || v === "quali" || v === "race" ? v : "race";
}
export function setSessionMode(mode: SessionMode) {
  localStorage.setItem(KEYS.sessionMode, mode);
}

export function getSelectedTeam(): string {
  return localStorage.getItem(KEYS.selectedTeam) || "";
}
export function setSelectedTeam(team: string) {
  localStorage.setItem(KEYS.selectedTeam, team);
}

export function getSelectedDriver(): string {
  return localStorage.getItem(KEYS.selectedDriver) || "";
}
export function setSelectedDriver(driverNumber: string | number) {
  localStorage.setItem(KEYS.selectedDriver, String(driverNumber));
}

export function getRaceRunning(): boolean {
  return localStorage.getItem(KEYS.raceRunning) === "1";
}
export function setRaceRunning(running: boolean) {
  localStorage.setItem(KEYS.raceRunning, running ? "1" : "0");
}

export function getReplayLap(): number {
  const n = Number(localStorage.getItem(KEYS.replayLap) || "1");
  return Number.isFinite(n) && n > 0 ? n : 1;
}
export function setReplayLap(lap: number) {
  localStorage.setItem(KEYS.replayLap, String(Math.max(1, Math.floor(lap))));
}

export function getReplaySession(): string {
  return localStorage.getItem(KEYS.replaySession) || "9839";
}
export function setReplaySession(session: string | number) {
  localStorage.setItem(KEYS.replaySession, String(session));
}
