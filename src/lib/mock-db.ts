// Mock database for testing without real database connection
export const mockProducts = [
  {
    id: '1',
    name: 'Traditional Tunisian Pottery Bowl',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviews: 24,
    category: 'Pottery',
    stock: 10
  },
  {
    id: '2',
    name: 'Handwoven Berber Rug',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviews: 18,
    category: 'Textiles',
    stock: 5
  },
  {
    id: '3',
    name: 'Silver Filigree Necklace',
    price: 65.99,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviews: 31,
    category: 'Jewelry',
    stock: 8
  },
  {
    id: '4',
    name: 'Leather Handbag',
    price: 75.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
    reviews: 15,
    category: 'Leather',
    stock: 12
  }
]

export const mockWorkshops = [
  {
    id: '1',
    title: 'Traditional Pottery Making',
    description: 'Learn the ancient art of Tunisian pottery from master craftsmen. Create your own ceramic pieces using traditional techniques.',
    price: 120,
    date: 'March 15, 2024',
    duration: '4 hours',
    location: 'Nabeul, Tunisia',
    maxParticipants: 12,
    category: 'Pottery',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '2',
    title: 'Berber Weaving Techniques',
    description: 'Master the traditional Berber weaving methods. Learn to create beautiful rugs and textiles with authentic patterns.',
    price: 150,
    date: 'March 22, 2024',
    duration: '6 hours',
    location: 'Kairouan, Tunisia',
    maxParticipants: 8,
    category: 'Textiles',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '3',
    title: 'Silver Filigree Jewelry',
    description: 'Create stunning silver jewelry using traditional Tunisian filigree techniques. Perfect for beginners and advanced students.',
    price: 100,
    date: 'March 29, 2024',
    duration: '5 hours',
    location: 'Tunis, Tunisia',
    maxParticipants: 10,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
]

export const mockTrainings = [
  {
    id: '1',
    title: 'Complete Pottery Mastery',
    description: 'Comprehensive 6-week program covering all aspects of traditional Tunisian pottery, from basic techniques to advanced glazing.',
    price: 800,
    startDate: 'April 1, 2024',
    endDate: 'May 15, 2024',
    duration: '6 weeks',
    location: 'Nabeul Art Center',
    maxStudents: 15,
    level: 'Beginner to Advanced',
    certificate: true,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '2',
    title: 'Professional Textile Design',
    description: 'Advanced training program for textile designers. Learn traditional patterns, modern applications, and business skills.',
    price: 1200,
    startDate: 'April 8, 2024',
    endDate: 'June 20, 2024',
    duration: '10 weeks',
    location: 'Kairouan Textile Institute',
    maxStudents: 12,
    level: 'Intermediate',
    certificate: true,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '3',
    title: 'Jewelry Business Development',
    description: 'Learn to turn your jewelry skills into a profitable business. Covers design, production, marketing, and sales strategies.',
    price: 600,
    startDate: 'April 15, 2024',
    endDate: 'May 30, 2024',
    duration: '6 weeks',
    location: 'Tunis Business Center',
    maxStudents: 20,
    level: 'Advanced',
    certificate: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
]

export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@arti.tn',
    role: 'ADMIN'
  },
  {
    id: '2',
    name: 'Test Client',
    email: 'client@example.com',
    role: 'CLIENT'
  }
]
