﻿import { dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as Store from 'electron-store';
import { UserSettingStoreModel } from '../../shared/models/user-setting.model';
import { stableAkiCoreConfigPath, stableAkiServerName } from '../constants';
import { BrowserWindowSingleton } from '../browserWindow';
import * as log from 'electron-log';

export const handleOpenDirectoryEvent = (store: Store<UserSettingStoreModel>) => {
  const browserWindow = BrowserWindowSingleton.getInstance();

  ipcMain.on('open-directory', event => {
    dialog.showOpenDialog(browserWindow, { properties: ['openDirectory'] }).then(selectedDirectoryValue => {
      try {
        const selectedPath = selectedDirectoryValue.filePaths[0];

        if (fs.existsSync(selectedPath)) {
          const files = fs.readdirSync(selectedPath);
          const isAKiRootDirectorySoftCheck = files.some(f => f === stableAkiServerName);
          const isNewInstance = store.get('akiInstances').find(i => i.akiRootDirectory === selectedPath);
          if (isNewInstance) {
            event.sender.send('open-directory-error', {
              message: 'Instance with this directory already exists.',
            });
            return;
          }
          const akiCoreJson = fs.readFileSync(path.join(selectedPath, stableAkiCoreConfigPath), 'utf-8');

          if (isAKiRootDirectorySoftCheck) {
            store.set('akiInstances', [...store.get('akiInstances'), { akiRootDirectory: selectedPath }]);
            event.sender.send('open-directory-completed', {
              akiRootDirectory: selectedPath,
              akiCore: JSON.parse(akiCoreJson),
              isValid: true,
              isActive: false,
              clientMods: [],
              serverMods: [],
            });
          } else {
            event.sender.send('open-directory-error', {
              message: 'Unable to find Aki.Server. Please ensure EFT-SP is installed in this directory.',
            });
          }
        }
      } catch (error: any) {
        log.error(error);
        if (error.code === 'ENOENT') {
          event.sender.send('open-directory-error', {
            message: 'Could not resolve AKI Core. Please ensure that you have selected the root directory.',
          });
        } else {
          log.error(error);
          event.sender.send('open-directory-error', {
            message: 'An unknown error occurred.',
          });
        }
      }
    });
  });
};
