"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Library, Coffee, Users, Clock } from "lucide-react"
import Link from "next/link"

// Avoid SSR for Leaflet map (references window/document)
const MapComponent = dynamic(() => import("@/components/map-component").then(m => m.MapComponent), { ssr: false })

interface StudyLocation {
  id: string
  name: string
  type: "library" | "cafe" | "study_room" | "outdoor"
  position: [number, number]
  description: string
  capacity: string
  hours: string
  amenities: string[]
}

export default function StudyLocationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const studyLocations: StudyLocation[] = [
    {
      id: "1",
      name: "Near East University Main Library",
      type: "library",
      position: [35.2283, 33.3211],
      description: "Main campus library with extensive study areas and resources",
      capacity: "500+ students",
      hours: "8:00 AM - 10:00 PM",
      amenities: ["WiFi", "Computers", "Private Study Rooms", "Printing"],
    },
    {
      id: "2",
      name: "Engineering Faculty Study Hall",
      type: "study_room",
      position: [35.229, 33.322],
      description: "Dedicated study space for engineering students",
      capacity: "100 students",
      hours: "24/7 Access",
      amenities: ["WiFi", "Whiteboards", "Group Tables", "Power Outlets"],
    },
    {
      id: "3",
      name: "Campus Cafe & Study Lounge",
      type: "cafe",
      position: [35.2275, 33.32],
      description: "Relaxed atmosphere with coffee and snacks",
      capacity: "50 students",
      hours: "7:00 AM - 11:00 PM",
      amenities: ["WiFi", "Coffee", "Snacks", "Comfortable Seating"],
    },
    {
      id: "4",
      name: "Central Garden Study Area",
      type: "outdoor",
      position: [35.228, 33.3215],
      description: "Outdoor study space with benches and tables",
      capacity: "30 students",
      hours: "Sunrise - Sunset",
      amenities: ["WiFi", "Shade", "Fresh Air", "Quiet Environment"],
    },
    {
      id: "5",
      name: "Medical Faculty Library",
      type: "library",
      position: [35.2295, 33.3205],
      description: "Specialized library for medical students",
      capacity: "200 students",
      hours: "8:00 AM - 8:00 PM",
      amenities: ["WiFi", "Medical Resources", "Study Rooms", "Computers"],
    },
  ]

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "library":
        return <Library className="w-5 h-5 text-[#8B1538]" />
      case "cafe":
        return <Coffee className="w-5 h-5 text-amber-600" />
      case "study_room":
        return <Users className="w-5 h-5 text-blue-600" />
      case "outdoor":
        return <MapPin className="w-5 h-5 text-green-600" />
      default:
        return <MapPin className="w-5 h-5" />
    }
  }

  const getLocationColor = (type: string) => {
    switch (type) {
      case "library":
        return "bg-[#8B1538] hover:bg-[#A91D3A]"
      case "cafe":
        return "bg-amber-600 hover:bg-amber-700"
      case "study_room":
        return "bg-blue-600 hover:bg-blue-700"
      case "outdoor":
        return "bg-green-600 hover:bg-green-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  const mapMarkers = studyLocations.map((location) => ({
    position: location.position,
    title: location.name,
    description: location.description,
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Study Locations</h1>
          <p className="text-muted-foreground">Find the perfect place to study on campus</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#8B1538]" />
                  Near East University Campus
                </CardTitle>
                <CardDescription>Click on markers to see location details</CardDescription>
              </CardHeader>
              <CardContent>
                <MapComponent
                  center={[35.2283, 33.3211]}
                  zoom={16}
                  markers={mapMarkers}
                  className="h-[600px] w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Locations List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Locations</CardTitle>
                <CardDescription>{studyLocations.length} study spots on campus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {studyLocations.map((location) => (
                  <Card
                    key={location.id}
                    className={`cursor-pointer transition-all ${
                      selectedLocation === location.id ? "border-[#8B1538] bg-[#8B1538]/5" : ""
                    }`}
                    onClick={() => setSelectedLocation(location.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="mt-1">{getLocationIcon(location.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{location.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {location.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {selectedLocation === location.id && (
                        <div className="space-y-2 pt-3 border-t">
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Capacity: {location.capacity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{location.hours}</span>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs font-semibold mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {location.amenities.map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button className={`w-full mt-2 ${getLocationColor(location.type)}`} size="sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            Get Directions
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
