import { ConfigurationError } from "@pipedream/platform";
import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-generate-proxy-lines",
  name: "Generate Proxy Lines",
  description: "Create ready-to-use proxy lines (`host:port:username:password`) from one of your plans, rotating or sticky, with country, state, city, ISP or network targeting. [See the documentation](https://hproxy.com/docs/proxy-api/plans)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: false,
  },
  props: {
    app,
    planId: {
      propDefinition: [
        app,
        "planId",
        () => ({
          status: "active",
        }),
      ],
      description: "The plan to generate lines from. Only active plans with traffic left can generate.",
    },
    count: {
      type: "integer",
      label: "Count",
      description: "How many lines to return, from 1 to 5,000. Some plans allow fewer, and the answer then names the limit.",
      min: 1,
      max: 5000,
      default: 1,
    },
    protocol: {
      type: "string",
      label: "Protocol",
      description: "The protocol the lines speak",
      options: constants.LINE_PROTOCOL_OPTIONS,
      default: "http",
      optional: true,
    },
    stickyMinutes: {
      type: "integer",
      label: "Sticky Session (Minutes)",
      description: "Leave empty for rotating lines, where every request can leave from a different IP. Set minutes for sticky lines that keep one IP for that long: Residential Premium takes 3 to 1,440 minutes, and on Residential Lite any value keeps the IP for as long as the line is in use.",
      min: 1,
      max: 1440,
      optional: true,
    },
    country: {
      propDefinition: [
        app,
        "country",
      ],
      description: "Two-letter country code or English country name of the exit IP, such as `US`. Leave empty for any country.",
    },
    state: {
      type: "string",
      label: "State",
      description: "State or region of the exit IP, such as `California`, where the plan takes it",
      optional: true,
    },
    city: {
      type: "string",
      label: "City",
      description: "City of the exit IP, such as `New York`, where the plan takes it",
      optional: true,
    },
    isp: {
      type: "string",
      label: "ISP",
      description: "Internet provider of the exit IP by name, such as `Comcast`. Residential Plus plans.",
      optional: true,
    },
    asn: {
      type: "integer",
      label: "Network (ASN)",
      description: "Network of the exit IP by AS number, such as `7922`, together with a country. Residential Premium plans.",
      min: 1,
      optional: true,
    },
    os: {
      type: "string",
      label: "Operating System",
      description: "Device type the exit IP belongs to. Residential Premium plans.",
      options: constants.OPERATING_SYSTEM_OPTIONS,
      optional: true,
    },
    strict: {
      type: "boolean",
      label: "Strict Targeting",
      description: "Whether a request fails when no IP matches the exact target. Off, the line falls back to another IP in the same country. Residential Premium plans.",
      optional: true,
    },
    udp: {
      type: "boolean",
      label: "UDP",
      description: "Whether SOCKS5 lines may relay UDP traffic. Needs the SOCKS5 protocol. Residential Premium plans.",
      optional: true,
    },
    excludeCountries: {
      type: "string[]",
      label: "Exclude Countries",
      description: "Up to 20 two-letter country codes to avoid when no country is set, such as `CN`. Residential Premium plans.",
      optional: true,
    },
    excludeStates: {
      type: "string[]",
      label: "Exclude States",
      description: "Up to 20 states or regions to avoid inside the country. Residential Premium plans.",
      optional: true,
    },
    excludeCities: {
      type: "string[]",
      label: "Exclude Cities",
      description: "Up to 20 cities to avoid inside the country. Residential Premium plans.",
      optional: true,
    },
    excludeAsn: {
      type: "string[]",
      label: "Exclude Networks (ASN)",
      description: "Up to 20 AS numbers to avoid, such as `7018`. Residential Premium plans.",
      optional: true,
    },
  },
  methods: {
    cleanList(values, label) {
      const list = (values ?? [])
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0);
      if (list.length > constants.MAX_EXCLUSIONS) {
        throw new ConfigurationError(`The "${label}" field lists ${list.length} entries. HProxy takes up to ${constants.MAX_EXCLUSIONS} per request.`);
      }
      return list;
    },
  },
  async run({ $ }) {
    const data = {
      count: this.count ?? 1,
      protocol: this.protocol ?? "http",
    };
    const textFields = [
      "country",
      "state",
      "city",
      "isp",
    ];
    for (const field of textFields) {
      if (typeof this[field] === "string" && this[field].trim()) {
        data[field] = this[field].trim();
      }
    }
    if (this.stickyMinutes) {
      data.stickyMinutes = this.stickyMinutes;
    }
    if (this.asn) {
      data.asn = this.asn;
    }
    if (this.os) {
      data.os = this.os;
    }
    if (typeof this.strict === "boolean") {
      data.strict = this.strict;
    }
    if (typeof this.udp === "boolean") {
      data.udp = this.udp;
    }

    const exclusions = {
      excludeCountries: this.cleanList(this.excludeCountries, "Exclude Countries"),
      excludeStates: this.cleanList(this.excludeStates, "Exclude States"),
      excludeCities: this.cleanList(this.excludeCities, "Exclude Cities"),
    };
    for (const [
      field,
      list,
    ] of Object.entries(exclusions)) {
      if (list.length > 0) {
        data[field] = list;
      }
    }
    const networks = this.cleanList(this.excludeAsn, "Exclude Networks (ASN)");
    if (networks.length > 0) {
      if (networks.some((value) => !/^\d+$/.test(value))) {
        throw new ConfigurationError("The \"Exclude Networks (ASN)\" field takes whole AS numbers, such as `7922`.");
      }
      data.excludeAsn = networks.map(Number);
    }

    const response = await this.app.generateProxyLines({
      $,
      planId: this.planId,
      data,
    });
    const lines = Array.isArray(response?.lines)
      ? response.lines
      : [];
    const noun = lines.length === 1
      ? "line"
      : "lines";
    $.export("$summary", `Successfully generated ${lines.length} proxy ${noun}`);
    return response;
  },
};
