import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import { Camera } from '@mediapipe/camera_utils'
import { FaceMesh } from '@mediapipe/face_mesh'
import { useNavigate } from 'react-router-dom'

const FaceScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let faceMesh: FaceMesh | null = null
    let camera: Camera | null = null

    const initializeFaceMesh = async () => {
      await tf.ready()
      
      faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        }
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      faceMesh.onResults(onResults)

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMesh) {
              await faceMesh.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480
        })
        camera.start()
      }
    }

    const onResults = (results: any) => {
      if (!results.multiFaceLandmarks) return

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw face mesh
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1
          })
        }
      }
    }

    if (isScanning) {
      initializeFaceMesh()
    }

    return () => {
      if (camera) camera.stop()
      if (faceMesh) faceMesh.close()
    }
  }, [isScanning])

  const startScan = () => {
    setIsScanning(true)
  }

  const completeScan = () => {
    setIsScanning(false)
    setScanComplete(true)
    // Save face data and navigate to simulator
    navigate('/simulate')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Face Scanner</h1>
      
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={640}
          height={480}
        />
        
        {!isScanning && !scanComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startScan}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Start Face Scan
            </button>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={completeScan}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Complete Scan
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Position your face in the center of the frame</li>
          <li>Ensure good lighting conditions</li>
          <li>Keep your face neutral and still</li>
          <li>Remove glasses or other accessories</li>
        </ul>
      </div>
    </div>
  )
}

export default FaceScanner 