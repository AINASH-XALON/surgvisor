import { useState, useEffect } from 'react'
import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { useAuth } from '../contexts/AuthContext'

interface Surgeon {
  id: string
  name: string
  specialty: string
  address: string
  rating: number
  reviews: number
  lat: number
  lng: number
  imageUrl: string
  procedures: string[]
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const center = {
  lat: 34.0522,
  lng: -118.2437
}

export default function FindSurgeon() {
  const [surgeons, setSurgeons] = useState<Surgeon[]>([])
  const [selectedSurgeon, setSelectedSurgeon] = useState<Surgeon | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places']
  })

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          console.error('Error getting location')
        }
      )
    }

    // Mock data - replace with actual API call
    const mockSurgeons: Surgeon[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Facial Plastic Surgery',
        address: '123 Beverly Hills Dr, Beverly Hills, CA 90210',
        rating: 4.8,
        reviews: 156,
        lat: 34.0736,
        lng: -118.4004,
        imageUrl: '/surgeons/sarah-johnson.jpg',
        procedures: ['Rhinoplasty', 'Facelift', 'Eyelid Surgery']
      },
      {
        id: '2',
        name: 'Dr. Michael Chen',
        specialty: 'Body Contouring',
        address: '456 Wilshire Blvd, Los Angeles, CA 90048',
        rating: 4.9,
        reviews: 203,
        lat: 34.0628,
        lng: -118.3594,
        imageUrl: '/surgeons/michael-chen.jpg',
        procedures: ['Liposuction', 'Tummy Tuck', 'Brazilian Butt Lift']
      }
    ]

    setSurgeons(mockSurgeons)
    setLoading(false)
  }, [])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Find a Plastic Surgeon
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by location or procedure"
              className="input-primary pr-10"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={userLocation || center}
                options={{
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                }}
              >
                {surgeons.map((surgeon) => (
                  <Marker
                    key={surgeon.id}
                    position={{ lat: surgeon.lat, lng: surgeon.lng }}
                    onClick={() => setSelectedSurgeon(surgeon)}
                  />
                ))}

                {selectedSurgeon && (
                  <InfoWindow
                    position={{ lat: selectedSurgeon.lat, lng: selectedSurgeon.lng }}
                    onCloseClick={() => setSelectedSurgeon(null)}
                  >
                    <div className="p-2">
                      <h3 className="font-medium">{selectedSurgeon.name}</h3>
                      <p className="text-sm text-gray-600">{selectedSurgeon.specialty}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          </div>

          <div className="space-y-6">
            {surgeons.map((surgeon) => (
              <div
                key={surgeon.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <img
                    src={surgeon.imageUrl}
                    alt={surgeon.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {surgeon.name}
                    </h3>
                    <p className="text-sm text-gray-600">{surgeon.specialty}</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        {surgeon.rating} ({surgeon.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Procedures
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {surgeon.procedures.map((procedure) => (
                      <span
                        key={procedure}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {procedure}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600">{surgeon.address}</p>
                </div>

                <div className="mt-4 flex space-x-4">
                  <button className="btn-primary flex-1">
                    Book Consultation
                  </button>
                  <button className="btn-secondary flex-1">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 