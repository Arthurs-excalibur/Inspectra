import { Injectable } from "@nestjs/common";
import { PostgresDatabaseService } from "@/database/postgres-database.service";

@Injectable()
export class DashboardService {
  constructor(private readonly database: PostgresDatabaseService) {}

  async getOverview(ownerId: string) {
    const [sessions, reports] = await Promise.all([
      this.database.sessions.find({ where: { ownerId } }),
      this.database.listReports(ownerId),
    ]);

    const issues = await this.database.issues.find({
      where: reports.map(r => ({ reportId: r.id }))
    });

    const completed = sessions.filter((session) => session.status === "completed").length;
    const failed = sessions.filter((session) => session.status === "failed").length;
    const totalFinished = completed + failed;

    return {
      statistics: {
        testsRunToday: sessions.length,
        passRate: totalFinished > 0 ? Math.round((completed / totalFinished) * 1000) / 10 : 100,
        activeSessions: sessions.filter((session) => session.status === "running" || session.status === "paused").length,
        criticalIssues: issues.filter((issue) => issue.severity === "critical").length,
        aiConfidenceScore:
          sessions.length > 0
            ? Math.round((sessions.reduce((sum, session) => sum + Number(session.confidence), 0) / sessions.length) * 100)
            : 0,
      },
      activeSessions: sessions.filter((session) => session.status === "running" || session.status === "paused"),
      recentReports: reports.slice(-5).reverse(),
      recentActivity: [
        ...sessions.slice(-5).map((session) => ({
          type: "session",
          title: session.objective,
          status: session.status,
          timestamp: session.updatedAt,
        })),
        ...reports.slice(-5).map((report) => ({
          type: "report",
          title: report.title,
          status: report.severity,
          timestamp: report.createdAt,
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    };
  }
}
