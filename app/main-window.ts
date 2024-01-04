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
      allowRunningInsecureContent: isServe,
    },
  });

  browserWindow.setMenu(null);

  if (isServe) {
    browserWindow.webContents.openDevTools();
  }

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

  require('electron-reload');

  if (isServe) {
    const debug = require('electron-debug');
    debug();

    browserWindow.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    void browserWindow.loadURL(url.href);
  }

  // Emitted when the window is closed.
  browserWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    browserWindow = null;
  });

  BrowserWindowSingleton.setInstance(browserWindow);
};
