import { ConfigurationError } from "@pipedream/platform";
import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-check-proxies",
  name: "Check Proxies",
  description: "Test up to 1,000 proxies live and get their protocols, anonymity, speed and location. No HProxy plan is needed. [See the documentation](https://hproxy.com/proxy-checker#command-line)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    proxies: {
      type: "string[]",
      label: "Proxies",
      description: "Up to 1,000 proxies, each written as `ip:port`, `host:port:user:pass` or `user:pass@host:port`. An entry may also hold several proxies, one per line or separated by commas.",
    },
  },
  async run({ $ }) {
    const proxies = (this.proxies ?? [])
      .flatMap((entry) => String(entry).split(/[\n,]+/))
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    if (proxies.length === 0) {
      throw new ConfigurationError("Enter at least one proxy, such as `203.0.113.7:1080`.");
    }
    if (proxies.length > constants.MAX_PROXIES_PER_CHECK) {
      throw new ConfigurationError(`One run checks up to ${constants.MAX_PROXIES_PER_CHECK} proxies, and this list holds ${proxies.length}. Split it into smaller parts.`);
    }

    const response = await this.app.checkProxies({
      $,
      data: {
        proxies,
      },
    });
    const results = Array.isArray(response?.results)
      ? response.results
      : [];
    const alive = results.filter((result) => result.alive === true).length;
    $.export("$summary", `Successfully checked ${results.length} of ${proxies.length} proxies: ${alive} alive`);
    return response;
  },
};
