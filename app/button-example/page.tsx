'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ButtonExamplePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Button Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Primary Button</CardTitle>
            <CardDescription>
              Blue gradient with proper contrast and smooth transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button variant="primary" size="default">
              Book Appointment
            </Button>
            <Button variant="primary" size="sm">
              Small Button
            </Button>
            <Button variant="primary" size="lg">
              Large Button
            </Button>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Button Variants</CardTitle>
            <CardDescription>
              Comparison with existing button styles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button variant="default">
              Default Button
            </Button>
            <Button variant="secondary">
              Secondary Button
            </Button>
            <Button variant="outline">
              Outline Button
            </Button>
            <Button variant="ghost">
              Ghost Button
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}