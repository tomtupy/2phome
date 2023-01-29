export enum Imagery {
  Drywell = "Drywell",
  LiveEarthView = "Live Earth View",
}

export const imageryDir: Record<Imagery, string> = {
  [Imagery.Drywell]: '../images',
  [Imagery.LiveEarthView]: '../earth_images'
};

export const fileTimestampParser: Record<Imagery, Function> = {
  [Imagery.Drywell]: (file: string) => {
      return file.split('wellcam_')[1].split(".")[0];
  },
  [Imagery.LiveEarthView]: (file: string) => {
      return file.split(".")[0];
  },
};

export const imageryFilePrefix: Record<Imagery, string> = {
  [Imagery.Drywell]: "wellcam_",
  [Imagery.LiveEarthView]: "lev_"
};