const { WebContentsView, shell, dialog } = require('electron');

const { loadConfig, getConfigPath, getConfigDirPath } = require('./configHandler');  // Import the config loader

class ViewsManager {
  constructor(mainWindow) {
    this.debug = true;
    this.mainWindow = mainWindow;
    this.views = [];
    this.configPath = getConfigPath();
    this.userSettings = loadConfig();
    this.createViews();
  }

  showDebug(msg) {
    if (this.debug) {
      console.log(`\n${msg}`)
    }
  }

  errorCreatingView() {

    // Show a warning dialog
    dialog.showMessageBox({
      type: 'warning',
      title: 'Warning',
      message: "Issue with config.json.\nDoes it exist? Have you defined views?\nPress OK to open config folder.",
      buttons: ['OK']
    }).then(result => {
      shell.openPath(getConfigDirPath());
    });  
    
  }

  // Reload config and reset views
  reloadConfig() {

    this.showDebug('Reloading Config...')
    this.userSettings = loadConfig();
    this.removeAllViews();
    this.createViews();
    this.updateViews();

  }

  // Function to remove all BrowserViews and WebContentsViews
  removeAllViews() {

    this.views.forEach(({ view }) => {
      this.mainWindow.contentView.removeChildView(view); // Remove the BrowserView
    });
    this.views = [];

  }

  // Create and add views based on the config
  createViews() {

    if (!this.userSettings) {
      this.showDebug('No user settings found.');
      this.errorCreatingView();
      return;
    }
    else if (this.userSettings.views) {
      this.userSettings.views.forEach((config) => {
        const { enabled = true } = config;

        if (enabled) {

          if (config.url) {
            this.showDebug(`Creating view for URL: ${config.url}`);
          }
          else if (config.youtube) {
            this.showDebug(`Creating view for YOUTUBE: ${config.youtube}`);
          }

          this.createView(config);
        }
      });
    }
    else {
      this.errorCreatingView();
    }

  }

  // Create either a BrowserView or WebContentsView
  createView(config) {

    let view;

    if (config.url || config.youtube) {
      view = new WebContentsView({
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: true,
        },
      });

      this.mainWindow.contentView.addChildView(view);

      this.views.push({ view, config });

      if (config.url) {
        this.createUrl(view, config.url);
      }
      else if (config.youtube) {
        this.createYoutube(view, config.youtube);
      }
    }
  }

  createUrl(view, url) {
    view.webContents.loadURL(url);
    this.injectCSS(view);
  }

  // Inject CSS to remove scrollbars but allow scrolling
  injectCSS(view) {
    view.webContents.on('dom-ready', () => {
      view.webContents.insertCSS(`
            body {
              overflow: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            ::-webkit-scrollbar {
              display: none !important;
            }
          `);
    });
  }

  createYoutube(view, videoUrl) {
    // Extract the YouTube video ID from the URL
    const videoId = this.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      console.error('Invalid YouTube URL');
      return;
    }

    //small, medium, large, hd720, hd1080, highres, and auto.
    let quality = "hd720";

    // Load the YouTube player HTML content dynamically
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>YouTube Player</title>
        <style>
          body {
            margin: 0;
            overflow: hidden;
          }
          #youtube-player {
            width: 100vw;
            height: 100vh;
          }
        </style>
        <script>
          function onYouTubeIframeAPIReady() {
            new YT.Player('youtube-player', {
              videoId: '${videoId}',
              playerVars: {
                autoplay: 1,
                loop: 1,
                playlist: '${videoId}',
                controls: 1,
                rel: 0,
                quality: '${quality}', // Set quality here
              },
              events: {
                onReady: (event) => {
                  event.target.mute();
                  event.target.playVideo();
                  event.target.setPlaybackQuality('${quality}'); // Set the video quality after ready
                },
              },
            });
          }
          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(script);
        </script>
      </head>
      <body>
        <div id="youtube-player"></div>
      </body>
      </html>
      `;

    // Load the HTML content into the view
    view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  }

  // Helper function to extract YouTube video ID from URL
  extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Update view sizes based on the configuration
  updateViews() {
    if (!this.userSettings) {
      this.showDebug('No user settings found.');
      return;
    }

    const { width, height } = this.mainWindow.getContentBounds();

    // Calculate the width of each column based on percentages
    const columnWidths = this.userSettings.layout.columns.map((percent) => (width * percent) / 100);

    // Calculate the height of each row based on percentages
    const rowHeights = this.userSettings.layout.rows.map((percent) => (height * percent) / 100);

    // console.log(rowHeights);
    // console.log(columnWidths);

    this.views.forEach(({ view, config }) => {
      // Default rowspan and colspan to 1 if not specified
      const row = config.row ?? 0;
      const col = config.col ?? 0;
      const rowspan = config.rowspan ?? 1;
      const colspan = config.colspan ?? 1;

      // Calculate x position by summing widths of previous columns
      const x = columnWidths.slice(0, col).reduce((sum, w) => sum + w, 0);
      const viewWidth = columnWidths.slice(col, col + colspan).reduce((sum, w) => sum + w, 0);

      // Calculate the y position based on the row height for the specific row
      const y = rowHeights.slice(0, row).reduce((sum, h) => sum + h, 0);
      const viewHeight = rowHeights[row] * rowspan;

      view.setBounds({
        x: Math.floor(x),
        y: Math.floor(y),
        width: Math.floor(viewWidth),
        height: Math.floor(viewHeight),
      });
    });

  }

  // Refresh all views by reloading their content
  refreshAllViews() {
    this.views.forEach(({ view }) => {
      view.webContents.reload();
    });
  }

}

module.exports = ViewsManager;
