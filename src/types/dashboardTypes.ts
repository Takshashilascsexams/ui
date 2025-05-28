// Base interfaces
export interface DashboardStats {
  totalExams: number;
  totalQuestions: number;
  totalStudents: number;
  averagePassRate: number;
  growth?: {
    exams: GrowthMetric;
    questions: GrowthMetric;
    students: GrowthMetric;
    passRate: GrowthMetric;
  };
}

export interface GrowthMetric {
  current?: number;
  previous?: number;
  percentage: number;
  trend: "up" | "down";
}

export interface Activity {
  id?: string;
  type: "exam" | "question" | "student" | "result";
  title: string;
  description: string;
  timestamp: string;
  priority?: "normal" | "high";
  details?: Record<string, unknown>;
}

export interface PerformanceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
  currentMetrics?: {
    averageScore: number;
    passRate: number;
    completionRate: number;
  };
}

// Dashboard Overview Types
export interface DashboardOverview {
  statistics: {
    totalExams: number;
    totalQuestions: number;
    totalStudents: number;
    totalAttempts: number;
    averagePassRate: number;
    averageScore: number;
  };
  growth: {
    exams: GrowthData;
    questions: GrowthData;
    students: GrowthData;
    attempts: GrowthData;
  };
  examDistribution: CategoryDistribution[];
  topPerformingExams: ExamPerformance[];
  activitySummary: ActivitySummary;
  systemHealth: SystemHealthSummary;
  lastUpdated: string;
  dataTimestamp: string;
}

export interface GrowthData {
  current: number;
  previous: number;
  percentage: number;
  trend: "up" | "down";
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface ExamPerformance {
  examId?: string;
  title: string;
  category: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
}

export interface ActivitySummary {
  activeExams: number;
  questionsPool: number;
  registeredStudents: number;
  monthlyGrowth: {
    exams: number;
    students: number;
  };
}

export interface SystemHealthSummary {
  examCreationRate: number;
  studentEngagement: number;
  contentQuality: number;
  systemLoad: string;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  overview: {
    totalAttempts: number;
    completedAttempts: number;
    passedAttempts: number;
    passRate: number;
    completionRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  trends: TrendData[];
  distribution?: ScoreDistribution[];
  participation?: ParticipationData;
  examWise?: ExamWiseMetrics[];
  metadata: {
    timeRange: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
    totalDataPoints: number;
  };
}

export interface TrendData {
  date: string;
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
  completionRate: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  averageScore: number;
}

export interface ParticipationData {
  totalStudents: number;
  trend: ParticipationTrend[];
}

export interface ParticipationTrend {
  date: string;
  uniqueStudents: number;
  totalAttempts: number;
  participationRate: number;
}

export interface ExamWiseMetrics {
  examId?: string;
  examTitle: string;
  examCategory: string;
  totalMarks: number;
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
  averageScorePercentage: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number;
}

// Recent Activity Types
export interface RecentActivityResponse {
  activities: Activity[];
  totalCount: number;
  lastUpdated: string;
}

// System Health Types
export interface SystemHealth {
  overall: {
    status: "healthy" | "warning" | "critical";
    score: number;
    timestamp: string;
  };
  database: {
    status: "connected" | "disconnected";
    details: DatabaseHealth;
  };
  redis: {
    status: "connected" | "disconnected";
    details: RedisHealth;
  };
  system: {
    uptime: number;
    memory: MemoryUsage;
    cpu: CpuUsage;
    node: NodeInfo;
  };
  application: ApplicationMetrics;
  performance: {
    responseTime: number;
    lastCheck: string;
  };
}

export interface DatabaseHealth {
  healthy: boolean;
  readyState?: number;
  readyStateText?: string;
  host?: string;
  port?: number;
  name?: string;
  collections?: number;
  dataSize?: number;
  indexSize?: number;
  objects?: number;
  error?: string;
}

export interface RedisHealth {
  healthy: boolean;
  error?: string;
}

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  usage: number;
}

export interface CpuUsage {
  usage: {
    user: number;
    system: number;
  };
  platform: string;
  architecture: string;
}

export interface NodeInfo {
  version: string;
  pid: number;
  uptime: number;
}

export interface ApplicationMetrics {
  environment: string;
  activeConnections: number;
  serverUptime: number;
  lastRestart: string;
  features: {
    examCreation: string;
    userRegistration: string;
    examTaking: string;
    resultGeneration: string;
  };
  performance: {
    avgResponseTime: string;
    errorRate: string;
    throughput: string;
  };
  error?: string;
}

// API Response Types (for services)
export interface DashboardStatsResponse {
  overview: {
    totalExams: number;
    totalQuestions: number;
    totalStudents: number;
    averagePassRate: number;
  };
  growth: {
    exams: {
      current?: number;
      previous?: number;
      percentage: number;
      trend: "up" | "down";
    };
    questions: {
      current?: number;
      previous?: number;
      percentage: number;
      trend: "up" | "down";
    };
    students: {
      current?: number;
      previous?: number;
      percentage: number;
      trend: "up" | "down";
    };
    passRate: {
      current?: number;
      previous?: number;
      percentage: number;
      trend: "up" | "down";
    };
  };
}

export interface DashboardOverviewResponse {
  statistics: {
    totalExams: number;
    totalQuestions: number;
    totalStudents: number;
    totalAttempts: number;
    averagePassRate: number;
    averageScore: number;
  };
  growth: {
    exams: GrowthData;
    questions: GrowthData;
    students: GrowthData;
    attempts: GrowthData;
  };
  examDistribution: CategoryDistribution[];
  topPerformingExams: ExamPerformance[];
  activitySummary: ActivitySummary;
  systemHealth: SystemHealthSummary;
  lastUpdated: string;
  dataTimestamp?: string;
}

export interface DashboardAnalyticsResponse {
  overview: AnalyticsOverview;
  trends: AnalyticsTrends;
  categories: AnalyticsCategories;
  performance: AnalyticsPerformance;
  engagement: AnalyticsEngagement;
  content: AnalyticsContent;
  system: AnalyticsSystem;
  metadata: {
    timeRange: string;
    currentPeriod: { start: string; end: string };
    comparisonPeriod: { start: string; end: string } | null;
    generatedAt: string;
    includeForecasts: boolean;
  };
  forecasts?: AnalyticsForecasts;
}

// Analytics sub-types
export interface AnalyticsOverview {
  current: {
    exams: number;
    students: number;
    attempts: number;
    questions: number;
    completions: number;
    passes: number;
    passRate: number;
  };
  comparison: {
    exams: number;
    students: number;
    attempts: number;
    questions: number;
    completions: number;
    passRate: number;
  } | null;
}

export interface AnalyticsTrends {
  daily: DailyTrend[];
  movingAverages: MovingAverage[];
}

export interface DailyTrend {
  date: string;
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  passRate: number;
  uniqueUsers: number;
}

export interface MovingAverage {
  date: string;
  avgAttempts: number;
  avgPassRate: number;
}

export interface AnalyticsCategories {
  category: string;
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
  averageScorePercentage: number;
  averageDuration: number;
  examCount: number;
}

export interface AnalyticsPerformance {
  topPerformers: TopPerformer[];
  underPerformers: UnderPerformer[];
  difficultyAnalysis: DifficultyAnalysis[];
}

export interface TopPerformer {
  examId: string;
  title: string;
  category: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface UnderPerformer {
  examId: string;
  title: string;
  category: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface DifficultyAnalysis {
  difficulty: string;
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface AnalyticsEngagement {
  totalStudents: number;
  activeStudents: number;
  engagementRate: number;
  averageAttempts: number;
  retentionRate: number;
  averageExamVariety: number;
}

export interface AnalyticsContent {
  examsByCategory: ExamByCategory[];
  questionsByType: QuestionByType[];
}

export interface ExamByCategory {
  category: string;
  count: number;
  averageQuestions: number;
  averageMarks: number;
  averageDuration: number;
  premiumPercentage: number;
}

export interface QuestionByType {
  type: string;
  count: number;
  averageMarks: number;
}

export interface AnalyticsSystem {
  systemLoad: {
    examCreationRate: number;
    questionCreationRate: number;
    userRegistrationRate: number;
    attemptCompletionRate: number;
  };
  healthStatus: string;
  uptime: number;
  memoryUsage: number;
}

export interface AnalyticsForecasts {
  nextWeekPrediction: {
    expectedAttempts: number;
    expectedPassRate: number;
    confidence: string;
  };
  trends: {
    attempts: string;
    passRate: string;
  };
  message?: string;
}

// Chart and UI Types
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Error Types
export interface ApiError {
  status: string;
  message: string;
  error?: string;
  code?: number;
}

export interface ApiResponse<T> {
  status: string;
  fromCache?: boolean;
  data: T;
  message?: string;
}
