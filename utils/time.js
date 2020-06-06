export const isActiveProgram = (program) => {
  const startTime = new Date(program.start).toLocaleTimeString();
  const endTime = new Date(program.end).toLocaleTimeString();
  const currentTime = new Date().toLocaleTimeString();
  const active = startTime < currentTime && currentTime < endTime;
  return active;
};

export const progress = (program) => {
  const programStartTime = program.start_time;
  const programEndTime = program.end_time;
  const programDuration = programEndTime - programStartTime;
  const percentage = Math.floor(
    ((Date.now() - programStartTime) / programDuration) * 100
  );
  return percentage;
};
