// Script to update the database with callConsultationFee for all doctors
const fs = require('fs');
const path = require('path');

// Read the current database
const dbPath = path.join(process.cwd(), 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Update each doctor to add callConsultationFee if missing
data.doctors.forEach(doctor => {
  // If callConsultationFee is missing, add it based on videoConsultationFee
  if (!doctor.callConsultationFee && doctor.videoConsultationFee) {
    // Set callConsultationFee to be 75% of videoConsultationFee or 30 as fallback
    doctor.callConsultationFee = Math.round(doctor.videoConsultationFee * 0.75) || 30;
    console.log(`Added callConsultationFee: ${doctor.callConsultationFee} for doctor: ${doctor.name}`);
  }
});

// Write the updated data back to the database
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('Database updated successfully!');