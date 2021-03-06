# WazzApp
Unofficial Client of WhatsApp for Linux

![image](https://user-images.githubusercontent.com/79201496/109441124-4c2b7c00-7a2c-11eb-9bf8-042224ebea77.png)

**Download**

[![Foo](https://raw.githubusercontent.com/snapcore/snap-store-badges/master/EN/%5BEN%5D-snap-store-black.png)](https://snapcraft.io/wazzapp)

![image](https://lx-dynamics.com/debian.png)

[Debian Package (64-bit)](https://lx-dynamics.com/wazzapp_0.1.2_amd64.deb)

[Debian Package (32-bit)](https://lx-dynamics.com/wazzapp_0.1.2_i386.deb)

![image](https://lx-dynamics.com/appimage.png)

[Application Image](https://lx-dynamics.com/wazzapp-0.1.2.AppImage)

![image](https://lx-dynamics.com/redhat.png)

[RPM Package (32/64-bit)](https://lx-dynamics.com/wazzapp-0.1.2.x86_64.rpm) (untested)

**Features**

0.1.2 Expand contents to entire window size 

0.1.1 Sticky Notifications on supported systems

0.1.1 Toggle window flashing on new messages (useful to avoid double notifications in gnome)

0.1.1 Hide the the Menu Bar on start

0.1.1 Start the appication minimized (useful for autostart)

0.1.1 Mark all messages as read

0.1.1 Mark all messages as unread

0.1.1 Archive all chats

0.1.1 Copy images and search for text on Google by right clicking the chat

**How to Install**

If you're running a debian based distro you may download and install the provided .deb package. Make sure to install any required dependencies.\
Depends: gconf2, gconf-service, libnotify4, libappindicator1, libxtst6, libnss3, libxss1

You may also run the provided application image. You will be prompted at start for menu integration.

You can install via snapd at https://snapcraft.io/wazzapp.

If you already have snapd installed on your system just run _sudo snap install wazzapp_ from the command line.

You may install node.js, npm, git and then clone the code and run it.

 For this you should run:\
 _git clone https://github.com/diospiroverde/WazzApp.git \
 cd WazzApp\
 npm i\
 npm start_
 
There is an ***untested*** package for Red Hat based distros, if you happen to install it, please tell me how it went.

**Issues**

If you install the application via snap store, you won't get the functionality of showing the application on notification click.This happens due to snapscraft confinement rules.

Ubuntu Unity does not support sticky notifications by default, because NotifyOSD notifications are meant to be unclickable.
It will show an alert box instead.
If you really want sticky notifications on Ubuntu Unity you may work around this by running the following command and then rebooting:

_sudo apt-get install xfce4-notifyd ; sudo apt-get purge notify-osd_

This will replace notify-osd with xfce4-notifyd supporting clickable and stacked notifications.

Please consider how this may affect your other applications.

Tray icon clicks are ignored by Electron on Linux, so the expected behavior of double clicking the tray icon to show the
application is not supported, you will have to single click the tray icon and click on "Show WazzApp".

**Licenses**

This application is based and inspired in the code written by Gustavo Gonzalez, author of the excellent WhatsDesk application.

This project uses app icons free for personal use from Clipartmax.com and Thoseicons.com under Creative Commons Licence v3.0 and modified tray icon from EDT.im under Creative Commons Licence v2.5.
