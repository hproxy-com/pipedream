import app from "../../hproxy.app.mjs";

export default {
  key: "hproxy-get-plan",
  name: "Get Plan",
  description: "Get one proxy plan with the traffic it has left, read live from the network. [See the documentation](https://hproxy.com/docs/proxy-api/plans)",
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
  },
  async run({ $ }) {
    const response = await this.app.getPlan({
      $,
      planId: this.planId,
    });
    $.export("$summary", `Successfully retrieved plan ${this.planId}`);
    return response;
  },
};
