"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { openapiSpec } from "@/lib/swagger/openapi-spec";

export function SwaggerUIRenderer() {
  return (
    <section style={{ height: "100vh" }}>
      <SwaggerUI spec={openapiSpec} />
    </section>
  );
}
