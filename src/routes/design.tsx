import { createFileRoute } from '@tanstack/react-router'
import { DesignSpecimen } from '@/features/design/components/DesignSpecimen'

export const Route = createFileRoute('/design')({
  component: DesignSpecimen,
})
