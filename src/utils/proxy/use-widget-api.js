// if you want refreshInterval only if it exists in the widget config yaml
import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, endpoint, queryParams, swrConfig = {}) {
  const config = { ...swrConfig };
  if (widget?.refreshInterval) {
    config.refreshInterval = Math.max(1000, widget.refreshInterval); // minimum 1000 ms
  } else if (queryParams?.refreshInterval) {
    config.refreshInterval = queryParams.refreshInterval;
  }
  let url = formatProxyUrl(widget, endpoint, queryParams);
  if (endpoint === "") {
    url = null;
  }
  const { data, error, mutate } = useSWR(url, config);
  // make the data error the top-level error
  return { data, error: data?.error ?? error, mutate };
}

// // if you want refreshInterval by default
// import useSWR from "swr";

// import { formatProxyUrl } from "./api-helpers";

// const DEFAULT_REFRESH_INTERVAL = 30000; // default value in milliseconds

// export default function useWidgetAPI(widget, ...options) {
//   const config = {
//     refreshInterval: widget?.refreshInterval
//       ? Math.max(1000, widget.refreshInterval) // use refreshInterval if defined, with a minimum of 1000 ms
//       : DEFAULT_REFRESH_INTERVAL, // otherwise use default
//   };
//   let url = formatProxyUrl(widget, ...options);
//   if (options[0] === "") {
//     url = null;
//   }
//   const { data, error, mutate } = useSWR(url, config);
//   // make the data error the top-level error
//   return { data, error: data?.error ?? error, mutate };
// }
