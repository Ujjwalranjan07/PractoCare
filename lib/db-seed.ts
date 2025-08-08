import fs from 'fs';
import path from 'path';

// Initial database seed data
const initialData = {
  "doctors": [
    {
      "id": "1",
      "name": "Dr. Robert Williams",
      "email": "robert@healthplus.com",
      "password": "doctor2023",
      "phone": "+1-555-0101",
      "specialty": "Cardiology",
      "qualifications": "MD, FACC",
      "experience": "15 years",
      "clinicAddress": "Heart Care Center, 123 Medical Plaza, New York",
      "rating": 4.8,
      "reviewCount": 156,
      "consultationFee": 150,
      "videoConsultationFee": 100,
      "availability": {
        "clinic": [
          "Monday",
          "Wednesday",
          "Friday"
        ],
        "online": [
          "Tuesday",
          "Thursday",
          "Saturday"
        ]
      },
      "timeSlots": [
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00"
      ],
      "image": "https://i.postimg.cc/FRdQCcCQ/dr-sarah.jpg",
      "about": "Experienced cardiologist specializing in heart disease prevention and treatment.",
      "consultationType": [
        "clinic",
        "video",
        "call"
      ]
    },
    {
      "id": "2",
      "name": "Dr. Jennifer Lee",
      "email": "jennifer@healthplus.com",
      "password": "doctor2023",
      "phone": "+1-555-0102",
      "specialty": "Dermatology",
      "qualifications": "MD, FAAD",
      "experience": "12 years",
      "clinicAddress": "Skin Care Clinic, 456 Health Street, Los Angeles",
      "rating": 4.9,
      "reviewCount": 203,
      "consultationFee": 120,
      "availability": {
        "clinic": [
          "Monday",
          "Tuesday",
          "Thursday"
        ],
        "online": [
          "Wednesday",
          "Friday",
          "Saturday"
        ]
      },
      "timeSlots": [
        "08:00",
        "09:00",
        "10:00",
        "13:00",
        "14:00",
        "15:00"
      ],
      "image": "https://i.postimg.cc/hvvKB6tN/dr-michael.jpg",
      "about": "Board-certified dermatologist with expertise in skin conditions and cosmetic procedures.",
      "consultationType": [
        "clinic",
        "video",
        "call"
      ]
    }
  ],
  "patients": [
    {
      "id": "1",
      "name": "Emma Thompson",
      "email": "emma@healthplus.com",
      "password": "patient2023",
      "phone": "+1-555-1001"
    }
  ],
  "appointments": []
};

// Function to ensure the db.json file exists with initial data
export function ensureDbExists() {
  try {
    const filePath = path.join(process.cwd(), 'db.json');
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // Create the file with initial data
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log('Created db.json with initial data');
    } else {
      // File exists, check if it has valid JSON
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        // If parsing succeeds, the file is valid
      } catch (parseError) {
        // If parsing fails, the file is corrupted, replace it
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
        console.log('Replaced corrupted db.json with initial data');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring db.json exists:', error);
    return false;
  }
}

// Function to get the database data
export function getDbData() {
  try {
    const filePath = path.join(process.cwd(), 'db.json');
    
    // Ensure the file exists
    ensureDbExists();
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading db.json:', error);
    // Return initial data as fallback
    return initialData;
  }
}

// Function to write data to the database
export function writeDbData(data: any) {
  try {
    const filePath = path.join(process.cwd(), 'db.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}