﻿export interface Mod {
  name: string;
  image: string;
  icon?: string;
  fileUrl: string;
  kind: string;
  teaser?: string;
  installProgress?: InstallProgress;
}

export interface InstallProgress {
  completed: boolean;
  started?: Date;
  finished?: Date;

  linkStep: StepProgress;
  downloadStep: DownloadProgress;
  unzipStep: StepProgress;
}

export interface StepProgress {
  error: boolean;
  start: boolean;
  progress: number;
}

export interface DownloadProgress {
  percent: number;
  totalBytes: string;
  transferredBytes: string;
  start: boolean;
  error: boolean;
}
