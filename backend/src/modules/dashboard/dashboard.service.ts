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

    // Aggregate trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendData = await this.database.sessions
      .createQueryBuilder("session")
      .select("TO_CHAR(session.startedAt, 'Mon') as day")
      .addSelect("COUNT(*) filter (where session.status = 'completed') as passed")
      .addSelect("AVG(EXTRACT(EPOCH FROM (session.completedAt - session.startedAt))) * 1000 as response")
      .where("session.startedAt > :sevenDaysAgo", { sevenDaysAgo })
      .groupBy("day")
      .getRawMany();

    return {
      statistics: {
        testsRunToday: sessions.filter(s => s.startedAt > new Date(new Date().setHours(0,0,0,0))).length,
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
          timestamp: session.startedAt,
        })),
        ...reports.slice(-5).map((report) => ({
          type: "report",
          title: report.title,
          status: report.severity,
          timestamp: report.createdAt,
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      trend: trendData.length > 0 ? trendData.map(d => ({
        day: d.day,
        passed: parseInt(d.passed),
        response: Math.round(parseFloat(d.response || "0"))
      })) : [
        { day: "Today", passed: 0, response: 0 }
      ],
      severity: [
        { name: "Critical", value: issues.filter(i => i.severity === "critical").length, fill: "#ff6f83" },
        { name: "Warning", value: issues.filter(i => i.severity === "warning").length, fill: "#ffbe5a" },
        { name: "Info", value: issues.filter(i => i.severity === "info").length, fill: "#5ad7ff" },
      ]
    };
  }
}
