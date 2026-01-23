import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockActivities = [
  {
    id: '1',
    user: {
      name: 'Emma Johnson',
      initials: 'EJ',
    },
    action: 'submitted',
    subject: 'IELTS score report',
    timestamp: '10 minutes ago',
    status: 'pending',
  },
  {
    id: '2',
    user: {
      name: 'Daniel Lee',
      initials: 'DL',
    },
    action: 'uploaded',
    subject: 'SOP for Stanford University',
    timestamp: '30 minutes ago',
    status: 'active',
  },
  {
    id: '3',
    user: {
      name: 'Sophia Chen',
      initials: 'SC',
    },
    action: 'completed',
    subject: 'visa application form',
    timestamp: '1 hour ago',
    status: 'complete',
  },
  {
    id: '4',
    user: {
      name: 'James Wilson',
      initials: 'JW',
    },
    action: 'received',
    subject: 'offer from MIT',
    timestamp: '2 hours ago',
    status: 'active',
  },
  {
    id: '5',
    user: {
      name: 'Olivia Garcia',
      initials: 'OG',
    },
    action: 'received',
    subject: 'rejection from Harvard',
    timestamp: '3 hours ago',
    status: 'rejected',
  },
];

const statusClasses = {
  pending: 'status-pending',
  active: 'status-active',
  complete: 'status-complete',
  rejected: 'status-rejected',
};

export function ActivityFeed() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.user.image} alt={activity.user.name} />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                <time className="text-xs text-muted-foreground">{activity.timestamp}</time>
              </div>
              <p className="text-sm text-muted-foreground">
                {activity.action}{' '}
                <span className="font-medium text-foreground">{activity.subject}</span>
              </p>
            </div>
            {activity.status && (
              <Badge variant="outline" className={statusClasses[activity.status]}>
                {activity.status}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link to="/activities">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}