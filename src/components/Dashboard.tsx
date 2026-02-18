'use client'

import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink
} from 'lucide-react'
import LinkedInProfile from './LinkedInProfile'
import { useUser } from '@/contexts/UserContext'

export default function Dashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    connectionsSent: 0,
    messagesSent: 0,
    responseRate: 0
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'application',
      title: 'Applied to Software Engineer at Google',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'connection',
      title: 'Sent connection request to John Doe at Microsoft',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'message',
      title: 'Sent follow-up message to Sarah Smith',
      time: '1 day ago',
      status: 'delivered'
    },
    {
      id: 4,
      type: 'application',
      title: 'Applied to Frontend Developer at Apple',
      time: '2 days ago',
      status: 'interview'
    }
  ])

  const [upcomingInterviews, setUpcomingInterviews] = useState([
    {
      id: 1,
      company: 'Apple',
      position: 'Frontend Developer',
      date: '2024-01-15',
      time: '2:00 PM',
      type: 'Phone Screen'
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Software Engineer',
      date: '2024-01-18',
      time: '10:00 AM',
      type: 'Technical Interview'
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'interview':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-5 h-5 text-indigo-500" />
      case 'connection':
        return <Users className="w-5 h-5 text-green-500" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      default:
        return <Briefcase className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your job search automation progress
        </p>
      </div>

      {/* LinkedIn Profile Status */}
      <div className="mb-8">
        <LinkedInProfile userId={user?.id || ''} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">
                    Total Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">
                    Pending Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">
                    Interviews Scheduled
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.interviewsScheduled}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-700 truncate">
                    Response Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.responseRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            {getActivityIcon(activity.type)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {activity.title}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-700 flex items-center">
                            {getStatusIcon(activity.status)}
                            <span className="ml-2">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upcoming Interviews
            </h3>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {interview.position}
                      </h4>
                      <p className="text-sm text-gray-700">{interview.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {interview.date}
                      </p>
                      <p className="text-sm text-gray-700">{interview.time}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {interview.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <Briefcase className="w-4 h-4 mr-2" />
              Search Jobs
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
              <Users className="w-4 h-4 mr-2" />
              Find Connections
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
