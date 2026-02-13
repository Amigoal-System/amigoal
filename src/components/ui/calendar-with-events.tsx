
"use client"

import * as React from "react"
import { formatDateRange } from "@/lib/little-date"
import { PlusIcon, User, Users, Trophy, Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CreateEventWizard } from "@/components/CreateEventWizard"

export function CalendarWithEvents({ events = [] }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const dayEvents = events.filter(event => new Date(event.from).toDateString() === date?.toDateString());
  
  const handleAddEvent = (newEvent) => {
      // Logic to add event
  }

  const getIconForCategory = (category: string) => {
    switch(category.toLowerCase()) {
      case 'sitzung':
        return <Users className="h-4 w-4" />;
      case 'training':
        return <Dumbbell className="h-4 w-4" />;
      case 'spiel':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  }

  return (
    <>
      <Card className="w-fit py-4">
        <CardContent className="px-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="bg-transparent p-0"
            required
            events={events}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
          <div className="flex w-full items-center justify-between px-1">
            <div className="text-sm font-medium">
              {date?.toLocaleDateString("de-CH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              title="Add Event"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusIcon />
              <span className="sr-only">Add Event</span>
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2 min-h-24">
            {dayEvents.map((event) => (
              <div
                key={event.title + event.from}
                className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
              >
                <div className="font-medium flex items-center gap-2">
                  {getIconForCategory(event.category)}
                  {event.title}
                </div>
                <div className="text-muted-foreground text-xs ml-6">
                  {formatDateRange(new Date(event.from), new Date(event.to))}
                </div>
              </div>
            ))}
            {dayEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Keine Termine an diesem Tag.</p>
            )}
          </div>
        </CardFooter>
      </Card>
      <CreateEventWizard 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateEvent={handleAddEvent}
        preselectedDate={date}
      />
    </>
  )
}
