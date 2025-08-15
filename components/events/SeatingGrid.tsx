'use client';

import { VENUE_CONFIGS, DEPARTMENT_COLORS } from '@/lib/constants/departments';

const SeatingGrid = ({ venue, students, assignments, onAssignSeat, selectedStudentId }) => {
  const config = VENUE_CONFIGS[venue];

  if (!config) {
    return <p>Invalid venue configuration.</p>;
  }

  const assignedStudents = new Map(assignments.map(a => [a.seat_number, a.student_id]));
  const studentMap = new Map(students.map(s => [s.id, s]));

  const renderSeats = () => {
    let seats = [];
    for (let row = 1; row <= config.rows; row++) {
      for (let seatNum = 1; seatNum <= config.seatsPerRow; seatNum++) {
        const seatId = `${String.fromCharCode(64 + row)}-${seatNum}`;
        const studentId = assignedStudents.get(seatId);
        const student = studentId ? studentMap.get(studentId) : null;
        const isAssigned = !!student;

        const canAssign = !isAssigned && selectedStudentId;

        seats.push(
          <div
            key={seatId}
            className={`w-12 h-12 rounded-md flex items-center justify-center text-xs font-semibold border transition-all ${canAssign ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''}`}
            style={{ 
              backgroundColor: student ? DEPARTMENT_COLORS[student.department] : '#E5E7EB', 
              color: student ? 'white' : 'black',
            }}
            onClick={() => canAssign && onAssignSeat(seatId)}
            title={student ? `${student.name} (${student.department})` : `Seat ${seatId}`}
          >
            {student ? student.name.split(' ').map(n => n[0]).join('') : seatId}
          </div>
        );
      }
    }
    return seats;
  };

  return (
    <div>
      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: `repeat(${config.seatsPerRow}, minmax(0, 1fr))` }}
      >
        {renderSeats()}
      </div>
    </div>
  );
};

export default SeatingGrid;
