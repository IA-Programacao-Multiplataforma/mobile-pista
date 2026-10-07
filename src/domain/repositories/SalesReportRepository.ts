import type { SalesReport } from '../entities/SalesReport'

export interface SalesReportRepository {
  get(): Promise<SalesReport>
}
