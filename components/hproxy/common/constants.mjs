const PLAN_STATUS_OPTIONS = [
  {
    label: "Active plans, the ones that can be used now",
    value: "active",
  },
  {
    label: "All plans, also the ones whose traffic ran out or that were switched off",
    value: "all",
  },
];

const PLAN_STATUS_WORDS = {
  used_up: "used up",
  inactive: "switched off",
};

const TRAFFIC_GRANULARITY_OPTIONS = [
  {
    label: "Automatic: hourly for up to 2 days, daily beyond",
    value: "auto",
  },
  {
    label: "Day",
    value: "day",
  },
  {
    label: "Hour (for windows of up to 29 days)",
    value: "hour",
  },
];

const LINE_PROTOCOL_OPTIONS = [
  {
    label: "HTTP: works in every client, Chrome and other Chromium browsers included",
    value: "http",
  },
  {
    label: "SOCKS5: carries any TCP traffic (Chromium browsers do not send SOCKS5 usernames and passwords)",
    value: "socks5",
  },
];

const OPERATING_SYSTEM_OPTIONS = [
  {
    label: "Android",
    value: "android",
  },
  {
    label: "iOS",
    value: "ios",
  },
  {
    label: "macOS",
    value: "mac",
  },
  {
    label: "Windows",
    value: "windows",
  },
];

const FREE_PROXY_PROTOCOL_OPTIONS = [
  {
    label: "HTTP",
    value: "http",
  },
  {
    label: "HTTPS",
    value: "https",
  },
  {
    label: "SOCKS4",
    value: "socks4",
  },
  {
    label: "SOCKS5",
    value: "socks5",
  },
];

const ANONYMITY_OPTIONS = [
  {
    label: "Elite: hides your IP and that a proxy is in use",
    value: "elite",
  },
  {
    label: "Anonymous: hides your IP but shows that a proxy is in use",
    value: "anonymous",
  },
  {
    label: "Transparent: passes your IP on to the website",
    value: "transparent",
  },
];

const FREE_PROXY_SORT_OPTIONS = [
  {
    label: "Status and speed: proxies answering now first, the fastest first",
    value: "statusAndSpeed",
  },
  {
    label: "Uptime: the most reliable proxies over their lifetime first",
    value: "uptime",
  },
];

// The most proxies one free check takes, and the most entries one exclusion list may carry.
const MAX_PROXIES_PER_CHECK = 1000;
const MAX_EXCLUSIONS = 20;

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-f:.]+$/i;
const SUBNET_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

export default {
  PLAN_STATUS_OPTIONS,
  PLAN_STATUS_WORDS,
  TRAFFIC_GRANULARITY_OPTIONS,
  LINE_PROTOCOL_OPTIONS,
  OPERATING_SYSTEM_OPTIONS,
  FREE_PROXY_PROTOCOL_OPTIONS,
  ANONYMITY_OPTIONS,
  FREE_PROXY_SORT_OPTIONS,
  MAX_PROXIES_PER_CHECK,
  MAX_EXCLUSIONS,
  IPV4_PATTERN,
  IPV6_PATTERN,
  SUBNET_PATTERN,
  COUNTRY_CODE_PATTERN,
};
