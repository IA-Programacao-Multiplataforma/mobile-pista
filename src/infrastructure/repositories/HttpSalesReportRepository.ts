import type { SalesReport } from '../../domain/entities/SalesReport'
import type { SalesReportRepository } from '../../domain/repositories/SalesReportRepository'
import { apiRequest } from '../http/api'
import { toSalesReport, type ApiRelatorioVendas } from '../http/reportApi'

export class HttpSalesReportRepository implements SalesReportRepository {
  async get(): Promise<SalesReport> {
    return toSalesReport(await apiRequest<ApiRelatorioVendas>('/pedido/relatorios/vendas', { auth: true }))
  }
}
