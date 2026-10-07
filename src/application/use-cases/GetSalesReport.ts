import type { SalesReportRepository } from '../../domain/repositories/SalesReportRepository'

export class GetSalesReport {
  private readonly reports: SalesReportRepository

  constructor(reports: SalesReportRepository) {
    this.reports = reports
  }

  execute() {
    return this.reports.get()
  }
}
