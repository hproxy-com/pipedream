import { ConfigurationError } from "@pipedream/platform";
import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-look-up-ip",
  name: "Look Up IP",
  description: "Get the country, city, network and ISP of an IP address, and whether it belongs to a data center. No HProxy plan is needed. [See the documentation](https://hproxy.com/docs)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    ip: {
      propDefinition: [
        app,
        "ip",
      ],
    },
  },
  async run({ $ }) {
    const ip = String(this.ip ?? "").trim();
    const looksLikeIpv6 = ip.includes(":") && constants.IPV6_PATTERN.test(ip);
    if (!constants.IPV4_PATTERN.test(ip) && !looksLikeIpv6) {
      throw new ConfigurationError("Enter one public IPv4 or IPv6 address, such as `8.8.8.8`.");
    }

    const response = await this.app.lookUpIp({
      $,
      ip,
    });
    const place = [
      response?.city,
      response?.country_name || response?.country,
    ]
      .filter(Boolean)
      .join(", ");
    const where = place
      ? `: ${place}`
      : "";
    $.export("$summary", `Successfully looked up ${ip}${where}`);
    return response;
  },
};
