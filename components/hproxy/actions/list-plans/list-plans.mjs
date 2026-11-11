import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-list-plans",
  name: "List Plans",
  description: "List the proxy plans on your HProxy account, with the traffic each has left. [See the documentation](https://hproxy.com/docs/proxy-api/plans)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    status: {
      type: "string",
      label: "Status",
      description: "Which plans to return",
      options: constants.PLAN_STATUS_OPTIONS,
      default: "active",
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.app.listPlans({
      $,
      params: {
        status: this.status ?? "active",
      },
    });
    const plans = Array.isArray(response?.plans)
      ? response.plans
      : [];
    const noun = plans.length === 1
      ? "plan"
      : "plans";
    $.export("$summary", `Successfully retrieved ${plans.length} ${noun}`);
    return plans;
  },
};
