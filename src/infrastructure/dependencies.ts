import { AddEventSession } from '../application/use-cases/AddEventSession'
import { AdjustSector } from '../application/use-cases/AdjustSector'
import { ClearBag } from '../application/use-cases/ClearBag'
import { CreateEvent } from '../application/use-cases/CreateEvent'
import { DeleteEvent } from '../application/use-cases/DeleteEvent'
import { GetBag } from '../application/use-cases/GetBag'
import { GetCurrentUser } from '../application/use-cases/GetCurrentUser'
import { GetEventDetails } from '../application/use-cases/GetEventDetails'
import { GetOrder } from '../application/use-cases/GetOrder'
import { GetSalesReport } from '../application/use-cases/GetSalesReport'
import { GetQueueStatus } from '../application/use-cases/GetQueueStatus'
import { JoinQueue } from '../application/use-cases/JoinQueue'
import { LeaveQueue } from '../application/use-cases/LeaveQueue'
import { ListEvents } from '../application/use-cases/ListEvents'
import { ListManagedEvents } from '../application/use-cases/ListManagedEvents'
import { ListMyOrders } from '../application/use-cases/ListMyOrders'
import { ListMyTickets } from '../application/use-cases/ListMyTickets'
import { LoginUser } from '../application/use-cases/LoginUser'
import { LogoutUser } from '../application/use-cases/LogoutUser'
import { PlaceOrder } from '../application/use-cases/PlaceOrder'
import { RegisterUser } from '../application/use-cases/RegisterUser'
import { SetBag } from '../application/use-cases/SetBag'
import { HttpAuthRepository } from './repositories/HttpAuthRepository'
import { HttpEventAdminRepository } from './repositories/HttpEventAdminRepository'
import { HttpEventRepository } from './repositories/HttpEventRepository'
import { HttpOrderRepository } from './repositories/HttpOrderRepository'
import { HttpQueueRepository } from './repositories/HttpQueueRepository'
import { HttpSalesReportRepository } from './repositories/HttpSalesReportRepository'

const authRepository = new HttpAuthRepository()
const eventAdminRepository = new HttpEventAdminRepository()
const eventRepository = new HttpEventRepository()
const queueRepository = new HttpQueueRepository()
const orderRepository = new HttpOrderRepository()
const salesReportRepository = new HttpSalesReportRepository()

export const loginUser = new LoginUser(authRepository)
export const registerUser = new RegisterUser(authRepository)
export const getCurrentUser = new GetCurrentUser(authRepository)
export const logoutUser = new LogoutUser(authRepository)

export const listEvents = new ListEvents(eventRepository)
export const getEventDetails = new GetEventDetails(eventRepository)

export const joinQueue = new JoinQueue(queueRepository)
export const getQueueStatus = new GetQueueStatus(queueRepository)
export const leaveQueue = new LeaveQueue(queueRepository)
export const setBag = new SetBag(queueRepository)
export const getBag = new GetBag(queueRepository)
export const clearBag = new ClearBag(queueRepository)

export const placeOrder = new PlaceOrder(orderRepository)
export const getOrder = new GetOrder(orderRepository)
export const listMyOrders = new ListMyOrders(orderRepository)
export const listMyTickets = new ListMyTickets(orderRepository)

export const listManagedEvents = new ListManagedEvents(eventAdminRepository)
export const createEvent = new CreateEvent(eventAdminRepository)
export const addEventSession = new AddEventSession(eventAdminRepository)
export const adjustSector = new AdjustSector(eventAdminRepository)
export const deleteEvent = new DeleteEvent(eventAdminRepository)
export const getSalesReport = new GetSalesReport(salesReportRepository)
