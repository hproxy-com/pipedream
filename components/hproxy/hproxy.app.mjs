import { axios } from "@pipedream/platform";
import constants from "./common/constants.mjs";

export default {
  type: "app",
  app: "hproxy",
  propDefinitions: {
    planId: {
      type: "string",
      label: "Plan",
      description: "The plan to use. Select one from the list, or enter its ID, such as `cmjfmhhpd004c4i4hqsk3mzrr`.",
      async options({ status = "all" }) {
        const { plans = [] } = await this.listPlans({
          params: {
            status,
          },
        });
        return plans.map((plan) => ({
          label: this._planLabel(plan),
          value: plan.id,
        }));
      },
    },
    ip: {
      type: "string",
      label: "IP Address",
      description: "One public IPv4 or IPv6 address, such as `8.8.8.8` or `2001:4860:4860::8888`.",
    },
    country: {
      type: "string",
      label: "Country",
      description: "A two-letter country code, such as `US` or `DE`.",
      optional: true,
    },
  },
  methods: {
    _baseUrl() {
      return "https://hproxy.com";
    },
    // HProxy's free tools (the free proxy list, the proxy checker, the IP lookup) take no key,
    // so the key is only sent where the API asks for it.
    _headers(keyed) {
      const headers = {
        Accept: "application/json",
      };
      if (keyed) {
        headers["X-API-Key"] = this.$auth.api_key;
      }
      return headers;
    },
    _makeRequest({
      $ = this, path, keyed = true, ...args
    } = {}) {
      return axios($, {
        ...args,
        url: `${this._baseUrl()}${path}`,
        headers: this._headers(keyed),
      });
    },
    _gigabytes(value) {
      const gb = Number.isFinite(value)
        ? value
        : 0;
      return String(Math.round(gb * 100) / 100);
    },
    // One plan as the list shows it, such as "Residential Premium, 3.2 of 10 GB left (shop-1)".
    _planLabel(plan) {
      const product = String(plan.productId || "Plan")
        .split(/[-_]/)
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const parts = [
        product,
      ];
      if (typeof plan.dataGbTotal === "number") {
        parts.push(`${this._gigabytes(plan.dataGbRemaining)} of ${this._gigabytes(plan.dataGbTotal)} GB left`);
      }
      if (constants.PLAN_STATUS_WORDS[plan.status]) {
        parts.push(constants.PLAN_STATUS_WORDS[plan.status]);
      }
      const name = parts.join(", ");
      return plan.label
        ? `${name} (${plan.label})`
        : name;
    },
    getAccount(args = {}) {
      return this._makeRequest({
        path: "/api/v1/me",
        ...args,
      });
    },
    getWallet(args = {}) {
      return this._makeRequest({
        path: "/api/v1/wallet",
        ...args,
      });
    },
    getUsage(args = {}) {
      return this._makeRequest({
        path: "/api/v1/usage",
        ...args,
      });
    },
    listPlans(args = {}) {
      return this._makeRequest({
        path: "/api/v1/plans",
        ...args,
      });
    },
    getPlan({
      planId, ...args
    } = {}) {
      return this._makeRequest({
        path: `/api/v1/plans/${encodeURIComponent(planId)}`,
        ...args,
      });
    },
    getPlanStats({
      planId, ...args
    } = {}) {
      return this._makeRequest({
        path: `/api/v1/plans/${encodeURIComponent(planId)}/stats`,
        ...args,
      });
    },
    generateProxyLines({
      planId, ...args
    } = {}) {
      return this._makeRequest({
        method: "POST",
        path: `/api/v1/plans/${encodeURIComponent(planId)}/generate`,
        ...args,
      });
    },
    listFreeProxies(args = {}) {
      return this._makeRequest({
        keyed: false,
        path: "/api/proxy-list",
        ...args,
      });
    },
    checkProxies(args = {}) {
      return this._makeRequest({
        keyed: false,
        method: "POST",
        path: "/api/proxy-check",
        ...args,
      });
    },
    lookUpIp({
      ip, ...args
    } = {}) {
      return this._makeRequest({
        keyed: false,
        path: `/api/ip/${ip}`,
        ...args,
      });
    },
  },
};
