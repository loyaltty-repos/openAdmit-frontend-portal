import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CalendarClock } from 'lucide-react';

const mockDeadlines = [
  {
    id: '1',
    title: 'TOEFL Registration',
    date: '2023-10-15',
    daysLeft: 3,
  },
  {
    id: '2',
    title: 'University Application',
    date: '2023-11-01',
    daysLeft: 20,
  },
  {
    id: '3',
    title: 'Scholarship Deadline',
    date: '2023-10-30',
    daysLeft: 18,
  },
  {
    id: '4',
    title: 'Housing Application',
    date: '2023-12-15',
    daysLeft: 64,
  },
];

export function DeadlinesCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDeadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{deadline.title}</p>
                <p className="text-xs text-muted-foreground">{deadline.date}</p>
              </div>
              <div
                className={`px-2 py-1 text-xs rounded-md ${
                  deadline.daysLeft <= 5
                    ? 'bg-destructive/10 text-destructive'
                    : deadline.daysLeft <= 14
                    ? 'bg-warning/10 text-warning'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {deadline.daysLeft} days
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}