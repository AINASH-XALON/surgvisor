import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface FeatureSlider {
  id: string
  name: string
  min: number
  max: number
  step: number
  value: number
  category?: string
}

const FEATURE_PRESETS = {
  nose: [
    { id: 'nose-size', name: 'Size', min: 0.5, max: 1.5, step: 0.01, value: 1 },
    { id: 'nose-slope', name: 'Slope', min: -30, max: 30, step: 1, value: 0 },
    { id: 'nose-bridge', name: 'Bridge Width', min: 0.7, max: 1.3, step: 0.01, value: 1 }
  ],
  lips: [
    { id: 'lips-fullness', name: 'Fullness', min: 0.8, max: 1.5, step: 0.01, value: 1 },
    { id: 'lips-width', name: 'Width', min: 0.8, max: 1.2, step: 0.01, value: 1 }
  ],
  breasts: [
    {
      id: 'implant-size',
      name: 'Implant Size (cc)',
      min: 200,
      max: 800,
      step: 25,
      value: 350,
      category: 'round'
    },
    {
      id: 'implant-projection',
      name: 'Projection',
      min: 1,
      max: 3,
      step: 0.1,
      value: 1.5,
      category: 'round'
    }
  ]
}

const SurgerySimulator = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('')
  const [sliders, setSliders] = useState<FeatureSlider[]>([])
  const [implantType, setImplantType] = useState<'round' | 'gummy-bear'>('round')
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectedFeature) {
      setSliders(FEATURE_PRESETS[selectedFeature as keyof typeof FEATURE_PRESETS])
    }
  }, [selectedFeature])

  const handleFeatureSelect = (feature: string) => {
    setSelectedFeature(feature)
  }

  const handleSliderChange = (sliderId: string, value: number) => {
    setSliders(prev =>
      prev.map(slider =>
        slider.id === sliderId ? { ...slider, value } : slider
      )
    )
  }

  const handleImplantTypeChange = (type: 'round' | 'gummy-bear') => {
    setImplantType(type)
  }

  const handleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Select Feature</h2>
        <div className="space-y-2">
          {Object.keys(FEATURE_PRESETS).map(feature => (
            <button
              key={feature}
              onClick={() => handleFeatureSelect(feature)}
              className={`w-full p-2 text-left rounded ${
                selectedFeature === feature
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </button>
          ))}
        </div>

        {selectedFeature === 'breasts' && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Implant Type</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleImplantTypeChange('round')}
                className={`flex-1 p-2 rounded ${
                  implantType === 'round'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                Round
              </button>
              <button
                onClick={() => handleImplantTypeChange('gummy-bear')}
                className={`flex-1 p-2 rounded ${
                  implantType === 'gummy-bear'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                Gummy Bear
              </button>
            </div>
          </div>
        )}

        {sliders.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Adjustments</h3>
            {sliders.map(slider => (
              <div key={slider.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {slider.name}
                </label>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.value}
                  onChange={(e) =>
                    handleSliderChange(slider.id, parseFloat(e.target.value))
                  }
                  className="w-full mt-1"
                />
                <div className="text-sm text-gray-500">
                  {slider.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Reference Image</h3>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleReferenceUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-2 bg-white rounded hover:bg-gray-50"
          >
            Upload Reference
          </button>
          {referenceImage && (
            <div className="mt-2">
              <img
                src={referenceImage}
                alt="Reference"
                className="w-full rounded"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-900">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          {/* 3D model will be rendered here */}
        </Canvas>
      </div>
    </div>
  )
}

export default SurgerySimulator 