declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        getSensorData(): void;
        loadEarthImageryData(): void;
        getDrywellImages(): void;
        on(
          channel: string,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: string, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
