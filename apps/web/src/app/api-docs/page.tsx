import { notFound } from "next/navigation";
import { SwaggerUIRenderer } from "./renderer";

const isProductionEnvironment = process.env.NODE_ENV === "production";

export default function ApiDocsPage() {
  if (isProductionEnvironment) {
    notFound();
  }

  return <SwaggerUIRenderer />;
}
