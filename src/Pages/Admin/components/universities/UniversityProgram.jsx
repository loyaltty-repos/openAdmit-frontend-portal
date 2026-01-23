import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Edit, Calendar, DollarSign } from 'lucide-react';
import PropTypes from 'prop-types';


export function UniversityProgram({ universityId, universityName, onProgramAdded }) {
    const [programs, setPrograms] = useState([
        {
            id: 1,
            name: 'Computer Science B.S.',
            description: 'A comprehensive program covering algorithms, data structures, and software development.',
            level: 'Undergraduate',
            duration: '4 years',
            tuition: '$52,000 per year',
            deadline: 'January 15, 2026',
            requirements: ['SAT/ACT scores', '3.5+ GPA', 'Technical background']
        },
        {
            id: 2,
            name: 'Data Science M.S.',
            description: 'Advanced program focused on statistical analysis, machine learning, and data visualization.',
            level: 'Graduate',
            duration: '2 years',
            tuition: '$62,000 per year',
            requirements: ['GRE scores', '3.0+ GPA', 'Programming experience']
        }


    ]);

    const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
    const [isEditProgramOpen, setIsEditProgramOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    const [newProgram, setNewProgram] = useState({
        name: '',
        description: '',
        level: 'Undergraduate',
        duration: '',
        tuition: '',
        deadline: '',
        requirements: ''
    });

    const handleAddProgram = () => {
        const requirementsArray = newProgram.requirements
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const programToAdd = {
            ...newProgram,
            id: programs.length + 1,
            requirements: requirementsArray
        };

        setPrograms([...programs, programToAdd]);
        setIsAddProgramOpen(false);
        resetProgramForm();

        if (onProgramAdded) {
            onProgramAdded(programToAdd);
        }
    };

    const handleEditProgram = () => {
        if (!selectedProgram) return;

        const requirementsArray = typeof newProgram.requirements === 'string'
            ? newProgram.requirements.split(',').map(item => item.trim()).filter(Boolean)
            : newProgram.requirements;

        const updatedPrograms = programs.map(program =>
            program.id === selectedProgram.id ? {
                ...program,
                ...newProgram,
                requirements: requirementsArray
            } : program
        );

        setPrograms(updatedPrograms);
        setIsEditProgramOpen(false);
        resetProgramForm();
    };

    const resetProgramForm = () => {
        setNewProgram({
            name: '',
            description: '',
            level: 'Undergraduate',
            duration: '',
            tuition: '',
            deadline: '',
            requirements: ''
        });
    };

    const handleOpenEditProgram = (program) => {
        setSelectedProgram(program);
        setNewProgram({
            name: program.name,
            description: program.description,
            level: program.level,
            duration: program.duration,
            tuition: program.tuition,
            deadline: program.deadline,
            requirements: program.requirements.join(', ')
        });
        setIsEditProgramOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center">
                        <Building className="mr-2 h-5 w-5" /> {universityName} Programs
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage academic programs offered by {universityName}
                    </p>
                </div>
                <Button onClick={() => setIsAddProgramOpen(true)}>
                    Add Program
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                    <Card key={program.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{program.name}</CardTitle>
                                <Badge>{program.level}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{program.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span>{program.duration}</span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span>{program.tuition}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-1">Application Deadline</h4>
                                <p className="text-sm">{program.deadline}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-1">Requirements</h4>
                                <ul className="text-sm list-disc pl-5 space-y-1">
                                    {program.requirements.map((requirement, idx) => (
                                        <li key={idx}>{requirement}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleOpenEditProgram(program)}
                            >
                                <Edit className="h-4 w-4 mr-1" /> Edit Program
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Add Program Dialog */}
            <Dialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add New Program</DialogTitle>
                        <DialogDescription>
                            Add a new academic program for {universityName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="programName">Program Name</Label>
                            <Input
                                id="programName"
                                placeholder="e.g., Computer Science B.S."
                                value={newProgram.name}
                                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="programDesc">Description</Label>
                            <Textarea
                                id="programDesc"
                                placeholder="Brief description of the program"
                                value={newProgram.description}
                                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="programLevel">Level</Label>
                                <Select
                                    value={newProgram.level}
                                    onValueChange={(value) => setNewProgram({ ...newProgram, level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                        <SelectItem value="Graduate">Graduate</SelectItem>
                                        <SelectItem value="Doctoral">Doctoral</SelectItem>
                                        <SelectItem value="Certificate">Certificate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="programDuration">Duration</Label>
                                <Input
                                    id="programDuration"
                                    placeholder="e.g., 4 years"
                                    value={newProgram.duration}
                                    onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="programTuition">Tuition</Label>
                                <Input
                                    id="programTuition"
                                    placeholder="e.g., $50,000 per year"
                                    value={newProgram.tuition}
                                    onChange={(e) => setNewProgram({ ...newProgram, tuition: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="programDeadline">Application Deadline</Label>
                                <Input
                                    id="programDeadline"
                                    placeholder="e.g., January 15, 2026"
                                    value={newProgram.deadline}
                                    onChange={(e) => setNewProgram({ ...newProgram, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="programRequirements">Requirements (comma-separated)</Label>
                            <Textarea
                                id="programRequirements"
                                placeholder="e.g., SAT/ACT scores, 3.5+ GPA, Technical background"
                                value={newProgram.requirements}
                                onChange={(e) => setNewProgram({ ...newProgram, requirements: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProgramOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddProgram}>Add Program</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Program Dialog */}
            <Dialog open={isEditProgramOpen} onOpenChange={setIsEditProgramOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Program</DialogTitle>
                        <DialogDescription>
                            Update program details for {universityName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editProgramName">Program Name</Label>
                            <Input
                                id="editProgramName"
                                value={newProgram.name}
                                onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editProgramDesc">Description</Label>
                            <Textarea
                                id="editProgramDesc"
                                value={newProgram.description}
                                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editProgramLevel">Level</Label>
                                <Select
                                    value={newProgram.level}
                                    onValueChange={(value) => setNewProgram({ ...newProgram, level: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                        <SelectItem value="Graduate">Graduate</SelectItem>
                                        <SelectItem value="Doctoral">Doctoral</SelectItem>
                                        <SelectItem value="Certificate">Certificate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editProgramDuration">Duration</Label>
                                <Input
                                    id="editProgramDuration"
                                    value={newProgram.duration}
                                    onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editProgramTuition">Tuition</Label>
                                <Input
                                    id="editProgramTuition"
                                    value={newProgram.tuition}
                                    onChange={(e) => setNewProgram({ ...newProgram, tuition: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="editProgramDeadline">Application Deadline</Label>
                                <Input
                                    id="editProgramDeadline"
                                    value={newProgram.deadline}
                                    onChange={(e) => setNewProgram({ ...newProgram, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editProgramRequirements">Requirements (comma-separated)</Label>
                            <Textarea
                                id="editProgramRequirements"
                                value={newProgram.requirements}
                                onChange={(e) => setNewProgram({ ...newProgram, requirements: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditProgramOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditProgram}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

UniversityProgram.propTypes = {
    universityId: PropTypes.number.isRequired,
    universityName: PropTypes.string.isRequired,
    onProgramAdded: PropTypes.func
};
