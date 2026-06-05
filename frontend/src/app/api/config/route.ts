import { NextRequest, NextResponse } from "next/server";

let appConfig = {
  dataSource: "mock",
  fhirBaseUrl: "",
  gpConnectEndpoint: "",
  apiKey: "",
};

export async function GET() {
  return NextResponse.json({ config: appConfig });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  appConfig = {
    dataSource: body.dataSource ?? appConfig.dataSource,
    fhirBaseUrl: body.fhirBaseUrl ?? appConfig.fhirBaseUrl,
    gpConnectEndpoint: body.gpConnectEndpoint ?? appConfig.gpConnectEndpoint,
    apiKey: body.apiKey ?? appConfig.apiKey,
  };
  return NextResponse.json({ config: appConfig });
}
