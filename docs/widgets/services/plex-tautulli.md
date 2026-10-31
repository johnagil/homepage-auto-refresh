---
title: Tautulli (Plex)
description: Tautulli Widget Configuration
---

Learn more about [Tautulli](https://github.com/Tautulli/Tautulli).

Provides detailed information about currently active streams. You can find the API key from inside Tautulli at `Settings > Web Interface > API`.

By default, every active stream is displayed in a single combined card: the media title and transcode status on the top line, and the player name, client IP address, and playback progress on the bottom line. Set `expandOneStreamToTwoRows: false` to display each stream on a single line; the player name and IP address remain available in the stream title tooltip.

Allowed fields: no configurable fields for this widget.

```yaml
widget:
  type: tautulli
  url: http://tautulli.host.or.ip:port
  key: apikeyapikeyapikeyapikeyapikey
  enableUser: true # optional, defaults to false
  showEpisodeNumber: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true; set false to show one row per stream
```
