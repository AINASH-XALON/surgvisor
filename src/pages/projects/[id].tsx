import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

interface ProjectDetails {
  id: string
  name: string
  createdAt: string
  status: string
  type: string
  imageUrl: string
  beforeImageUrl: string
  afterImageUrl: string
  surgeryType: string
  adjustments: {
    [key: string]: number
  }
  report: {
    recommendations: string[]
    procedures: string[]
    estimatedCost: {
      min: number
      max: number
    }
  }
}

export default function ProjectDetails() {
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !id) return

    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', id as string)
        const projectDoc = await getDoc(projectRef)

        if (projectDoc.exists()) {
          setProject({
            id: projectDoc.id,
            ...projectDoc.data()
          } as ProjectDetails)
        } else {
          router.push('/404')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Created on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href={`/simulate?projectId=${project.id}`} className="btn-primary">
              Continue Editing
            </Link>
            <button className="btn-secondary">Download Report</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Before & After
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Before
                  </h3>
                  <img
                    src={project.beforeImageUrl}
                    alt="Before"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    After
                  </h3>
                  <img
                    src={project.afterImageUrl}
                    alt="After"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="card mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Adjustments
              </h2>
              <div className="space-y-4">
                {Object.entries(project.adjustments).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">{value}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-primary-600 rounded-full"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Surgery Report
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Recommended Procedures
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {project.report.procedures.map((procedure, index) => (
                      <li key={index} className="text-gray-600">
                        {procedure}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Additional Recommendations
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {project.report.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-600">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Estimated Cost Range
                  </h3>
                  <p className="text-gray-600">
                    ${project.report.estimatedCost.min.toLocaleString()} -{' '}
                    ${project.report.estimatedCost.max.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Next Steps
              </h2>
              <div className="space-y-4">
                <Link
                  href="/find-surgeon"
                  className="btn-primary w-full justify-center"
                >
                  Find a Surgeon
                </Link>
                <button className="btn-secondary w-full">
                  Share Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 