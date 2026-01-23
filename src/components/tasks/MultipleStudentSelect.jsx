import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import PropTypes from 'prop-types';

export function MultipleStudentSelect({ 
  students = [], 
  selectedStudents = [], 
  onChange 
}) {
  const [open, setOpen] = useState(false);
  const [safeStudents, setSafeStudents] = useState([]);


  useEffect(() => {
    setSafeStudents(Array.isArray(students) ? students : []);
  }, [students]);

  const toggleStudent = (studentName) => {
    if (selectedStudents.includes(studentName)) {
      onChange(selectedStudents.filter(s => s !== studentName));
    } else {
      onChange([...selectedStudents, studentName]);
    }
  };

  const removeStudent = (studentName) => {
    onChange(selectedStudents.filter(s => s !== studentName));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start h-auto min-h-10 py-2"
          >
            {selectedStudents.length > 0 ? (
              <div className="flex flex-wrap gap-1 px-1">
                {selectedStudents.map(student => (
                  <Badge key={student} variant="secondary" className="text-xs">
                    {student}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Select students...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search students..." />
            <CommandEmpty>No students found.</CommandEmpty>
            {safeStudents.length > 0 ? (
              <CommandGroup className="max-h-[300px] overflow-auto">
                {safeStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    onSelect={() => toggleStudent(student.name)}
                    className="flex items-center justify-between"
                  >
                    <span>{student.name}</span>
                    {selectedStudents.includes(student.name) && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <div className="py-6 text-center text-sm">No students available</div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedStudents.map(student => (
            <Badge 
              key={student} 
              variant="outline" 
              className="flex items-center gap-1 pl-2 pr-1 py-1.5"
            >
              {student}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                onClick={() => removeStudent(student)}
              >
                <span className="sr-only">Remove</span>
                <span>×</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

MultipleStudentSelect.propTypes = {
  students: PropTypes.array,
  selectedStudents: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
