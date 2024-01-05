﻿import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { BrowserWindowSingleton } from './browserWindow';

export const createMainApiManagementWindow = (isServe: boolean): void => {
  let browserWindow: BrowserWindow | null = new BrowserWindow({
    x: 0,
    y: 0,
    width: 1345,
    height: 590,
    autoHideMenuBar: true,
    frame: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: isServe,
    },
  });

  browserWindow.setMenu(null);
  browserWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
  });

  browserWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Headers': ['*'],
        ...details.responseHeaders,
      },
    });
  });

  if (isServe) {
    browserWindow.webContents.openDevTools();
    const debug = require('electron-debug');
    debug();

    require('electron-reload');
    browserWindow.loadURL('http://localhost:4200');
  } else {
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    void browserWindow.loadURL(url.href);
  }
  browserWindow.on('closed', () => (browserWindow = null));

  BrowserWindowSingleton.setInstance(browserWindow);
};
