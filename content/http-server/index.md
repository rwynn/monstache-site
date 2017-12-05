---
title: HTTP Server
weight: 73
---

Monstache has a built in HTTP server that you can enable with --enable-http-server. It
listens on :8080 by default but you can change this with --http-server-addr.

When using monstache with kubernetes this server can be used to detect liveness and 
[act accordingly](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)

The following GET endpoints are available

### /started

Returns the uptime of the server

### /healthz

Returns at 200 status code with the text "ok" when monstache is running

### /stats

Returns the current indexing statistics in JSON format. Only available if stats are enabled

### /config

Returns the configuration monstache is using in JSON format

---
