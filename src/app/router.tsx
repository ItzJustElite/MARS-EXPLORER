import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Explore } from '@/pages/Explore'
import { Atlas } from '@/pages/Atlas'
import { MissionPlanner } from '@/pages/MissionPlanner'
import { Archive } from '@/pages/Archive'
import { ROUTES } from '@/lib/routing'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path={ROUTES.EXPLORE} element={<Explore />} />
          <Route path={ROUTES.ATLAS} element={<Atlas />} />
          <Route path={ROUTES.MISSIONS} element={<MissionPlanner />} />
          <Route path={ROUTES.ARCHIVE} element={<Archive />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
