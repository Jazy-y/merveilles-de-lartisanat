'use client'

import { 
  getUserWorkshopBookings, 
  getUserTrainingEnrollments, 
  updateWorkshopBookingStatus, 
  updateTrainingEnrollmentStatus, 
  WorkshopBooking,
  TrainingEnrollment,
  getWorkshopById,
  getTrainingById
} from './database-init'

export type Booking = (WorkshopBooking & { type: 'workshop', title: string, date: string, time: string }) | (TrainingEnrollment & { type: 'training', title: string, date: string, time: string });

export const getMyBookings = async (userId: string): Promise<Booking[]> => {
  const workshopBookings = await getUserWorkshopBookings(userId);
  const trainingEnrollments = await getUserTrainingEnrollments(userId);

  const bookings: Booking[] = [];

  for (const booking of workshopBookings) {
    const workshop = await getWorkshopById(booking.workshopId);
    if (workshop) {
      bookings.push({ ...booking, type: 'workshop', title: workshop.title, date: booking.selectedDate || '', time: workshop.hours || 'N/A' });
    }
  }

  for (const enrollment of trainingEnrollments) {
    const training = await getTrainingById(enrollment.trainingId);
    if (training) {
      bookings.push({ ...enrollment, type: 'training', title: training.title, date: enrollment.selectedDate || '', time: 'N/A' });
    }
  }

  return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const cancelBooking = async (bookingId: string, type: 'workshop' | 'training') => {
  if (type === 'workshop') {
    await updateWorkshopBookingStatus(bookingId, 'CANCELLED');
  } else {
    await updateTrainingEnrollmentStatus(bookingId, 'CANCELLED');
  }
}
