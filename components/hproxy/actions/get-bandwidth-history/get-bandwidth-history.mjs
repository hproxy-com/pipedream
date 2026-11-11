import app from "../../hproxy.app.mjs";

export default {
  key: "hproxy-get-bandwidth-history",
  name: "Get Bandwidth History",
  description: "Get the traffic your proxy plans used, day by day and plan by plan, for up to the last 365 days. [See the documentation](https://hproxy.com/docs/proxy-api/plans)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    days: {
      type: "integer",
      label: "Days",
      description: "The last days to include, today counted, from 1 to 365",
      min: 1,
      max: 365,
      default: 30,
      optional: true,
    },
    planId: {
      propDefinition: [
        app,
        "planId",
      ],
      description: "Only count the traffic of this plan. Leave empty for every plan.",
      optional: true,
    },
  },
  async run({ $ }) {
    const days = this.days ?? 30;
    const params = {
      days,
    };
    if (this.planId) {
      params.plan_id = this.planId;
    }

    const response = await this.app.getUsage({
      $,
      params,
    });
    $.export("$summary", `Successfully retrieved the bandwidth history of the last ${days} days`);
    return response;
  },
};
