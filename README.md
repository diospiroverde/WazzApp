## WazzApp | Unofficial Client of WhatsApp for Linux

![image](https://lx-dynamics.com/wazzap.png)

## Features 

0.3.6 Chat with numbers not in contact list 

0.3.1 Updated support for WhatsApp Beta

0.2.5 Access to removable media

0.2.4 Support for voice recording via Snap

0.2.3 Compatibility with WhatsApp Beta

0.2.1 Disable Shortcuts

0.1.8 Hide Notifications

0.1.8 Mute Audio

0.1.7 Spell Checker supporting many languages

0.1.6 Choose between monochrome and colored tray icon

0.1.4 Low Battery warning notification

0.1.4 Clear all stored data

0.1.4 Clear session cache

0.1.4 Toggle Menu Bar directly from system tray

0.1.2 Expand contents to entire window size 

0.1.1 Sticky Notifications on supported systems

0.1.1 Toggle window flashing on new messages (useful to avoid double notifications in gnome)

0.1.1 Hide the Menu Bar on start

0.1.1 Start the appication minimized (useful for autostart)

0.1.1 Mark all messages as read

0.1.1 Mark all messages as unread

0.1.1 Archive all chats

0.1.1 Copy images and search for text on Google by right clicking the chat

## Download Options

### Snap
[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/wazzapp)

### Debian Package (apt) 

![image](https://lx-dynamics.com/debian.png)

[Debian Package (64-bit)](https://lx-dynamics.com/wazzapp_0.3.6_amd64.deb)

[Debian Package (32-bit)](https://lx-dynamics.com/wazzapp_0.3.6_i386.deb)

### Application Image  

![image](https://lx-dynamics.com/appimage.png)

[WazzApp Application Image](https://lx-dynamics.com/wazzapp-0.3.6.AppImage)

### RHEL, CentOS (RPM package) 

![image](https://lx-dynamics.com/redhat.png)

[RPM Package (32/64-bit)](https://lx-dynamics.com/wazzapp-0.3.6.x86_64.rpm)

## How to install

### WazzApp as a Snap

If you have `snap` installed and `snapd` running on your system, you can install WazzApp as a snap package. Note: This restricts some features due to snapcraft confinement rules.

WazzApp resides [here](https://snapcraft.io/wazzapp) on [SnapCraft](https://snapcraft.io).

To install WazzApp as a snap, run the following command:
```bash
$ sudo snap install wazzapp
```
To enable voice recording, run the following command:
```bash
$ sudo snap connect wazzapp:audio-record
```
To enable access to removable media, run the following command:
```bash
$ sudo snap connect wazzapp:removable-media
```

### Debian-based systems (dpkg or apt)
If you're running a debian based distro, you may download and install the provided .deb package. Make sure to install any required dependencies.

WazzApp depends on: `gconf2`, `gconf-service`, `libnotify4`, `libappindicator1`, `libxtst6`, `libnss3`, `libxss1`.

The downloaded `.deb` package can generally be installed by running _any one_ of the following commands:

```bash
$ sudo apt install /path/to/downloaded/deb/package
$ sudo dpkg -i /path/to/downloaded/deb/package
$ sudo gdebi /path/to/downloaded/deb/package
```

### Application Image

You may also run the provided application image. You will be prompted at start for menu integration.

### Manual cloning and running  

If you have [nodejs](https://nodejs.org), npm (node's package manager) and git, you may choose to clone and manually run the app.  

Clone the repo and change into the root directory: 
```bash
$ git clone https://github.com/diospiroverde/WazzApp.git
$ cd WazzApp
```

Install the dependencies and start the app:
```bash
$ npm install           # or npm i
$ npm start
```
 
## Issues  

As noted before, if you install the application via snap store, you won't get the functionality of showing the application on notification click. This happens due to snapscraft confinement rules.   

### Notifications on Ubuntu Unity  

Ubuntu Unity does not support sticky notifications by default, because NotifyOSD notifications are meant to be unclickable.   
It will show an alert box instead.    
If you really want sticky notifications on Ubuntu Unity you may work around this by running the following command and then rebooting:

```bash
$ sudo apt-get install xfce4-notifyd
$ sudo apt-get purge notify-osd
```

This will replace `notify-osd` with `xfce4-notifyd` supporting clickable and stacked notifications.

**Please consider how this may affect your other applications.**

### Tray Icons

Tray icon clicks are ignored by Electron on Linux, so the expected behavior of double clicking the tray icon to show the application is not supported, you will have to single click the tray icon and click on "Show WazzApp".

If you are running Fedora and don't get a tray icon, you should run
```bash
$ sudo dnf install gnome-shell-extension-topicons-plus
```

And then enable the Topicons plus extension using Tweaks.

If you need to install Tweaks just run,

```bash
$ sudo dnf install gnome-tweak-tool
```

Or install it from the Software Center.

Thanks to Elroy Brown for testing and troubleshooting the RPM package in Fedora.

Thanks to basil08 https://github.com/basil08 for his improvements to this readme file.

## Licenses

This application is based and inspired in the code written by Gustavo Gonzalez, author of the excellent WhatsDesk application.

This project uses app icons free for personal use from [Clipartmax](https://www.clipartmax.com/) and [Thoseicons](https://thoseicons.com/) under Creative Commons Licence v3.0 and modified tray icon from [EDT](https://www.EDT.im) under Creative Commons License v2.5.
