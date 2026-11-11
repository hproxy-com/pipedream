import app from "../../hproxy.app.mjs";
import constants from "../../common/constants.mjs";

export default {
  key: "hproxy-get-plan-traffic",
  name: "Get Plan Traffic",
  description: "Get the traffic one proxy plan used over a window of up to 30 days, hour by hour or day by day. [See the documentation](https://hproxy.com/docs/proxy-api/plans)",
  version: "0.0.1",
  type: "action",
  annotations: {
    destructiveHint: false,
    openWorldHint: true,
    readOnlyHint: true,
  },
  props: {
    app,
    planId: {
      propDefinition: [
        app,
        "planId",
      ],
    },
    days: {
      type: "integer",
      label: "Days",
      description: "The window ending now, from 1 to 30 days",
      min: 1,
      max: 30,
      default: 7,
      optional: true,
    },
    granularity: {
      type: "string",
      label: "Granularity",
      description: "The size of each point in the answer",
      options: constants.TRAFFIC_GRANULARITY_OPTIONS,
      optional: true,
    },
  },
  async run({ $ }) {
    const days = this.days ?? 7;
    const params = {
      days,
    };
    if (this.granularity && this.granularity !== "auto") {
      params.granularity = this.granularity;
    }

    const response = await this.app.getPlanStats({
      $,
      planId: this.planId,
      params,
    });
    $.export("$summary", `Successfully retrieved the traffic of plan ${this.planId} for the last ${days} days`);
    return response;
  },
};
