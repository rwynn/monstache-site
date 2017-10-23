---
title: Systemd 
weight: 72
---

Monstache has support built in for integrating with systemd. The following `monstache.service` is an example 
systemd configuration.

    [Unit]
    Description=monstache sync service

    [Service]
    Type=notify
    ExecStart=/usr/bin/monstache
    WatchdogSec=30s
    Restart=on-failure

    [Install]
    WantedBy=multi-user.target

System-d unit files are normally saved to `/lib/systemd/system`.  

After adding monstache.service you can run `systemctl daemon-reload` to tell systemd to reload all unit files. 

You can start the service with `systemctl start monstache.service`.

With the configuration above monstache will notify systemd when it has started successfully and then notify 
systemd repeatedly at half the WatchDog interval to signal liveness.  The configuration above causes systemd
to restart monstache if it does not start or respond within the WatchdDog interval.

---
