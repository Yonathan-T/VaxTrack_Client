import { apiClient } from "./api-client";

export interface ChildProfile {
  id: number | string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: string;
  national_id?: string | null;
  address?: string;
  kebele?: string;
  woreda?: string;
  house_number?: string;
  user_id?: number;
  registered_by?: number;
  facility_id?: number;
  created_at?: string;
  updated_at?: string;
  display_address?: string;
  facility?: {
    id: number;
    name: string;
    location: string;
    phone: string;
    address: string;
    woreda?: string | null;
    registration_code?: string;
    daily_capacity?: number;
  };
  vaccination_records?: VaccinationRecord[];
  appointments?: Appointment[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  parent?: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

export interface Appointment {
  id: string | number;
  child_id?: number | string;
  childId?: string | number;
  child?: {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    parent?: {
      id: number;
      name: string;
      phone: string;
      email: string;
    };
  };
  childName?: string;
  scheduled_date?: string;
  scheduled_at?: string;
  dateTime?: string;
  appointment_date?: string;
  status:
  | "scheduled"
  | "completed"
  | "missed"
  | "rescheduled"
  | "confirmed"
  | "pending"
  | "cancelled"
  | "checked-in"
  | "overdue";
  appointmentType?: string;
  vaccine?: {
    id: number;
    name: string;
    code: string;
  };
  vaccination_records?: {
    id: number;
    vaccine: {
      name: string;
      code: string;
    };
    status: string;
  }[];
  vaccine_id?: number;
  facility_id?: number;
  facility?: {
    id: number;
    name: string;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  batchNumber: string;
  administeredBy: string;
}

export interface Inventory {
  id: string;
  vaccineName: string;
  quantity: number;
  expiryDate: string;
  batchNumber: string;
  status: "low" | "adequate" | "expired";
}

export interface TodayDueChild {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  total_pending: number;
  overdue_count: number;
  due_this_week: any[];
  overdue_vaccines: {
    id: number;
    child_id: number;
    vaccine_id: number;
    scheduled_date: string;
    status: string;
    vaccine: {
      id: number;
      code: string;
      name: string;
    };
  }[];
}

export interface TodayDueResponse {
  success: boolean;
  today: string;
  data: TodayDueChild[];
}

export interface Capacity {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}

export async function getChildrenList(searchQuery?: string) {
  const url = searchQuery
    ? `/v1/children?search=${encodeURIComponent(searchQuery)}`
    : "/v1/children";
  return apiClient.get<{
    data: ChildProfile[];
    current_page: number;
    total: number;
    per_page: number;
  }>(url);
}

export async function getChildProfile(childId: string) {
  return apiClient.get<ChildProfile>(`/v1/children/${childId}`);
}

export async function registerNewChild(data: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth?: string;
  sex: string;
  relationship_to_child: string;
  address: string;
  kebele: string;
  woreda: string;
  house_number?: string;
  parent_phone?: string;
  parent_email: string;
}) {
  return apiClient.post("/v1/children", data);
}

export async function scheduleAppointment(data: {
  childId: string;
  vaccine: string;
  appointmentDate: string;
  appointmentTime: string;
  facility: string;
  sendSMS?: boolean;
  sendEmail?: boolean;
  notes?: string;
}) {
  return apiClient.post("/v1/appointments", data);
}

export async function getAppointmentsList(params?: { search?: string; date?: string; all?: boolean }) {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.date) query.append("date", params.date);

  const queryString = query.toString();
  const url = queryString ? `/v1/appointments?${queryString}` : "/v1/appointments";
  return apiClient.get<{ data: Appointment[] } | Appointment[]>(url);
}

export async function getAppointmentDetails(appointmentId: string | number) {
  return apiClient.get<{ data: Appointment } | Appointment>(
    `/v1/appointments/${appointmentId}`
  );
}

export async function updateAppointment(
  appointmentId: string | number,
  data: {
    scheduled_date?: string;
    status?: "scheduled" | "completed" | "missed" | "rescheduled" | "cancelled";
    notes?: string;
    vaccine_id?: number;
  }
) {
  return apiClient.put(`/v1/appointments/${appointmentId}`, data);
}

export async function rescheduleAppointment(
  appointmentId: string | number,
  newDate: string,
  newTime?: string
) {
  const scheduledDate = newTime ? `${newDate} ${newTime}` : newDate;
  return apiClient.put(`/v1/appointments/${appointmentId}`, {
    scheduled_date: scheduledDate,
    status: "rescheduled",
  });
}

export async function cancelAppointment(appointmentId: string | number) {
  return apiClient.put(`/v1/appointments/${appointmentId}`, {
    status: "cancelled",
  });
}

export async function getFacilityCapacity(
  facilityId: string | number,
  date: string
) {
  return apiClient.get<{ data: Capacity } | Capacity>(
    `/v1/facilities/${facilityId}/capacity?date=${date}`
  );
}

export async function administerVaccine(
  vaccinationRecordId: string,
  data: {
    // Backend expects snake_case keys
    date_administered: string;
    batch_number?: string;
    dose_ml?: number;
    dose_number?: number;
  }
) {
  return apiClient.post(
    `/v1/vaccination-records/${vaccinationRecordId}/administer`,
    data
  );
}

// New: direct vaccination recording endpoint
export async function recordVaccination(data: {
  vaccine_id: number;
  date_administered: string;
  batch_number: string;
  administration_site: string;
  expiry_date: string;
  dose_ml?: number;
  dose_number?: number;
  notes?: string;
}) {
  return apiClient.post(`/v1/vaccinations`, data);
}

export async function getInventory() {
  return apiClient.get<{ inventory: Inventory[] }>("/v1/inventory");
}

export async function getStockAlerts() {
  return apiClient.get<{ alerts: any[] }>("/v1/alerts");
}

export async function addStock(data: {
  vaccine_id: number;
  batch_number: string;
  quantity: number;
  expiry_date: string;
  supplier?: string;
  notes?: string;
}) {
  // Note: facility_id is automatically taken from the logged-in user's facility
  return apiClient.post("/v1/inventory/receive", data);
}

export async function getTodayDue() {
  return apiClient.get<TodayDueResponse>("/v1/nurse/today-due");
}
