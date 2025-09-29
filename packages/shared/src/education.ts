export interface EducationMediaAsset {
  id: string;
  type: "video" | "article" | "tooltip";
  title: string;
  url: string;
  durationSeconds?: number;
}

export interface EducationPanel {
  id: string;
  title: string;
  summary: string;
  body: string;
  complianceTag: string;
  media?: EducationMediaAsset[];
}

export interface EducationSuite {
  updatedAt: string;
  panels: EducationPanel[];
}
