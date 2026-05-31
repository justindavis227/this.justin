export async function GET() {
  return Response.json({
    dashboard_password_set: !!process.env.DASHBOARD_PASSWORD,
    dashboard_password_length: process.env.DASHBOARD_PASSWORD?.length ?? 0,
    auth_secret_set: !!process.env.AUTH_SECRET,
    node_env: process.env.NODE_ENV,
  })
}
