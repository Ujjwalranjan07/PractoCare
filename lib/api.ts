const BASE_URL = "/api"

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  qualifications: string
  experience: string
  clinicAddress: string
  consultationFee: number
  videoConsultationFee: number
  callConsultationFee: number
  consultationType?: string[]
  rating?: number
  reviewCount?: number
  about?: string
  image?: string
  availability?: TimeSlot[] | {
    clinic?: string[]
    online?: string[]
  }
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

export interface TimeSlot {
  id: string
  doctorId: string
  date: string
  time: string
  isBooked: boolean
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "approved" // Added 'approved'

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  date: string
  time: string
  status: AppointmentStatus
  doctorName: string
  patientName: string
  specialty: string
  consultationType: "clinic" | "video" | "call"
  symptoms?: string
  fee?: number
}

export interface Review {
  id: string
  appointmentId: string
  doctorId: string
  patientId: string
  rating: number
  reviewText: string
  createdAt: string
}

// Reviews API
export const reviewsAPI = {
  async getByDoctorId(doctorId: string): Promise<Review[]> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews?doctorId=${doctorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },

  async getByAppointmentId(appointmentId: string): Promise<Review | null> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews?appointmentId=${appointmentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch review");
      }
      const reviews = await response.json();
      return reviews.length > 0 ? reviews[0] : null;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },

  async create(reviewData: Omit<Review, "id" | "createdAt">): Promise<Review> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reviewData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create review");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        throw new Error("Failed to update review");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },

  async getPatientReviews(patientId: string): Promise<Review[]> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/reviews?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patient reviews");
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.");
      }
      throw error;
    }
  },
};

// Fetch with retry mechanism
const fetchWithRetry = async (url: string, options = {}, retries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        ...options,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      // If not the last attempt, wait before retrying
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Throw on final attempt
      }
    }
  }
  
  throw new Error("Failed after maximum retries");
}

// Check if server is running with retry mechanism
const checkServerStatus = async (retries = 3, delay = 1000) => {
  try {
    const response = await fetchWithRetry(`${BASE_URL}/doctors`, { method: "HEAD" }, retries, delay);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Auth API
export const authAPI = {
  async login(email: string, password: string, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"
      const response = await fetchWithRetry(`${BASE_URL}/${endpoint}`)
      if (!response.ok) {
        throw new Error("Server not responding. Please check your internet connection or try again later.")
      }
      const users = await response.json()
      const user = users.find((u: any) => u.email === email && u.password === password)
      if (!user) {
        throw new Error("Invalid email or password")
      }
      // Return user with role
      return { ...user, role }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async signup(userData: any, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"
      // Check if user already exists
      const existingResponse = await fetchWithRetry(`${BASE_URL}/${endpoint}`)
      if (existingResponse.ok) {
        const existingUsers = await existingResponse.json()
        const userExists = existingUsers.find((u: any) => u.email === userData.email)
        if (userExists) {
          throw new Error("User with this email already exists")
        }
      }
      const response = await fetchWithRetry(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          id: Date.now().toString(),
          password: userData.password,
        }),
      })
      if (!response.ok) {
        throw new Error("Server not responding. Please check your internet connection or try again later.")
      }
      const user = await response.json()
      return { ...user, role }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
}

// Doctors API
export const doctorsAPI = {
  async getAll(): Promise<Doctor[]> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/doctors`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Doctor> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/doctors/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/doctors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
}

// Patients API
export const patientsAPI = {
  async getById(id: string): Promise<Patient> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/patients/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch patient details")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching patient details:", error)
      throw error
    }
  },
}

// Appointments API
export const appointmentsAPI = {
  async create(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...appointment, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async getByDoctorId(doctorId: string): Promise<Appointment[]> {
    console.log(`Fetching appointments from: ${BASE_URL}/appointments?doctorId=${doctorId}`)
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments?doctorId=${doctorId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async getByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments?patientId=${patientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async reschedule(id: string, newDate: string, newTime: string): Promise<Appointment> {
    console.log(`Attempting to PATCH ${BASE_URL}/appointments/${id} with new date/time and status 'pending'...`)
    console.log("New Date:", newDate, "New Time:", newTime)
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH", // Use PATCH to update specific fields
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: newDate, time: newTime, status: "pending" }), // Set status to pending
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
      }
      const updatedAppointment: Appointment = await response.json()
      console.log("Appointment rescheduled successfully:", updatedAppointment)
      return updatedAppointment
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      throw error
    }
  },
  async updateStatus(id: string, status: Appointment["status"]): Promise<Appointment> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Appointment> {
    try {
      const response = await fetchWithRetry(`${BASE_URL}/appointments/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your internet connection or try again later.")
      }
      throw error
    }
  },
}
