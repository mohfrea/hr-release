const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  remote,
} = require("electron");

const { machineId, machineIdSync } = require("node-machine-id");
const DeltaUpdater = require("@electron-delta/updater");

const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
const fs = require("fs");
const extendedContextMenu = require("electron-context-menu");
// to access system info
const os = require("os");

const path = require("path");

const ProgressBar = require("electron-progressbar");
let mainWindow, splash, vpnFileWindow;
var progressBarWithPercentage = null;
var progressBar = null;
const pathToCheckVpnConfig = `${app.getPath("userData")}\\user.conf`;

const template = [
  // { role: 'appMenu' }
  ...[],
  // { role: 'fileMenu' }
  {
    label: "الملف",
    submenu: [
      { role: "minimize", label: "تصغير", accelerator: "Ctrl+Shift" },
      {
        label: "اغلاق",
        click: async () => closeProcess(),
      },
    ],
  },
  {
    label: "ادوات",
    submenu: [
      { label: "قص", accelerator: "Ctrl+X", selector: "cut:" },
      { label: "نسخ", accelerator: "Ctrl+C", selector: "copy:" },
      { label: "لصق", accelerator: "Ctrl+V", selector: "paste:" },
      { label: "تحديد الكل", accelerator: "Ctrl+A", selector: "selectAll:" },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);

function createSplash() {
  splash = new BrowserWindow({
    width: 610,
    height: 410,
    transparent: true,
    // closable: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  splash.loadFile("html/splash-screen.html");
  splash.center();
}
// function createVpnFileWindow() {
//   vpnFileWindow = new BrowserWindow({
//     // fullscreen: true,
//     closable: true,
//     alwaysOnTop: true,
//     show: false,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,

//       preload: "./preload.js",
//     },
//   });

//   vpnFileWindow.loadFile("html/vpn-file.html");
// }

function createMainWindow() {
  mainWindow = new BrowserWindow({
    icon: "icons-img/hr.ico",
    useContentSize: true,
    fullscreen: true,
    closable: true,
    title: `${app.getVersion()}`,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: './preload.js',
    },
    // frame: true,
  });

  // write click menu
  extendedContextMenu({});

  // load HTML file locally
  mainWindow.loadFile("build/index.html");
}

// autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
//   splash.close();
//   mainWindow.close();

//   progressBar = new ProgressBar({
//     text: "تحديث جديد ",
//     detail: "يتم التجهيز لتحميل الملفات من الخادم ",
//   });
// });

// // log very important
// autoUpdater.log = log;
// log.info("App starting...");

// // on download event
// autoUpdater.on("download-progress", (progressObj) => {
//   if (progressBarWithPercentage) {
//     progressBarWithPercentage.value = progressObj.percent;
//     progressBarWithPercentage.text = "جار التحميل";
//     progressBarWithPercentage.detail = `${Math.trunc(
//       progressBarWithPercentage.value
//     )}% نسبة التحميل `;
//   } else {
//     progressBarWithPercentage = new ProgressBar({
//       indeterminate: false,
//       text: "تحميل البيانات",
//       detail: "الرجاء الانتظار  قليلا",
//     });
//     progressBar.close();
//     progressBar = null;
//   }
// });

// autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
//   if (progressBar) {
//     progressBar.close();
//     progressBar = null;
//   }
//   autoUpdater.quitAndInstall();
// });

// autoUpdater.on("error", (err) => {
//   log.error(`Update-Error: ${err.toString()}`);
//   mainWindow.webContents.send(
//     "message",
//     `Error in auto-updater: ${err.toString()}`
//   );
// });

ipcMain.on("send-message", async (event, message, data) => {
  if (message == "app-version") {
    event.reply("receive-app-version", app.getVersion());
  }
  // if (message == "vpn-file-loaded") {
  //   const chosenFolders = await dialog.showOpenDialog(vpnFileWindow, {
  //     properties: ["openFile"],
  //   });
  //   if (chosenFolders && chosenFolders.canceled === false) {
  //     fs.copyFile(chosenFolders.filePaths[0], pathToCheckVpnConfig, (err) => {
  //       if (err) {
  //         log.error("Error Found:", err);
  //       } else {
  //         app.relaunch();
  //         app.quit();
  //       }
  //     });
  //   }
  // }
  if (message == "machine-id") {
    event.reply("receive-machine-id", {
      machineId: machineIdSync(),
      hostName: os.hostname(),
      opSys: os.type(),
    });
  }
});

const deltaUpdater = new DeltaUpdater({
  log,
  // autoUpdater: require("electron-updater").autoUpdater,
  // hostURL: "you can mention the host url or it's computed from app-update.yml file"
  // hostURL: "http://localhost:3000",
});

// main process
app.whenReady().then(async () => {
  // createSplash();
  createMainWindow();
  // createVpnFileWindow();
  Menu.setApplicationMenu(menu);
  try {
    await deltaUpdater.boot({
      splashScreen: true,
    });
  } catch (error) {
    log.error(error);
  }
  mainWindow.show();

  // autoUpdater.checkForUpdates().then(async (result) => {
  //   if (result.updateInfo.version == app.getVersion()) {
  //     initialOpening();
  //   }
  // });
});

const initialOpening = () => {
  setTimeout(function () {
    splash.close();
    mainWindow.show();
  }, 5000);
};
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    closeProcess();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const closeProcess = () => {
  if (progressBar) {
    progressBar.close();
  }
  app.quit();
};
