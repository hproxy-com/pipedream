import { ConfigurationError } from "@pipedream/platform";
import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-get-free-proxies",
  name: "Get Free Proxies",
  description: "Get working public proxies from HProxy's free proxy list, which is checked around the clock. No HProxy plan is needed. [See the documentation](https://hproxy.com/docs/free-proxy-list)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    limit: {
      type: "integer",
      label: "Limit",
      description: "The most proxies to return, from 1 to 10,000",
      min: 1,
      max: 10000,
      default: 50,
      optional: true,
    },
    country: {
      propDefinition: [
        app,
        "country",
      ],
      description: "Only proxies in this country, as a two-letter code such as `US`",
    },
    protocols: {
      type: "string[]",
      label: "Protocols",
      description: "Only proxies that support at least one of these protocols",
      options: constants.FREE_PROXY_PROTOCOL_OPTIONS,
      optional: true,
    },
    anonymity: {
      type: "string",
      label: "Anonymity",
      description: "Only proxies with this anonymity grade",
      options: constants.ANONYMITY_OPTIONS,
      optional: true,
    },
    maxLatencyMs: {
      type: "integer",
      label: "Max Latency (ms)",
      description: "Only proxies that answered within this many milliseconds, from 1 to 120,000",
      min: 1,
      max: 120000,
      optional: true,
    },
    minUptimePct: {
      type: "integer",
      label: "Min Uptime (%)",
      description: "Only proxies whose lifetime uptime is at least this percentage, from 0 to 100",
      min: 0,
      max: 100,
      optional: true,
    },
    port: {
      type: "integer",
      label: "Port",
      description: "Only proxies answering on this port, such as `8080`",
      min: 1,
      max: 65535,
      optional: true,
    },
    asn: {
      type: "integer",
      label: "Network (ASN)",
      description: "Only proxies in this network, by AS number such as `14061`",
      min: 1,
      optional: true,
    },
    subnet: {
      type: "string",
      label: "Subnet",
      description: "Only proxies inside one /24 block, given as the first three parts of the address, such as `45.61.188`",
      optional: true,
    },
    includeRecentlyAlive: {
      type: "boolean",
      label: "Include Recently Alive",
      description: "Also return proxies that stopped answering within the last 48 hours. They come with the status `recently_alive`.",
      optional: true,
    },
    sortBy: {
      type: "string",
      label: "Sort By",
      description: "The order of the whole list, before the limit applies",
      options: constants.FREE_PROXY_SORT_OPTIONS,
      optional: true,
    },
  },
  async run({ $ }) {
    const params = {
      format: "json",
      limit: this.limit ?? 50,
    };
    if (this.country?.trim()) {
      const country = this.country.trim().toUpperCase();
      if (!constants.COUNTRY_CODE_PATTERN.test(country)) {
        throw new ConfigurationError("Enter a two-letter country code, such as `US` or `DE`.");
      }
      params.country = country;
    }
    if (this.protocols?.length) {
      params.protocol = this.protocols.join(",");
    }
    if (this.anonymity) {
      params.anonymity = this.anonymity;
    }
    if (this.maxLatencyMs) {
      params.max_latency_ms = this.maxLatencyMs;
    }
    if (this.minUptimePct) {
      params.min_uptime_pct = this.minUptimePct;
    }
    if (this.port) {
      params.port = this.port;
    }
    if (this.asn) {
      params.asn = this.asn;
    }
    if (this.subnet?.trim()) {
      const subnet = this.subnet.trim();
      if (!constants.SUBNET_PATTERN.test(subnet)) {
        throw new ConfigurationError("Enter the first three parts of an address, such as `45.61.188`.");
      }
      params.subnet = subnet;
    }
    if (this.includeRecentlyAlive) {
      params.recent = "true";
    }
    if (this.sortBy === "uptime") {
      params.sort = "uptime";
    }

    const response = await this.app.listFreeProxies({
      $,
      params,
    });
    const proxies = Array.isArray(response)
      ? response
      : [];
    const noun = proxies.length === 1
      ? "proxy"
      : "proxies";
    $.export("$summary", `Successfully retrieved ${proxies.length} free ${noun}`);
    return proxies;
  },
};
