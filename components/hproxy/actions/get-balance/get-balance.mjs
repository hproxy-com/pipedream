import app from "../../hproxy.app.mjs";

export default {
  key: "hproxy-get-balance",
  name: "Get Balance",
  description: "Get the wallet balance of your HProxy account. The API key needs the \"Place orders\" permission. [See the documentation](https://hproxy.com/docs/authentication)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
  },
  async run({ $ }) {
    const response = await this.app.getWallet({
      $,
    });
    const cents = Number(response?.balanceCents);
    const balance = Number.isFinite(cents)
      ? `${(cents / 100).toFixed(2)} ${response?.currency ?? "USD"}`
      : "unknown";
    $.export("$summary", `Successfully retrieved the balance: ${balance}`);
    return response;
  },
};
