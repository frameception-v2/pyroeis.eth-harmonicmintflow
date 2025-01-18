import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOiA4ODcyNDYsICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMTY3MDRlNyJ9",
      payload: "eyJkb21haW4iOiAicHlyb2Vpc2V0aC1oYXJtb25pY21pbnRmbG93LnZlcmNlbC5hcHAifQ",
      signature: "MHhiMmQyYmUzMzZiZWE0YmFjZmU4NjQxYjNkY2YzNDQxNDMxOTBlZjQ5N2YwMWRjMGQ2ZTMwOWZlZDE5YmU5ZDA1MGFjMmM0ODU1NDg2ZWJjMWUwYTdiMjVkYzQxYzQzMmIzMjMxZTNmMTJmMzE5NzY0ZmI0ZDIyMGZkZDMzMDUwYTFj"
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
