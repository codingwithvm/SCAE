import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const databaseServerVersionResult = await prisma.$queryRaw<
      [{ server_version: string }]
    >`SHOW server_version`;
    const databaseServerVersion = databaseServerVersionResult[0].server_version;

    const databaseMaxConnectionsResult = await prisma.$queryRaw<
      [{ max_connections: string }]
    >`SHOW max_connections`;
    const databaseMaxConnections = parseInt(
      databaseMaxConnectionsResult[0].max_connections,
    );

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await prisma.$queryRaw<
      [{ count: number }]
    >`SELECT count(*)::int FROM pg_stat_activity WHERE datname = ${databaseName}`;
    const databaseOpenedConnections = databaseOpenedConnectionsResult[0].count;

    return NextResponse.json({
      status: "healthy",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "connected",
          version: databaseServerVersion,
          max_connections: databaseMaxConnections,
          opened_connections: databaseOpenedConnections,
        },
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: "disconnected",
          },
        },
      },
      { status: 503 },
    );
  }
}
